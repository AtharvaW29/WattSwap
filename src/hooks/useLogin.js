import { useAuthContext } from "./useAuthContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export const useLogin = () => {
    const { dispatch } = useAuthContext()
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const navigate = useNavigate()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })
        const json = await response.json()

        if(!response.ok){
            setIsLoading(false)
            setError(json.error)
        }
        if(response.ok){
            //save to local
            localStorage.setItem('user', JSON.stringify(json))
            //update auth context
            dispatch({type: 'LOGIN', payload: json})
            //redirect  the user
            navigate('/home')

            setIsLoading(false)
        }
    }
    return { login, isLoading, error }
}