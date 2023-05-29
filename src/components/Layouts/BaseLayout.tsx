import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const BaseLayout = () => {


  return (
    <div>
      <Box>
          <h1>Mint site</h1>
          <WalletMultiButton />
      </Box>
      <Outlet />
    </div>
  );
};
