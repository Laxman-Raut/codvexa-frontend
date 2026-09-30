 import { api } from "../utils/axios.js"
 export const  me = async ()=>{

    try{
        const {data} =await api.post("/api/me")
        console.log(data)
        return data
    } catch (error){
  console.log(error)
  return null
    }
    }
    
