//MPL & UMI

import {
    generateSigner,
    percentAmount,
    some,
    transactionBuilder,
// @ts-ignore
} from "@metaplex-foundation/umi";
// @ts-ignore
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// @ts-ignore
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
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

//MUI
import { Button } from "@mui/material";


export function Index() {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallet = useWallet();
    const umi = createUmi(endpoint, 'confirmed')
    .use(walletAdapterIdentity(wallet))
    .use(mplCandyMachine());

    const onSetUmi = async () => {
        const collectionUpdateAuthority = generateSigner(umi);
        const collectionMint = generateSigner(umi);
            await createNft(umi, {
            mint: collectionMint,
            authority: collectionUpdateAuthority,
            name: "My Collection NFT",
            uri: "https://arweave.net/1aO-WP2YlN-QiUAMpfOYrbgsQk1MuisNXCBAD3hRYr0",
            sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
            isCollection: true,
        }).sendAndConfirm(umi);

        // Create the Candy Machine.
        const candyMachine = generateSigner(umi);
        const createInstructions = await create(umi, {
            candyMachine,
            collectionMint: collectionMint.publicKey,
            collectionUpdateAuthority,
            tokenStandard: TokenStandard.NonFungible,
            sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
            itemsAvailable: 5000,
            creators: [
            {
              address: umi.identity.publicKey,
              verified: true,
              percentageShare: 100,
            },
            ],
            configLineSettings: some({
            prefixName: "",
            nameLength: 32,
            prefixUri: "",
            uriLength: 200,
            isSequential: false,
            }),
        });
        await transactionBuilder().add(createInstructions).sendAndConfirm(umi);
        console.log(candyMachine);
    }

  return (
    <>
      <h1>Vite + React</h1>
      <Button onClick={onSetUmi}>Primary</Button>
    </>
  );
}
