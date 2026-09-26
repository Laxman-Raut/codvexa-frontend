 import { api } from "../utils/axios.js"
 export const  login = async (token)=>{

    try{
        const {data} =await api.post("/api/auth/login",{token})
        console.log(data)
        return data
    } catch (error){
  console.log(error)
  return null
    }
    }
    
