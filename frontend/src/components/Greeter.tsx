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
  const [farmingYieldContract, setFarmingYieldContract] = useState<Contract>(new ethers.Contract(FarmingYieldAddress.Token, FarmingYieldArtifact.abi, signer));
  const [farmingYieldContractAddr, setFarmingYieldContractAddr] = useState<string>(FarmingYieldAddress.Token);
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
    if (!farmingYieldContract) {
      return;
    }
  
  }, [farmingYieldContract, greeting]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    // only deploy the Greeter contract one time, when a signer is defined
    if (!farmingYieldContract || !signer) {
      return;
    }
    async function deployfarmingYieldContract(signer: Signer): Promise<void> {
      try {
        setFarmingYieldContract(farmingYield);
        setGreeting(greeting);
        window.alert(`Staking Token deployed at: ${stakingTokenAddress.Token}\nReward Token deployed at: ${rewardToken1Address.Token}\nfarmingYieldContract deployed at: ${FarmingYieldAddress.Token}\n `);

        
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployfarmingYieldContract(signer);
  }
  

  function handleDepositChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDepositInput(event.target.value);
  }
  function handleWithdrawChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setWithdrawInput(event.target.value);
  }

  function depositButton(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!farmingYieldContract) {
      window.alert('Undefined farmingYieldContract');
      return;
    }

    if (!depositInput) {
      window.alert('depositInput cannot be empty');
      return;
    }
    if (!library) {
      return;
    }
    if (!signer) {
      return;
    }
    async function submitGreeting(farmingYieldContract: Contract, library: Provider, signer: Signer): Promise<void> {
     
      try {
        await stakingTK.connect(signer).approve(farmingYieldContract.address, depositInput);
        const setGreetingTxn = await farmingYieldContract.connect(signer).deposit(depositInput);

        await setGreetingTxn.wait();

        window.alert(`Success!\n\nDeposit`);

      } catch (error: any) {
        console.log(error.message);
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitGreeting(farmingYieldContract, library, signer);
  }

  function withdrawButton(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!farmingYieldContract) {
      window.alert('Undefined farmingYieldContract');
      return;
    }

    if (!withdrawInput) {
      window.alert('withdrawInput cannot be empty');
      return;
    }
    if (!library) {
      return;
    }
    if (!signer) {
      return;
    }
    
    async function withdraw(farmingYieldContract: Contract, library: Provider, signer: Signer): Promise<void> {
     
      try {
        const setGreetingTxn = await farmingYieldContract.connect(signer).withdraw(withdrawInput);

        await setGreetingTxn.wait();

        window.alert(`Success!\n\nWithDraw`);

      } catch (error: any) {
        console.log(error.message);
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    withdraw(farmingYieldContract, library, signer);
  }

  function claimButton(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!farmingYieldContract) {
      window.alert('Undefined farmingYieldContract');
      return;
    }
    if (!library) {
      return;
    }
    if (!signer) {
      return;
    }
    
    async function withdraw(farmingYieldContract: Contract, library: Provider, signer: Signer): Promise<void> {
     
      try {
        const setGreetingTxn = await farmingYieldContract.connect(signer).claim();
        await setGreetingTxn.wait();

        window.alert(`Success!\n\nClaim`);

      } catch (error: any) {
        console.log(error.message);
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    withdraw(farmingYieldContract, library, signer);
  }

  return (
    <>
          <StyledDeployContractButton
        style={{
          cursor: 'pointer',
          borderColor: 'blue'
        }}
        onClick={handleDeployContract}
      >
        Contract Addresses
      </StyledDeployContractButton>
      <SectionDivider />
      <StyledGreetingDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <div>
          {farmingYieldContractAddr ? (
            farmingYieldContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
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
          onClick={withdrawButton}
        >
          withdraw
        </StyledButton>
        <StyledLabel>Claim</StyledLabel>
        <StyledButton
          style={{
            cursor: 'pointer',
            borderColor: 'blue'
          }}
          onClick={claimButton}
        >
          claim
        </StyledButton>
      </StyledGreetingDiv>
    </>
  );
}
