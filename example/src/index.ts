import {
    Connection,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
    PublicKey,
    Transaction,
    SystemProgram,
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
} from '@solana/spl-token';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

import { AccountService, Reserve, FLASH_LOAN_ID } from '@texture-finance/solana-flash-loan-sdk';

const connection = new Connection(clusterApiUrl('devnet'));
const walletAdapter = new SolflareWalletAdapter;

const accountService = new AccountService(connection);
/**
 * get all reserves
 */
accountService.getAllReserves(FLASH_LOAN_ID).then((reserves: Reserve[]) => {
    reserves.map((reserve: Reserve) => {
        console.log('============================================');
        console.log(reserve.pubkey.toBase58());
        console.log('fee', reserve.fee(LAMPORTS_PER_SOL * 10));
        console.log('available liquidity', reserve.availableLiquidity());
    })
});


/**
 * get reserve by PublicKey
 */
document.getElementById('button')?.addEventListener('click', () => {

    const RESERVE_ID = new PublicKey('9Wys2sCHcAGZm3jgSnfP8xyq1ZiK2qthQ4Ki5fSdkqP');
    Promise.all([
        accountService.getReserveInfo(RESERVE_ID),
        walletAdapter.connect(),
    ]).then(async ([reserve]: [Reserve, void]) => {
        if (reserve && walletAdapter.publicKey) {
            const amount = BigInt(LAMPORTS_PER_SOL * 0.01);

            const [token] = PublicKey.findProgramAddressSync(
                [walletAdapter.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), NATIVE_MINT.toBuffer()],
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const tx = new Transaction();
            /**
             *
             * optional code
             *
             * airdrop 1 SOL
             * create token account
             * transfer 0.01 SOL to account
             * sync transfer
             */
            // await connection.requestAirdrop(walletAdapter.publicKey, LAMPORTS_PER_SOL); // airdrop 1 SOL
            //
            // const accountIx = await createAssociatedTokenAccountInstruction(
            //     walletAdapter.publicKey,
            //     token,
            //     walletAdapter.publicKey,
            //     NATIVE_MINT,
            // )
            // const transferIx = SystemProgram.transfer({
            //     lamports: amount,
            //     fromPubkey: walletAdapter.publicKey,
            //     toPubkey: token,
            // });
            // const syncIx = createSyncNativeInstruction(token)
            // tx.add(accountIx, transferIx, syncIx);
            /**
             * the end of optional code
             *
             */

            tx.add(
                reserve.flashBorrow(amount, token),
                reserve.flashRepay(amount, token, walletAdapter.publicKey),
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

