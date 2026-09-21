import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import redis from "../../../shared/redis/redis.js"
import { deductCredits } from "../utils/deductCredits.js"

export const agent = async (req, res, next) => {
    try {

        console.log("========================================")
        console.log("========== AGENT REQUEST START ==========")
        console.log("========================================")

        const { prompt, conversationId, agent } = req.body
        const file = req.file || null
        const userId = req.headers["x-user-id"]

        console.log("REQUEST DATA:", {
            prompt,
            conversationId,
            agent,
            userId,
            hasFile: !!file
        })

        if (!userId) {
            console.log("❌ USER ID MISSING")

            return res.status(400).json({
                message: "User ID missing"
            })
        }

        // ========================================
        // SAVE USER MESSAGE - CHAT SERVICE
        // ========================================

        console.log("========== CHAT SERVICE USER SAVE START ==========")

        await axios.post(
            `${process.env.CHAT_SERVICE}/save-message`,
            {
                conversationId,
                role: "user",
                content: prompt
            }
        )

        console.log("========== CHAT SERVICE USER SAVE COMPLETE ==========")


        // ========================================
        // GRAPH START
        // ========================================

        console.log("========================================")
        console.log("========== GRAPH START ==========")
        console.log("========================================")

        const result = await graph.invoke({
            prompt,
            conversationId,
            agent,
            userId,
            file
        })

        // ========================================
        // GRAPH COMPLETE
        // ========================================

        console.log("========================================")
        console.log("========== GRAPH COMPLETE ==========")
        console.log("========================================")

        console.log("RESULT AGENT:", result?.agent)
        console.log("RESULT AI RESPONSE:", result?.aiResponse)
        console.log("RESULT IMAGES:", result?.images?.length)
        console.log("RESULT ARTIFACTS:", result?.artifacts?.length)

        // ========================================
        // DEDUCT CREDITS
        // ========================================

        console.log("========================================")
        console.log("========== DEDUCT START ==========")
        console.log("========================================")

        await deductCredits(
            userId,
            result.agent
        )

        console.log("========================================")
        console.log("========== DEDUCT COMPLETE ==========")
        console.log("========================================")


        // ========================================
        // MEMORY - USER MESSAGE
        // ========================================

        console.log("========== USER MEMORY SAVE START ==========")

        await addMessage(
            conversationId,
            "user",
            prompt
        )

        console.log("========== USER MEMORY SAVE COMPLETE ==========")


        // ========================================
        // MEMORY - ASSISTANT MESSAGE
        // ========================================

        console.log("========== ASSISTANT MEMORY SAVE START ==========")

        await addMessage(
            conversationId,
            "assistant",
            result.aiResponse
        )

        console.log("========== ASSISTANT MEMORY SAVE COMPLETE ==========")


        // ========================================
        // SAVE ASSISTANT MESSAGE - CHAT SERVICE
        // ========================================

        console.log("========================================")
        console.log("========== CHAT SERVICE ASSISTANT SAVE START ==========")
        console.log("========================================")

        await axios.post(
            `${process.env.CHAT_SERVICE}/save-message`,
            {
                conversationId,
                role: "assistant",
                content: result?.aiResponse,
                images: result?.images,
                artifacts: result?.artifacts
            }
        )

        console.log("========================================")
        console.log("========== CHAT SERVICE ASSISTANT SAVE COMPLETE ==========")
        console.log("========================================")


        // ========================================
        // SEND RESPONSE TO FRONTEND
        // ========================================

        console.log("========================================")
        console.log("========== SENDING RESPONSE ==========")
        console.log("========================================")

        return res.status(200).json({
            answer: result?.aiResponse,
            images: result?.images,
            artifacts: result?.artifacts
        })

    } catch (error) {

        console.error("========================================")
        console.error("========== AGENT ERROR ==========")
        console.error("========================================")

        console.error("ERROR MESSAGE:", error?.message)
        console.error("ERROR RESPONSE:", error?.response?.data)
        console.error("ERROR STATUS:", error?.response?.status)
        console.error("ERROR STACK:", error?.stack)

        console.error("========================================")

        next(error)
    }
}