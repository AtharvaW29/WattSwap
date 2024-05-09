import { useContext } from "react";
import { ListingContext } from "../context/ListingContext";

export const useListingContext = () => {
    const context = useContext(ListingContext)

    if(!context){
        throw Error('useListingContext must be used inside a ListingContextProvider')
    }

    return context
}