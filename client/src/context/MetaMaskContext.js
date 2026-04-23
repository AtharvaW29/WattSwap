import React, { useState, createContext, useEffect } from "react";
import { ethers } from "ethers";
import BalanceViewer from '../build/contracts/BalanceViewer.json';
import WTSWPToken from '../build/contracts/WTSWPToken.json';
import { BlockchainLogger } from '../utils/blockchainLogger';

export const MetaMaskContext = createContext();

export const MetaMaskContextProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [balanceViewerContract, setBalanceViewerContract] = useState(null);
    const [loading, setLoading] = useState(false);

    // IMPORTANT: These addresses MUST match deployed contract addresses
    // After deployment, update these with actual addresses or load from config
    const DEPLOYED_ADDRESSES = {
        tokenAddress: "0x55Aa1139351D41329e4806611a957E76c162D0de",
        balanceViewerAddress: "0x3CB6799Ee99227f484c025DbD33A46D0093b0291",
    };

    const balanceViewerAbi = BalanceViewer.abi;
    const tokenAbi = WTSWPToken.abi;

    // Get or create provider
    const getProvider = () => {
        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }
        return new ethers.BrowserProvider(window.ethereum);
    };

    const connectMetaMask = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }

            BlockchainLogger.log('🔗 Attempting to connect MetaMask...');

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from MetaMask');
            }

            const userAccount = accounts[0];
            setAccount(userAccount);
            setIsConnected(true);

            BlockchainLogger.log(`✅ Connected to account:`, userAccount);

            // Log provider info
            const provider = getProvider();
            await BlockchainLogger.logProviderInfo(provider, 'MetaMask Provider');

            // Initialize balance viewer contract
            await initializeBalanceViewerContract(userAccount);

            // Save to localStorage
            localStorage.setItem('walletAddress', userAccount);

        } catch (err) {
            BlockchainLogger.logError('connectMetaMask', err);
            setError(err.message || 'Error connecting to MetaMask');
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const initializeBalanceViewerContract = async (userAccount) => {
        try {
            const provider = getProvider();

            BlockchainLogger.log('📋 Initializing BalanceViewer contract...');
            BlockchainLogger.log('Contract details:', {
                address: DEPLOYED_ADDRESSES.balanceViewerAddress,
                abiMethods: balanceViewerAbi.map(m => m.name || m.type).filter(Boolean),
            });

            const contract = new ethers.Contract(
                DEPLOYED_ADDRESSES.tokenAddress,
                tokenAbi,
                provider
            );

            setBalanceViewerContract(contract);
            BlockchainLogger.log('✅ BalanceViewer contract initialized');

            // Fetch balance after contract is initialized
            if (userAccount) {
                await getUserWTSWPBalance(userAccount, contract);
            }
        } catch (err) {
            BlockchainLogger.logError('initializeBalanceViewerContract', err);
            setError('Failed to initialize contract');
        }
    };

    const getUserWTSWPBalance = async (userAccount = account, contract = balanceViewerContract) => {
        try {
            if (!userAccount) {
                BlockchainLogger.log('⚠️  No account available for balance check');
                setBalance(null);
                return;
            }

            if (!contract) {
                BlockchainLogger.log('⚠️  BalanceViewer contract not initialized');
                return;
            }

            BlockchainLogger.log('📊 Fetching WTSWP token balance for:', userAccount);

            // Call getTokenBalance
            const balance = await contract.balanceOf(userAccount);
            console.log("Raw balance from contract:", balance.toString());
            const formattedBalance = ethers.formatUnits(balance, 18);
            setBalance(formattedBalance);

            BlockchainLogger.log('✅ Balance fetched:', {
                raw: balance.toString(),
                formatted: formattedBalance,
            });
        } catch (err) {
            BlockchainLogger.logError('getUserWTSWPBalance', err);
            setError('Failed to fetch balance. Check console for details.');
            // Don't throw - let UI handle gracefully
        }
    };

    const refreshBalance = async () => {
        if (account && balanceViewerContract) {
            await getUserWTSWPBalance(account, balanceViewerContract);
        }
    };

    const getDirectTokenBalance = async () => {
        try {
            if (!account) return null;
            const provider = getProvider();
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== 1337 && Number(network.chainId) !== 5777) {
            throw new Error("Please switch MetaMask to the local Ganache network.");
            }
            const tokenContract = new ethers.Contract(
                DEPLOYED_ADDRESSES.tokenAddress,
                tokenAbi,
                provider
            );
            const balance = await tokenContract.balanceOf(account);
            return ethers.formatEther(balance);
        } catch (err) {
            BlockchainLogger.logError('getDirectTokenBalance', err);
            return null;
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                setAccount(null);
                setIsConnected(false);
                setBalance(null);
                BlockchainLogger.log('👤 Account disconnected');
            } else if (accounts[0] !== account) {
                BlockchainLogger.log('👤 Account changed to:', accounts[0]);
                setAccount(accounts[0]);
                if (balanceViewerContract) {
                    getUserWTSWPBalance(accounts[0], balanceViewerContract);
                }
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [account, balanceViewerContract]);

    const contextValue = {
        account,
        balance,
        error,
        isConnected,
        loading,
        connectMetaMask,
        refreshBalance,
        getDirectTokenBalance,
        DEPLOYED_ADDRESSES,
    };

    return (
        <MetaMaskContext.Provider value={contextValue}>
            {children}
        </MetaMaskContext.Provider>
    );
};
