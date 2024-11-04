import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { createContext, useState,useEffect } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate } from "react-router";

export const AppContext = createContext()

export const AppContextProvider = (props)=>{
    const [credits, setCredits] = useState(false);
    const [image, setImage] = useState(false);
    const [resultimage, setResultImage] = useState(false);

    const navigate = useNavigate()
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const {getToken} = useAuth()
    const {isSignedIn} = useUser()
    const {openSignIn} = useClerk()
    
    const loadCreditsData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(backendURL + '/api/user/credits', { headers: { token } })
            if (data.success) {
                setCredits(data.credits)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

  const removeBg = async (image) => {
    try {

        if (!isSignedIn) {
            return openSignIn()
        }

        setResultImage(false)
        setImage(image)

        navigate('/result')

        const token = await getToken()

        const formData = new FormData()
        image && formData.append('image', image)

        const { data } = await axios.post(backendURL + '/api/image/remove-bg', formData, { headers: { token } })

        if (data.success) {
            setResultImage(data.resultImage)
            data.creditBalance && setCredits(data.creditBalance)
        } else {
            toast.error(data.message)
            data.creditBalance && setCredits(data.creditBalance)
            if (data.creditBalance === 0) {
                navigate('/buy')
            }
        }

    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }

}

 
  
 const value = {
     credits,setCredits,loadCreditsData,backendURL,image,setImage,removeBg,resultimage,setResultImage
 }
 return (
  <AppContext.Provider value={value}>
  {props.children}
</AppContext.Provider>
 )
}
