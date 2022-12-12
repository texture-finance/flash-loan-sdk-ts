import { blob, struct, u8 } from "@solana/buffer-layout";
import { publicKey, u64 } from "@solana/buffer-layout-utils";

import { ReserveData } from "../../../../domain/reserve"

import { reserveLiquidityLayout } from "./reserveLiquidity";
import { reserveLpTokensLayout } from "./reserveLpTokens";
import { reserveConfigLayout } from "./reserveConfig";

interface ReserveDataWithPadding extends ReserveData {
    _padding: Uint8Array;
    _future_padding: Uint8Array;
}

export const reserveLayout = struct<ReserveDataWithPadding>([
    u8('version'),
    blob(7, '_padding'),
    u64('last_update'),
    publicKey('lending_market'),
    reserveLiquidityLayout,
    reserveLpTokensLayout,
    reserveConfigLayout,
    blob(40, '_future_padding'),
]);
