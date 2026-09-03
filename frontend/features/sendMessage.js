import React from 'react'
import api from '../utils/axios'

async function sendMessage  (payload) {
 try {
    const {data}=await api.post("/api/agent/chat",payload)
    return data
 } catch (error) {
    console.log("STATUS:", error.response?.status)
        console.log("BACKEND RESPONSE:", error.response?.data)
        console.log("ERROR:", error)

        throw error

 }
}

export default sendMessage
