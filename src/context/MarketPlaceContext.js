import { createContext, useReducer } from "react";

export const MarketPlaceContext = createContext()

export const MarketPlaceReducer = (state, action) => {
    switch(action.type){
        case 'SET_MARKETPLACE_LISTING':
            return{
                marketPlaceListings: action.payload
            }
        case 'CREATE_MARKETPLACE_LISTING':
            return{
                marketPlaceListings: [action.payload, ...state.marketPlaceListings]
            }
        case 'DELETE_MARKETPLACE_LISTING':
            return{
                marketPlaceListings: state.marketPlaceListings.filter((marketPlaceListing) => marketPlaceListing._id !== action.payload._id)
            }
        default:
            return state
    }
}

export const MarketPlaceContextProvider = ({ children }) => {
    const [state, set] = useReducer(MarketPlaceReducer, {
        marketPlaceListings: null
    })

    return(
        <MarketPlaceContext.Provider value={{...state, set}}>
            {children}
        </MarketPlaceContext.Provider>
    )
}