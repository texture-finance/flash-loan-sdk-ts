import { reserveLayout } from "./layout/reserve";

export function reserveDecode(data: Buffer) {
    return reserveLayout.decode(data);
}