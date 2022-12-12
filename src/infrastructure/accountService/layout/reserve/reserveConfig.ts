import { blob, struct } from "@solana/buffer-layout";
import { u64, publicKey } from "@solana/buffer-layout-utils";

import { ReserveConfig } from "../../../../domain/reserve";

import { reserveFeesLayout } from "./reserveFees";

interface ReserveConfigWithPadding extends ReserveConfig {
    _future_padding1: Uint8Array;
    _future_padding2: Uint8Array;
}

export const reserveConfigLayout = struct<ReserveConfigWithPadding>([
    reserveFeesLayout,
    u64('deposit_limit'),
    publicKey('fee_receiver'),
    blob(32, '_future_padding1'),
    blob(32, '_future_padding2'),
], 'config');
