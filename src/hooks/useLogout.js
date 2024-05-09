import { useAuthContext } from "./useAuthContext"
import { useNavigate } from "react-router-dom"

export const useLogout = () => {

    const{ dispatch } = useAuthContext()
    const navigate  = useNavigate()

    const logout = () => {
        //remove user from storage
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
        localStorage.removeItem('wallet')
        localStorage.removeItem('invoice')
        localStorage.removeItem('Time')
        
        //dispatch logout action
        dispatch({type: 'LOGOUT'})

        //redirect to login
        navigate('/')
    }
    return { logout }
}