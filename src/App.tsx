
import { RouterProvider } from './provider';
import {MuiProvider} from "./provider/MuiProvider";
import {SolanaProvider} from "./provider/SolanaProvider";

function App() {
  return (
    <SolanaProvider>
      <MuiProvider>
        <RouterProvider />
      </MuiProvider>
    </SolanaProvider>
  );
}

export default App;
