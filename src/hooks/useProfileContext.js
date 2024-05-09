import { ProfileContext } from "../context/ProfieContext";
import { useContext } from "react";

export const useProfileContext = () => {
    const context = useContext(ProfileContext)

    if(!context) {
        throw Error('useProfileContext must be used inside ProfileCOntextProvider')
    }

    return context
}