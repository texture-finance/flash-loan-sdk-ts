import {
    PublicKey,
    SYSVAR_INSTRUCTIONS_PUBKEY,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { ReserveLiquidity } from "./reserveLiquidity";
import { ReserveLpTokens } from "./reserveLpTokens";
import { ReserveConfig } from "./reserveConfig";
import { FLASH_LOAN_ID } from "../../utils/const";
import { amountSchema } from "../../domain/amountSchema";
import { FlashLoanInstruction } from "#domain/instructions";

export interface ReserveData {
    version: number;
    last_update: bigint;
    lending_market: PublicKey;
    liquidity: ReserveLiquidity;
    lp_tokens_info: ReserveLpTokens,
    config: ReserveConfig;
}

enum FeeCalculation {
    /// Fee added to amount: fee = rate * amount
    Exclusive,
    /// Fee included in amount: fee = (rate / (1 + rate)) * amount
    Inclusive,
}

type Fees = { borrowFee: number, textureFee: number };

interface Meta {
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
}

export class Reserve {
    constructor(
        private readonly data: ReserveData,
        private readonly pubkey: PublicKey,
    ) {}

    public fee(amount: number, feeCalculation: FeeCalculation = FeeCalculation.Exclusive): number {
        const borrowFeeRate = Number(this.data.config.fees.flash_loan_fee_wad) / 1e18;
        const textureFeeRate = this.data.config.fees.texture_fee_percentage / 1e3;
        if (borrowFeeRate > 0 && amount > 0) {
            let needToAssessTextureFee = textureFeeRate > 0;
            const minimumFee = needToAssessTextureFee ? 2 : 1;

            let borrowFeeAmount;
            switch (feeCalculation) {
                case FeeCalculation.Exclusive:
                    borrowFeeAmount = amount * borrowFeeRate;
                    break;
                case FeeCalculation.Inclusive:
                    borrowFeeAmount = amount * (borrowFeeRate / (1 + borrowFeeRate));
                    break;
            }

            const borrowFee = Math.max(borrowFeeAmount, minimumFee);
            if (borrowFee >= amount) {
                throw new Error('Borrow amount is too small to receive liquidity after fees')
            }

            const textureFee = needToAssessTextureFee ? (
                Math.max(borrowFee * textureFeeRate, 1)
            ) : 0;

            return borrowFee;
        }
        return 0;
    }

    public availableLiquidity(): number {
        return Number(this.data.liquidity.available_amount);
    }

    public flashBorrow(amount: bigint, destination: PublicKey): TransactionInstruction {
        const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
            [this.data.lending_market.toBuffer()],
            FLASH_LOAN_ID,
        );
        const keys = [
            Reserve.meta(this.data.liquidity.supply_pubkey, false, true),
            Reserve.meta(destination, false, true),
            Reserve.meta(this.pubkey, false, true),
            Reserve.meta(this.data.lending_market, false, false),
            Reserve.meta(lendingMarketAuthority, false, false),
            Reserve.meta(SYSVAR_INSTRUCTIONS_PUBKEY, false, false),
            Reserve.meta(TOKEN_PROGRAM_ID, false, false),
        ];

        const buffer = Buffer.alloc(8);
        amountSchema.encode({ amount }, buffer);

        return this.instruction(keys, Buffer.from([
            FlashLoanInstruction.FlashBorrow,
            ...buffer,
        ]));
    }

    public flashRepay(amount: bigint, source: PublicKey, authority: PublicKey): TransactionInstruction {

        const keys = [
            Reserve.meta(source, false, true),
            Reserve.meta(this.data.liquidity.supply_pubkey, false, true),
            Reserve.meta(this.data.config.fee_receiver, false, true),
            Reserve.meta(this.pubkey, false, true),
            Reserve.meta(this.data.lending_market, false, false),
            Reserve.meta(authority, true, false),
            Reserve.meta(SYSVAR_INSTRUCTIONS_PUBKEY, false, false),
            Reserve.meta(TOKEN_PROGRAM_ID, false, false),
        ];

        const buffer = Buffer.alloc(8);
        amountSchema.encode({ amount }, buffer);

        return this.instruction(keys, Buffer.from([
            FlashLoanInstruction.FlashRepay,
            ...buffer,
        ]));
    }

    private instruction(keys: Meta[], data: Buffer, programId: PublicKey = FLASH_LOAN_ID) {
        return new TransactionInstruction({
            keys,
            programId,
            data,
        });
    }

    private static meta(pubkey: PublicKey, isSigner: boolean, isWritable: boolean): Meta {
        return { pubkey, isSigner, isWritable };
    }
}
