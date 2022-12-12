import {
    AccountInfo,
    Connection,
    GetProgramAccountsFilter,
    PublicKey,
} from "@solana/web3.js";

import { Reserve, ReserveData } from "../../domain/reserve";
import { FLASH_LOAN_ID } from "../../utils/const";
import { reserveDecode } from "./decode";
import { reserveLayout } from "./layout/reserve";

type Account = { pubkey: PublicKey, account: AccountInfo<Buffer> };
type Accounts = Account[];

export class AccountService {
    constructor(private connection: Connection) {}

    public getAllReserves(programId: PublicKey = FLASH_LOAN_ID): Promise<Reserve[]> {
        return this.getProgramAccounts(programId, [{dataSize: reserveLayout.span}])
            .then((accounts) =>
                accounts.map(({ account, pubkey }) => new Reserve(reserveDecode(account.data), pubkey))
            );
    }

    public getReserveInfo(reserveAddress: PublicKey): Promise<Reserve> {
        return this.getAccountInfo<ReserveData>(reserveAddress, reserveDecode).then((data: ReserveData) => new Reserve(data, reserveAddress));
    }

    private getProgramAccounts(publicKey: PublicKey, filters?: GetProgramAccountsFilter[]): Promise<Accounts> {
        return this.connection.getProgramAccounts(publicKey,  { filters });
    }

    private getAccountInfo<T>(publicKey: PublicKey, decoder: (buffer: Buffer) => T): Promise<T> {
        return this.connection.getAccountInfo(publicKey)
            .then((accountInfo: AccountInfo<Buffer> | null) => {
                if (!accountInfo) {
                    return Promise.reject(`getAccountInfo: account ${publicKey.toBase58()} not found`);
                }
                return decoder(accountInfo.data);
            });
    }
}