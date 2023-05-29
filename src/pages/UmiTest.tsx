//MPL & UMI
// @ts-ignore
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// @ts-ignore
import { generateSigner, base58PublicKey } from "@metaplex-foundation/umi";

//solana web3
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

//MUI
import { Button } from "@mui/material";


export function UmiTest() {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const {publicKey:userPublickKey} = useWallet();
    // // Use the RPC endpoint of your choice.
    const umi = createUmi(endpoint);
    console.log('endpoint:',endpoint);
    console.log('publicKey:', userPublickKey);
    console.log('umi:', umi);

    //Get UMI endpoints
    const ep = umi.rpc.getEndpoint();
    const cluster = umi.rpc.getCluster();
    console.log('ep:',ep);
    console.log('cluster:', cluster);

    const onSetUmi = async () => {
        const myCustomAuthority = generateSigner(umi);
        console.log('myCustomAuthority:', myCustomAuthority);
        console.log('myCustomAuthority.publicKey:', base58PublicKey(myCustomAuthority));
        // const candyMachinePublicKey = publicKey(userPublickKey);
        // const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        // const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
        //
        // console.log('candyMachinePublicKey:',candyMachinePublicKey);
        // console.log('candyMachine:', candyMachine);
        // console.log('candyGuard:', candyGuard);
    }

  return (
    <>
      <h1>Vite + React</h1>
      <Button onClick={onSetUmi}>Primary</Button>
    </>
  );
}
