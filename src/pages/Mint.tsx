//react
import { FormEvent, useState } from "react";

//MPL & UMI
import {
  PublicKey,
  Umi,
  generateSigner,
  transactionBuilder,
  base58PublicKey,
  publicKey,
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
    mintV2,
    fetchCandyMachine,
    fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-essentials";
//solana web3
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

//MUI
import { Button } from "@mui/material";

import styles from "./Create.module.css";
import {useParams} from "react-router-dom";


async function mintting(umi:Umi, collection:string){

  const candyMachinePublicKey = publicKey(collection);
  const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
  const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
  const nftMint = generateSigner(umi);
  console.log('candyMachine',candyMachine);
  console.log('item',candyMachine.items[0].name);
  console.log('candyGuard',candyGuard);
  console.log('candyMachine address',base58PublicKey(candyMachine.publicKey));
  console.log('collectionMint address',base58PublicKey(candyMachine.collectionMint));
  console.log('collectionUpdateAuthority address',base58PublicKey(candyMachine.authority));
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
      mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        // minter, // default to Umi's identity and payer
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
      }),
    )
    .sendAndConfirm(umi);



  return 'mintted';
}

export function Mint() {
    const { id } = useParams();
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallet = useWallet();
    const umi = createUmi(endpoint, 'confirmed')
    .use(walletAdapterIdentity(wallet))
    .use(nftStorageUploader())
    .use(mplCandyMachine());
    const [loading, setLoading] = useState(false);
    const [minted, setMinted] = useState<PublicKey | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        // const formData = new FormData(event.target as HTMLFormElement);
        // const data = Object.fromEntries(formData) as { collection: string;};

        try {
          if(id != undefined ) {
            const mint = await mintting(umi, id);
            setMinted(mint);
          } else {
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
          <p>Mintting the NFT...</p>
        </div>
      );
    }

    if (minted) {
      return (
        <div>
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
              <strong>NFT Minted</strong>
            </p>
          </div>
        </div>
      );
    }

    return (
      <form method="post" onSubmit={onSubmit} className={styles.form}>
        <Button type="submit">
          <span>MINT NFT</span>
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
        </Button>
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
