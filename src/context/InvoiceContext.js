import { createContext, useReducer } from "react";

export const InvoiceContext = createContext();

export const InvoiceReducer = (state, action) => {
    switch(action.type){
        case 'SET_INVOICE':
            return{
                invoice: action.payload
            }
        case 'CREATE_INVOICE':
            const newInvoice = action.payload
            return{
                invoice: state.invoice === null ? [newInvoice] : [newInvoice, ...state.invoice]
            }
        default:
            return state
    }
}

export const InvoiceContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(InvoiceReducer, {
        invoice: null
    })

    return(
        <InvoiceContext.Provider value={{...state, dispatch}}>
            {children}
        </InvoiceContext.Provider>
    )
}