import { struct } from "@solana/buffer-layout";
import { publicKey, u64 } from "@solana/buffer-layout-utils";

import { ReserveLpTokens } from "../../../../domain/reserve";

export const reserveLpTokensLayout = struct<ReserveLpTokens>([
    publicKey('mint_pubkey'),
    u64('mint_total_supply'),
    publicKey('supply_pubkey'),
], 'lp_tokens_info');
