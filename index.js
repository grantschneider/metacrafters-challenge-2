// Import Solana web3 functionality
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
       62, 212,  60, 249, 107, 209, 133, 127, 143, 130, 183,
       99,  80,  27, 241,  40, 247, 181,  64, 178,  45,  80,
      248, 134, 129, 136,  52,  73,  97, 177, 125, 231,  75,
       67, 147, 130,  20, 205, 244, 174,  13, 195, 154,  42,
      252,  14,  51,  30,  89,  58, 102, 149, 197, 101,  36,
      209, 175, 186,  12, 167, 118,  55, 216, 134
    ]
);

const transferHalfSendersSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Generate another Keypair (account we'll be sending to)

    const to = Keypair.generate();

    //Airdrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifier of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    let senderWalletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    );
    let receiverWalletBalance = await connection.getBalance(
        new PublicKey(to.publicKey)
    );

    console.log(`Sender wallet balance: ${parseInt(senderWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver wallet balance: ${parseInt(receiverWalletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: senderWalletBalance / 2
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log("Signature is ", signature);

    senderWalletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    );
    receiverWalletBalance = await connection.getBalance(
        new PublicKey(to.publicKey)
    );

    console.log(`Sender wallet balance: ${parseInt(senderWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver wallet balance: ${parseInt(receiverWalletBalance) / LAMPORTS_PER_SOL} SOL`);
}

transferHalfSendersSol();
