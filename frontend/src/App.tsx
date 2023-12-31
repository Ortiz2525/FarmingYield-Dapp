import { ReactElement } from 'react';
import styled from 'styled-components';
import { ActivateDeactivate } from './components/ActivateDeactivate';
import { Greeter } from './components/Greeter';
import { SectionDivider } from './components/SectionDivider';
import { SignMessage } from './components/SignMessage';
import { WalletStatus } from './components/WalletStatus';

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 20px;
`;

export function App(): ReactElement {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>YIELD FARMING</h1>
      <StyledAppDiv>
        <ActivateDeactivate />
        <SectionDivider />
        <WalletStatus />
        <SectionDivider />
        <Greeter />
      </StyledAppDiv>
    </div>
  );
}
