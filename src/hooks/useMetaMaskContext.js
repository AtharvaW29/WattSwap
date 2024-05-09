import { useContext } from "react";
import { MetaMaskContext } from "../context/MetaMaskContext";

export const useMetaMaskContext = () => {
    const context = useContext(MetaMaskContext)

    if(!context){
        throw Error('useListingContext must be used inside a MetaMaskContextProvider')
    }

    return context
}