import { useContext } from "react";
import { MetaMaskContext } from "../context/MetaMaskContext";

export const useMetaMaskContext = () => {
    const context = useContext(MetaMaskContext)

    if(!context){
        throw Error('useMetaMaskContext must be used inside a MetaMaskContextProvider')
    }

    return context
}