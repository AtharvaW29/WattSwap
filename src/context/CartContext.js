import { createContext, useReducer } from "react";

export const CartContext = createContext();

export const CartReducer = (state, action) => {
    switch(action.type){
        case 'CART_ADD_ITEM':
            return{
                cart: [action.payload, ...state.cart]
            }
        case 'CART_SET_ITEM':
            return{
                cart: action.payload
            }
        case 'CART_DELETE_ITEM':
            return{
                cart: state.cart.filter((cart) => cart._id !== action.payload._id)
            }
    }
}

export const CartContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(CartReducer, {
        cart: [null]
    })

    return(
        <CartContext.Provider value={{...state, dispatch}}>
            {children}
        </CartContext.Provider>
    )
}