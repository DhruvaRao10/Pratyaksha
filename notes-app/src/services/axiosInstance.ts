//@ts-nocheck
import axios, {AxiosInstance} from "axios" ; 


const axiosClient: AxiosInstance = axios.create({
     baseURL: "http://localhost:8000" , 
     headers: {
          "Content-type": "application/json", 
     },
}); 

export default axiosClient