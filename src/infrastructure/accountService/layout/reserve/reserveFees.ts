import { u64 } from "@solana/buffer-layout-utils";
import { blob, struct, u8 } from "@solana/buffer-layout";

import { ReserveFees } from "../../../../domain/reserve";

interface ReserveFeesWithPadding extends ReserveFees {
    _padding: Uint8Array;
}

export const reserveFeesLayout = struct<ReserveFeesWithPadding>([
    u64('flash_loan_fee_wad'),
    u8('texture_fee_percentage'),
    blob(7, '_padding'),
], 'fees');
