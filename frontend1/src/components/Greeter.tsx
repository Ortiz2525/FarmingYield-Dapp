import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import stakingTokenArtifact from '../contracts/stakingToken.json';
import rewardToken1Artifact from '../contracts/rewardToken1.json';
import FarmingYieldArtifact from '../contracts/FarmingYield.json';
import FarmingYieldAddress from '../contracts/FarmingYieldcontract-address.json';
import rewardToken1Address from '../contracts/rewardToken1contract-address.json';
import stakingTokenAddress from '../contracts/stakingTokencontract-address.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledGreetingDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>(FarmingYieldAddress.Token);
  const [greeting, setGreeting] = useState<string>('');
  // const [greetingInput, setGreetingInput] = useState<string>('');
  const [depositInput, setDepositInput] = useState<string>('');
  const [withdrawInput, setWithdrawInput] = useState<string>('');
  const stakingTK = new ethers.Contract(
    stakingTokenAddress.Token,
    stakingTokenArtifact.abi,
    signer
  );
  
  const rewardTK = new ethers.Contract(
    rewardToken1Address.Token,
    rewardToken1Artifact.abi,
    signer
  );
  const farmingYield = new ethers.Contract(
    FarmingYieldAddress.Token,
    FarmingYieldArtifact.abi,
    signer
  );
  
  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!greeterContract) {
      return;
    }
  

    async function getGreeting(greeterContract: Contract): Promise<void> {
      // const _greeting = await greeterContract.greet();

      // if (_greeting !== greeting) {
      //   setGreeting(_greeting);
      // }
    }

    getGreeting(greeterContract);
  }, [greeterContract, greeting]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    async function deployGreeterContract(signer: Signer): Promise<void> {


      try {
        setGreeterContract(farmingYield);
        setGreeting(greeting);
        window.alert(`Staking Token deployed to: ${stakingTokenAddress.Token}\nReward Token deployed to: ${rewardToken1Address.Token}\nfarmingYieldContract deployed to: ${FarmingYieldAddress.Token}\n `);

        
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployGreeterContract(signer);
  }
  

  function handleDepositChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDepositInput(event.target.value);
  }
  function handleWithdrawChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDepositInput(event.target.value);
  }

  function depositButton(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      window.alert('Undefined greeterContract');
      return;
    }

    if (!depositInput) {
      window.alert('Greeting cannot be empty');
      return;
    }

    async function submitGreeting(greeterContract: Contract): Promise<void> {
      try {
        const setGreetingTxn = await greeterContract.setGreeting(depositInput);

        await setGreetingTxn.wait();

        const newGreeting = await greeterContract.greet();
        window.alert(`Success!\n\nGreeting is now: ${newGreeting}`);

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitGreeting(greeterContract);
  }

  return (
    <>
      {/* <StyledDeployContractButton
        disabled={!active || greeterContract ? true : false}
        style={{
          cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
          borderColor: !active || greeterContract ? 'unset' : 'blue'
        }}
        onClick={handleDeployContract}
      >
        Farming Yield Contract
      </StyledDeployContractButton>
      <SectionDivider /> */}
      <StyledGreetingDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <div>
          {greeterContractAddr ? (
            greeterContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        {/* <div></div>
        <StyledLabel>Current greeting</StyledLabel>
        <div>
          {greeting ? greeting : <em>{`<Contract not yet deployed>`}</em>}
        </div> */}
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <StyledLabel htmlFor="depositInput">Deposit </StyledLabel>
        <StyledInput
          id="depositInput"
          type="text"
          placeholder={greeting ? '' : '<amount>'}
          onChange={handleDepositChange}
          style={{ fontStyle: greeting ? 'normal' : 'italic' }}
        ></StyledInput>
        <StyledButton
          style={{
            cursor: 'pointer',
            borderColor: 'blue'
          }}
          onClick={depositButton}
        >
          Deposit
        </StyledButton>


        <StyledLabel htmlFor="withdrawInput">Withdraw</StyledLabel>
        <StyledInput
          id="withdrawInput"
          type="text"
          placeholder={greeting ? '' : '<amount>'}
          onChange={handleWithdrawChange}
          style={{ fontStyle: greeting ? 'normal' : 'italic' }}
        ></StyledInput>
        <StyledButton
          style={{
            cursor: 'pointer',
            borderColor: 'blue'
          }}
          onClick={depositButton}
        >
          withdraw
        </StyledButton>
        <StyledLabel>Claim</StyledLabel>
        <StyledButton
          style={{
            cursor: 'pointer',
            borderColor: 'blue'
          }}
          onClick={depositButton}
        >
          claim
        </StyledButton>
      </StyledGreetingDiv>
    </>
  );
}
