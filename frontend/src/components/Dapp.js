import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";

const HARDHAT_NETWORK_ID = '31337';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export function Dapp() {
  const [tokenData, setTokenData] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [txBeingSent, setTxBeingSent] = useState(undefined);
  const [transactionError, setTransactionError] = useState(undefined);
  const [networkError, setNetworkError] = useState(undefined);
  let pollDataInterval;
  const [provider, setProvider] = useState(undefined);
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    if (window.ethereum === undefined) {
      return;
    }

    const connectWallet = async () => {
      try {
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSelectedAddress(address);
        checkNetwork();
        initialize(address);

        window.ethereum.on("accountsChanged", ([newAddress]) => {
          stopPollingData();

          if (newAddress === undefined) {
            resetState();
          } else {
            initialize(newAddress);
          }
        });
      } catch (error) {
        console.error(error);
        setNetworkError("Failed to connect wallet.");
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    initializeEthers();
    getTokenData();
    startPollingData();

    return () => stopPollingData();
  }, [selectedAddress]);

  const resetState = () => {
    setTokenData(undefined);
    setSelectedAddress(undefined);
    setBalance(undefined);
    setTxBeingSent(undefined);
    setTransactionError(undefined);
    setNetworkError(undefined);
  };

  const checkNetwork = () => {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      switchChain();
    }
  };

  const switchChain = async () => {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      await initialize(selectedAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const initialize = async (userAddress) => {
    setSelectedAddress(userAddress);
  };

  const initializeEthers = () => {
    const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum);
  
    setProvider(ethereumProvider);
  
    const tokenContract = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      ethereumProvider.getSigner(0)
    );
  
    setToken(tokenContract);
  };
  const getTokenData = async () => {
    const name = await token.name();
    const symbol = await token.symbol();

    setTokenData({ name, symbol });
  };

  const startPollingData = () => {
    pollDataInterval = setInterval(updateBalance, 1000);
    updateBalance();
  };

  const stopPollingData = () => {
    clearInterval(pollDataInterval);
    pollDataInterval = undefined;
  };

  const updateBalance = async () => {
    const balance = await token.balanceOf(selectedAddress);
    setBalance(balance);
  };

  const transferTokens = async (to, amount) => {
    try {
      dismissTransactionError();
      const tx = await token?.transfer(to, amount);
      setTxBeingSent(tx.hash);

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await updateBalance();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      setTransactionError(error);
    } finally {
      setTxBeingSent(undefined);
    }
  };

  const dismissTransactionError = () => {
    setTransactionError(undefined);
  };

  const dismissNetworkError = () => {
    setNetworkError(undefined);
  };

  const getRpcErrorMessage = (error) => {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  };

  if (window.ethereum === undefined) {
    return <NoWalletDetected />;
  }

  if (!selectedAddress) {
    return (
      <ConnectWallet
        connectWallet={() => {}}
        networkError={networkError}
        dismiss={() => dismissNetworkError()}
      />
    );
  }

  if (!tokenData || !balance) {
    return <Loading />;
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-12">
          <h1>
            {tokenData.name} ({tokenData.symbol})
          </h1>
          <p>
            Welcome <b>{selectedAddress}</b>, you have{" "}
            <b>
              {balance.toString()} {tokenData.symbol}
            </b>
            .
          </p>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-12">
          {txBeingSent && (
            <WaitingForTransactionMessage txHash={txBeingSent} />
          )}

          {transactionError && (
            <TransactionErrorMessage
              message={getRpcErrorMessage(transactionError)}
              dismiss={() => dismissTransactionError()}
            />
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {balance.eq(0) && (
            <NoTokensMessage selectedAddress={selectedAddress} />
          )}

          {balance.gt(0) && (
            <Transfer
              transferTokens={transferTokens}
              tokenSymbol={tokenData.symbol}
            />
          )}
        </div>
      </div>
    </div>
  );
}