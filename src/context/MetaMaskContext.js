import React, {useState, createContext} from "react";
import { ethers } from "ethers";
import BalanceOf from '../build/contracts/BalanceOf.json'

export const MetaMaskContext = createContext();

export const MetaMaskContextProvider = ({children}) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState(null);
    const [balanceViewerContract, setBalanceViewerContract] = useState(null);
    const tokenAddress = "0x0bE80B8F1BaBA8C93Bb7082445247DA7A507a321";
    const balanceViewerAddress = "0x6377473C4c0da2607fCD7e65D446BFa680c42382";
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balanceabi = BalanceOf.abi;

    const connectMetaMask = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                initializeBalanceViewerContract();
                localStorage.setItem('wallet', JSON.stringify(account, balance))
            } else {
                alert('Please Install MetaMask to Proceed!')
            }
        } catch (err) {
            console.error(err);
            setError('Error connecting to Metamask.');
        }
    };

    const initializeBalanceViewerContract = () => {
        const balanceViewerContractInstance = new ethers.Contract(balanceViewerAddress, balanceabi, provider);
        setBalanceViewerContract(balanceViewerContractInstance);
        getUserWTSWPBalance();
    };

    const getUserWTSWPBalance = async () => {
        try {
            if (account && balanceViewerContract) {
                const wtswp = await balanceViewerContract.getTokenBalance(tokenAddress, account);
                const formattedBalance = ethers.formatEther(wtswp);
                setBalance(formattedBalance);
            } else {
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching balance.');
        }
    };

    const contextValue = {
        account,
        balance,
        error,
        connectMetaMask
    };

    return(
        <MetaMaskContext.Provider value={contextValue}>
            {children}
        </MetaMaskContext.Provider>
    )
}
