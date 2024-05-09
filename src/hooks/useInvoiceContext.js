import { useContext } from "react";
import { InvoiceContext } from "../context/InvoiceContext";

export const useInvoiceContext = () => {
    const context = useContext(InvoiceContext)

    if(!context){
        throw Error('useListingContext must be used inside a InvoiceContextProvider')
    }

    return context
}