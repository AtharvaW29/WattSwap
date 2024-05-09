import { useContext } from "react";
import { MarketPlaceContext } from "../context/MarketPlaceContext";

export const useMarketPlaceContext = () => {
    const context = useContext(MarketPlaceContext)

    if(!context){
        throw Error('useMarketPlaceContext must be used inside a MarketPlaceContextProvider')
    }

    return context
}