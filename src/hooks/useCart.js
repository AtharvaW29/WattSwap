import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export const useCartContext = () => {
    const context = useContext(CartContext)

    if(!context){
        throw Error('useListingContext must be used inside a CartContextProvider')
    }

    return context
}