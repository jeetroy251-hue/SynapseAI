import axios from "axios"
import { graph } from "../graph/graph.js"
import {addMessage} from "../config/memory.js"
import redis from "../../../shared/redis/redis.js"
import { deductCredits } from "../utils/deductCredits.js"

export const agent=async (req,res)=>{
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        const userId=req.headers["x-user-id"]

        if(!userId){
            return res.status(400).json({message:"User ID missing"})
        }

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"user",content:prompt
        })
        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })

        await deductCredits(userId,result.agent)



        await addMessage(conversationId,"user",prompt)

        await addMessage(conversationId,"assistant",result.aiResponse)

         await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"assistant",content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        })

        return res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })

    } catch (error) {
        return res.status(500).json({message:`agent error ${error}`})
    }
}