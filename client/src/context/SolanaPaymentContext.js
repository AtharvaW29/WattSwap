/**
 * SolanaPaymentContext.js
 * Context for managing Solana wallet connection and payments
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  WalletAdapterNetwork,
  WalletError
} from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

export const SolanaPaymentContext = createContext();

const network = WalletAdapterNetwork.Devnet;
const endpoint = process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const SolanaPaymentProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const conn = new Connection(endpoint, 'confirmed');
    setConnection(conn);
  }, []);

  const wallets = [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter()
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaPaymentContextProvider connection={connection}>
            {children}
          </SolanaPaymentContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const SolanaPaymentContextProvider = ({ connection, children }) => {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const [solanaBalance, setSolanaBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch SOL balance
  const fetchSolanaBalance = useCallback(async () => {
    if (!connection || !publicKey) return;

    try {
      setLoading(true);
      const balance = await connection.getBalance(publicKey);
      setSolanaBalance((balance / 1e9).toString()); // Convert lamports to SOL
    } catch (err) {
      setError(`Error fetching SOL balance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  // Fetch USDC balance on Solana
  const fetchUsdcBalance = useCallback(async () => {
    if (!connection || !publicKey) return;

    try {
      setLoading(true);
      const USDC_MINT = new PublicKey(
        'EPjFWaLb3odcccccccccccccccccccccccccccccccc' // USDC mint on Solana
      );

      const associatedTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      try {
        const tokenAccount = await getAccount(connection, associatedTokenAddress);
        const balance = (Number(tokenAccount.amount) / 1e6).toString(); // USDC has 6 decimals
        setUsdcBalance(balance);
      } catch (err) {
        // Token account might not exist
        setUsdcBalance('0');
      }

    } catch (err) {
      setError(`Error fetching USDC balance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  // Generate Solana Pay QR code link
  const generateSolanaPayLink = useCallback((amount, reference, label = 'WattSwap Energy') => {
    const recipient = process.env.REACT_APP_SOLANA_WALLET_ADDRESS;
    if (!recipient) {
      throw new Error('REACT_APP_SOLANA_WALLET_ADDRESS not configured');
    }

    // Solana Pay URL scheme: solana:<recipient>?amount=<amount>&label=<label>&reference=<reference>&message=<message>
    const solanaPayUrl = `solana:${recipient}?amount=${amount}&label=${label}&reference=${reference}&message=Energy%20Purchase`;
    
    return solanaPayUrl;
  }, []);

  // Send USDC on Solana
  const sendUSDC = useCallback(async (recipientAddress, amount) => {
    if (!connection || !publicKey || !wallet?.adapter) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);

      const recipientPublicKey = new PublicKey(recipientAddress);
      const USDC_MINT = new PublicKey(
        'EPjFWaLb3odcccccccccccccccccccccccccccccccc'
      );

      // Get associated token addresses
      const senderTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      const recipientTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        recipientPublicKey
      );

      // Note: SPL token transfer requires additional setup
      // This is a placeholder - actual implementation would use
      // @solana/spl-token-3.x for token transfers

      console.log(
        `Transferring ${amount} USDC from ${senderTokenAddress} to ${recipientTokenAddress}`
      );

      // Refresh balance
      await fetchUsdcBalance();

      return { success: true };

    } catch (err) {
      setError(`Error sending USDC: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, wallet, fetchUsdcBalance]);

  // Refresh balances
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSolanaBalance();
      fetchUsdcBalance();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [fetchSolanaBalance, fetchUsdcBalance]);

  // Initial balance fetch
  useEffect(() => {
    fetchSolanaBalance();
    fetchUsdcBalance();
  }, [publicKey]);

  const value = {
    publicKey,
    solanaBalance,
    usdcBalance,
    loading,
    error,
    wallet,
    generateSolanaPayLink,
    sendUSDC,
    fetchSolanaBalance,
    fetchUsdcBalance,
    connection
  };

  return (
    <SolanaPaymentContext.Provider value={value}>
      {children}
    </SolanaPaymentContext.Provider>
  );
};
