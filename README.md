![NPM](https://img.shields.io/npm/l/@texture-finance/solana-flash-loan-sdk)

# Flash Loan SDK

## Usage:
SDK can call FlashBorrow and FlashRepay instructions of FLashLoan contract

## Install 
```shell
npm i @texture-finance/solana-flash-loan-sdk
```
or 
```shell
yarn add @texture-finance/solana-flash-loan-sdk
```

## Code examples
```typescript
import { Connection, PublicKey } from '@solana/web3.js';

import { AccountService, Reserve } from 'solana-flash-loan-sdk';

const connection = new Connection('http://localhost:8899');
const walletAdapter = new SolflareWalletAdapter;

/**
 * get all reserves by program id
 */
const FLASH_LOAN_PROGRAM_ID = new PublicKey('fLaesa4r3XHTsKxxdW9gknBFpFAD9sDMK8KivYSQcX7');
accountService.getAllReserves(FLASH_LOAD_PROGRAM_ID).then((reserves: Reserve) => {
    reserves.map((reserve) => {
        console.log(reserve.fee(LAMPORTS_PER_SOL * 10)); // fee for 10 SOL
        console.log(reserve.availableLiquidity()); // get available liquidity
    })
});
```

```typescript
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

import { AccountService, Reserve } from 'solana-flash-loan-sdk';
const connection = new Connection('http://localhost:8899');
const walletAdapter = new SolflareWalletAdapter;

const accountService = new AccountService(connection);
/**
 * get reserve by PublicKey
 */
document.getElementById('button')?.addEventListener('click', () => {

    const RESERVE_ID = new PublicKey('XdNhPQJLbxU5dQ1b3VRev6RdYiYp9Q3Tt4scq9Wr5b5');
    Promise.all([
        accountService.getReserveInfo(RESERVE_ID),
        walletAdapter.connect(),
    ]).then(async ([reserve]: [Reserve, void]) => {
        if (reserve && walletAdapter.publicKey) {
            const tx = new Transaction();
            const TOKEN_ID = new PublicKey('5yDQpx54fgfTEHLr6fSszCkeFhEDp3ZPfnp3oytSm8zz');
            const amount = BigInt(LAMPORTS_PER_SOL) * 100n;
            console.log('borrowFee', reserve.fee(Number(amount)) / LAMPORTS_PER_SOL);
            tx.add(
                reserve.flashBorrow(amount, TOKEN_ID),
                reserve.flashRepay(amount, TOKEN_ID, walletAdapter.publicKey),
            );

            tx.feePayer = walletAdapter.publicKey;
            const latestBlockhash = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = latestBlockhash.blockhash;

            const signed = await walletAdapter.signTransaction(tx)
            const signature = await connection.sendRawTransaction(signed.serialize(), {
                preflightCommitment: 'confirmed',
            });
            console.log('signature', signature);
        }
    });
})
```

## Live example
```shell
npm i @texture-finance/solana-flash-loan-sdk-example
```