import { createContext, useReducer } from 'react'

export const ProfileContext = createContext()

export const profileReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PROFILE':
            return {
                userprofile: action.payload
            }
        case 'CREATE_PROFILE':
            return {
                userprofile: [action.payload, ...state.userprofile]
            }
        default:
            return state
    }
}

export const ProfileContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(profileReducer, {
        userprofile: [null]
    })

    return (
        <ProfileContext.Provider value={{...state, dispatch}}>
        {children}
        </ProfileContext.Provider>
    )
}