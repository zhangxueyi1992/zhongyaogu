import axios from "axios"

export async function localCall(request, sendData){
    return axios.post(request, sendData, {
      headers:{
        "Content-Type": "application/json"
      }
    })
}