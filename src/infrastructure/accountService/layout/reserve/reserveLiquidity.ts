import { struct } from "@solana/buffer-layout";
import { publicKey, u64 } from "@solana/buffer-layout-utils";

import { ReserveLiquidity } from "../../../../domain/reserve";

export const reserveLiquidityLayout = struct<ReserveLiquidity>([
    publicKey('mint_pubkey'),
    u64('mint_decimals'),
    publicKey('supply_pubkey'),
    u64('available_amount'),
], 'liquidity');
