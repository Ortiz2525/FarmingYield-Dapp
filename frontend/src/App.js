import { InjectedConnector } from "@web3-react/injected-connector";
import { useWeb3React } from '@web3-react/core'


const Injected = new InjectedConnector({
 supportedChainIds: [1, 3, 4, 5, 42]
});

function App() {
  const { active, chainId, account } = useWeb3React();
  const { activate, deactivate } = useWeb3React();
    return (
      <div>
        <button onClick={() => { activate(Injected) }}>Metamask</button>

        <button onClick={deactivate}>Disconnect</button>
        <div>Connection Status: {active}</div>
        <div>Account: {account}</div>
        <div>Network ID: {chainId}</div>
      </div>
  );
}
export default App;