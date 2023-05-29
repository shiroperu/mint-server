//react
import { FormEvent, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

//MPL & UMI
import {
  publicKey,
  dateTime,
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
  fetchCandyMachine,
  fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";

//solana web3
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

//MUI
import { Button } from "@mui/material";

import styles from "./Create.module.css";



export function Account() {
    const { id } = useParams();
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallet = useWallet();
    const umi = createUmi(endpoint, 'confirmed')
    .use(walletAdapterIdentity(wallet))
    .use(nftStorageUploader())
    .use(mplCandyMachine());
    const [startDate, setStartDate] = useState<string>();

    useEffect(() => {
      const getCandyMachine = async () => {
        const candyMachinePublicKey = publicKey(id);
        const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        console.log(candyGuard.guards.startDate);
        console.log(new Date(candyGuard.guards.startDate.value));
        setStartDate(dateTime(candyGuard.guards.startDate.value.date));
      }
      getCandyMachine()
  },[])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const candyMachinePublicKey = publicKey(wallet.publicKey);
        const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

        const formData = new FormData(event.target as HTMLFormElement);
        const data = Object.fromEntries(formData) as { start_date: string;};

        candyGuard.guards.startDate = data.start_date;
        setStartDate(data.start_date);
    };


  return (
    <>
      <h1>Setting Check Metaplex Guard</h1>

      <form method="post" onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>startDate</span>
          <input name="start_date" defaultValue={startDate} />
        </label>
        <Button onClick={onSubmit}>Check</Button>
      </form>
    </>
  );
}
