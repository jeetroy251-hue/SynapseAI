import api from "../utils/axios.js";

export const createOrder=async (plan)=>{
    try {
        const {data}=await api.post("/api/billing/create",{plan})
        return data
        
    } catch (error) {
        console.error(
            "Create order error:",
            error.response?.data || error.message
        );

        throw error;
    }
}