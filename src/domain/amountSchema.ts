import { struct } from "@solana/buffer-layout";
import { u64 } from "@solana/buffer-layout-utils";

export const amountSchema = struct<{ amount: bigint }>([u64('amount')]);
