//react
import { FormEvent, useState } from "react";

//MPL & UMI
import {
    Umi,
    publicKey,
    createGenericFileFromBrowserFile,
// @ts-ignore
} from "@metaplex-foundation/umi";
// @ts-ignore
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// @ts-ignore
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// @ts-ignore
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import {
    mplCandyMachine,
    addConfigLines,
    fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";

//solana web3
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";
import { useWallet } from "@solana/wallet-adapter-react";


import styles from "./Create.module.css";
import {useParams} from "react-router-dom";


async function uploadNft(umi: Umi, collection: string, name: string, file: File) {
  // Ensure input is valid.
  if (!name) {
    throw new Error("Please enter a name for your NFT.");
  }
  if (!file || file.size === 0) {
    throw new Error("Please select an image for your NFT.");
  }

  const candyMachinePublicKey = publicKey(collection);
  const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);

  // Upload image and JSON data.
  const imageFile = await createGenericFileFromBrowserFile(file);
  const [imageUri] = await umi.uploader.upload([imageFile]);
  const uri = await umi.uploader.uploadJson({
    name,
    description: "KAWAII MONSTER",
    image: imageUri,
  });

  await addConfigLines(umi, {
      candyMachine: candyMachine.publicKey,
      index: candyMachine.items.length,
      configLines: [
      { name: name, uri: uri },
      ],
  }).sendAndConfirm(umi);
  // Return the mint address.
  return uri;
}


export function CompressedItem() {
    const { id } = useParams();
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallet = useWallet();
    const umi = createUmi(endpoint, 'confirmed')
    .use(walletAdapterIdentity(wallet))
    .use(nftStorageUploader())
    .use(mplCandyMachine());
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState<any>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.target as HTMLFormElement);
        const data = Object.fromEntries(formData) as { maxDepth: string; maxBufferSize: string, canopyDepth: string };

        try {
          if(id != undefined ) {
            // calculate the space required for the tree
            const requiredSpace = getConcurrentMerkleTreeAccountSize(
              Number(data.maxDepth),
              Number(data.maxBufferSize),
              Number(data.canopyDepth),
            );

            // get the cost (in lamports) to store the tree on-chain
            const storageCost = await connection.getMinimumBalanceForRentExemption( requiredSpace );
            console.log(storageCost);
            // setItem(mint);
          }else{
            setLoading(false);
          }
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

    if (item) {
      return (
        <a
          className={styles.success}
          target="_blank"
          href={
            item.image
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
              <strong>NFT Created</strong> at the following address
            </p>
            <p>
              <code>{item.name}</code>
            </p>
          </div>
        </a>
      );
    }

    return (
      <form method="post" onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>maxDepth</span>
          <input name="maxDepth" defaultValue="" />
        </label>
        <label className={styles.field}>
          <span>maxBufferSize</span>
          <input name="maxBufferSize" defaultValue="" />
        </label>
        <label className={styles.field}>
          <span>canopyDepth</span>
          <input name="canopyDepth" defaultValue="" />
        </label>
        <button type="submit">
          <span>Calculate tree cost </span>
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
      <h1>Add Compressed Item</h1>
      <PageContent />
    </>
  );
}
