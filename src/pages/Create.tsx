//react
import { FormEvent, useState } from "react";

//MPL & UMI
import {
    PublicKey,
    Umi,
    createGenericFileFromBrowserFile,
    generateSigner,
    base58PublicKey,
    percentAmount,
    some,
    dateTime,
    transactionBuilder,
// @ts-ignore
} from "@metaplex-foundation/umi";
// @ts-ignore
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// @ts-ignore
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// @ts-ignore
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    create,
    mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";

//solana web3
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";


import { getPath } from '../utils';
import styles from "./Create.module.css";


async function uploadAndCreateNft(umi: Umi, name: string, file: File) {
  // Ensure input is valid.
  if (!name) {
    throw new Error("Please enter a name for your NFT.");
  }
  if (!file || file.size === 0) {
    throw new Error("Please select an image for your NFT.");
  }

  // Upload image and JSON data.
  const imageFile = await createGenericFileFromBrowserFile(file);
  const [imageUri] = await umi.uploader.upload([imageFile]);
  const uri = await umi.uploader.uploadJson({
    name,
    description: "A test NFT created via Umi.",
    image: imageUri,
  });

  // -------------------------------------
  // Create Collection NFT
  // -------------------------------------
  // Create a Candy Machine with guards.
  const candyMachine = generateSigner(umi);
  const collectionMint = generateSigner(umi);
  // const collectionUpdateAuthority = generateSigner(umi);
  const collectionUpdateAuthority = umi.identity;

console.log('candyMachine: ',candyMachine);
console.log('collectionMint publicKey: ',base58PublicKey(collectionMint.publicKey));
console.log('collectionMint: ',collectionMint);
console.log('collectionUpdateAuthority: ',base58PublicKey(collectionUpdateAuthority.publicKey));
console.log('collectionMint: ',collectionUpdateAuthority);

  const sellerFeeBasisPoints = percentAmount(9.9, 2);
  await createNft(umi, {
    mint: collectionMint,
    authority: collectionUpdateAuthority,
    name: 'KAWAII MONSTER',
    uri,
    sellerFeeBasisPoints,
    isCollection: true,
  }).sendAndConfirm(umi);



  // -------------------------------------
  //  Candy Machine
  // -------------------------------------
  // Create a Candy Machine with guards.
  const createInstructions = await create(umi, {
    candyMachine,
    collectionMint:collectionMint.publicKey,
    collectionUpdateAuthority,
    tokenStandard: TokenStandard.NonFungible,
    sellerFeeBasisPoints,
    itemsAvailable: 1, // Increase SOL cost per items. Check the cost on Devnet before launch.
    maxEditionSupply: 30,
    creators: [
      {
        address: umi.identity.publicKey,
        verified: true,
        percentageShare: 100,
      },
    ],
    configLineSettings: some({
      prefixName: "KAWA",
      nameLength: 2,
      prefixUri: "",
      uriLength: 200,
      isSequential: false,
    }),
    guards: {
      // botTax: some({ lamports: sol(0.00321), lastInstruction: true }),
      startDate: some({ date: dateTime("2023-04-04T16:00:00Z") }),
      // mintLimit: some({ id: 1, limit: 1 }),
      // solPayment: some({ lamports: sol(0.00123), destination: umi.identity.publicKey }),
      // All other guards are disabled...
    },
  });
  await transactionBuilder().add(createInstructions).sendAndConfirm(umi);

    // await addConfigLines(umi, {
    //     candyMachine: candyMachine.publicKey,
    //     index: 0,
    //     configLines: [
    //     { name: name, uri: uri },
    //     ],
    // }).sendAndConfirm(umi);

  // Return the mint address.
  return candyMachine.publicKey;
  // return collectionMint.publicKey;
}


export function Create() {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallet = useWallet();
    const umi = createUmi(endpoint, 'confirmed')
    .use(walletAdapterIdentity(wallet))
    .use(nftStorageUploader())
    .use(mplCandyMachine());
    const [loading, setLoading] = useState(false);
    const [mintCreated, setMintCreated] = useState<PublicKey | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.target as HTMLFormElement);
        const data = Object.fromEntries(formData) as { collection: string; name: string; image: File };

        try {
          const mint = await uploadAndCreateNft(umi, data.name, data.image);
          setMintCreated(mint);
        } finally {
          setLoading(false);
        }
    };

  const PageContent = () => {
    if (!wallet.connected) {
      return <p>Please connect your wallet to get started.</p>;
    }

    if (loading) {
      return (
        <div className={styles.loading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="192"
            height="192"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none"></rect>
            <path
              d="M168,40.7a96,96,0,1,1-80,0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="24"
            ></path>
          </svg>
          <p>Creating the NFT...</p>
        </div>
      );
    }

    if (mintCreated) {
      return (
        <div>
          <a
            className={styles.success}
            target="_blank"
            href={
              "https://www.solaneyes.com/address/" +
              base58PublicKey(mintCreated) +
              "?cluster=devnet"
            }
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="192"
              height="192"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <rect width="256" height="256" fill="none"></rect>
              <polyline
                points="172 104 113.3 160 84 132"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="24"
              ></polyline>
              <circle
                cx="128"
                cy="128"
                r="96"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="24"
              ></circle>
            </svg>
            <div>
              <p>
                <strong>Success Collection Created</strong> at the following address
              </p>
              <p>
                <code>{base58PublicKey(mintCreated)}</code>
              </p>
            </div>
          </a>
          <div>Be sure to save the address as it is needed for the Mint URL.</div>
          <a
            className={styles.success}
            href={getPath.addItem(base58PublicKey(mintCreated))}
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="192"
              height="192"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <rect width="256" height="256" fill="none"></rect>
              <polyline
                points="172 104 113.3 160 84 132"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="24"
              ></polyline>
              <circle
                cx="128"
                cy="128"
                r="96"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="24"
              ></circle>
            </svg>
            <div>
              <p>
                <strong>Next Steps Adding Items</strong>
              </p>
            </div>
          </a>
        </div>
      );
    }

    return (
      <form method="post" onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Name</span>
          <input name="name" defaultValue="KAWAMON" />
        </label>
        <label className={styles.field}>
          <span>Image</span>
          <input name="image" type="file" />
        </label>
        <button type="submit">
          <span>Create NFT</span>
          <svg
            aria-hidden="true"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              fill="currentColor"
              d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
            ></path>
          </svg>
        </button>
      </form>
    );
  };

  return (
    <>
      <h1>NFT upload</h1>
      <PageContent />
    </>
  );
}
