/**
 * USDCPaymentContext.js
 * Context for managing USDC payments and escrow operations
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Web3 } from 'web3';

export const USDCPaymentContext = createContext();

const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
];

export const USDCPaymentProvider = ({ children }) => {
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  // Initialize Web3 provider
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        if (window.ethereum) {
          const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(ethProvider);

          // Request account access
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          const signer = ethProvider.getSigner();
          setSigner(signer);
          setUserAddress(accounts[0]);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setUserAddress(accounts[0]);
          });
        }
      } catch (err) {
        setError(`Provider initialization error: ${err.message}`);
      }
    };

    initializeProvider();
  }, []);

  // Fetch USDC balance
  const fetchUSDCBalance = useCallback(async () => {
    if (!provider || !userAddress) return;

    try {
      setLoading(true);
      const usdcAddress = process.env.REACT_APP_USDC_ADDRESS;
      const usdcContract = new ethers.Contract(
        usdcAddress,
        USDC_ABI,
        provider
      );

      const balance = await usdcContract.balanceOf(userAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 6); // USDC has 6 decimals
      setUsdcBalance(formattedBalance);

    } catch (err) {
      setError(`Error fetching USDC balance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [provider, userAddress]);

  // Approve USDC spending
  const approveUSDC = useCallback(async (spender, amount) => {
    if (!signer) throw new Error('Signer not available');

    try {
      setLoading(true);
      const usdcAddress = process.env.REACT_APP_USDC_ADDRESS;
      const usdcContract = new ethers.Contract(
        usdcAddress,
        USDC_ABI,
        signer
      );

      const amountWei = ethers.utils.parseUnits(amount, 6);
      const tx = await usdcContract.approve(spender, amountWei);
      const receipt = await tx.wait();

      return receipt;

    } catch (err) {
      setError(`Approval error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  // Transfer USDC
  const transferUSDC = useCallback(async (recipient, amount) => {
    if (!signer) throw new Error('Signer not available');

    try {
      setLoading(true);
      const usdcAddress = process.env.REACT_APP_USDC_ADDRESS;
      const usdcContract = new ethers.Contract(
        usdcAddress,
        USDC_ABI,
        signer
      );

      const amountWei = ethers.utils.parseUnits(amount, 6);
      const tx = await usdcContract.transfer(recipient, amountWei);
      const receipt = await tx.wait();

      // Refresh balance
      await fetchUSDCBalance();

      return receipt;

    } catch (err) {
      setError(`Transfer error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, fetchUSDCBalance]);

  // Switch to Avalanche network
  const switchToAvalanche = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa86a' }] // 43114 in hex
      });
    } catch (err) {
      if (err.code === 4902) {
        // Chain doesn't exist, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xa86a',
              chainName: 'Avalanche C-Chain',
              nativeCurrency: {
                name: 'Avalanche',
                symbol: 'AVAX',
                decimals: 18
              },
              rpcUrls: [process.env.REACT_APP_AVALANCHE_RPC],
              blockExplorerUrls: ['https://snowtrace.io/']
            }
          ]
        });
      } else {
        throw err;
      }
    }
  }, []);

  const value = {
    usdcBalance,
    loading,
    error,
    userAddress,
    provider,
    signer,
    fetchUSDCBalance,
    approveUSDC,
    transferUSDC,
    switchToAvalanche
  };

  return (
    <USDCPaymentContext.Provider value={value}>
      {children}
    </USDCPaymentContext.Provider>
  );
};
