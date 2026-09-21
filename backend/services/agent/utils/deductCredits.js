import axios from "axios"

export const deductCredits = async (userId, agent) => {

    console.log("========================================")
    console.log("========== DEDUCT CREDITS REQUEST ==========")
    console.log("========================================")

    console.log("USER ID:", userId)
    console.log("AGENT:", agent)
    console.log("AUTH SERVICE:", process.env.AUTH_SERVICE)

    try {

        const { data } = await axios.post(
            `${process.env.AUTH_SERVICE}/deduct-credits`,
            {
                userId,
                agent
            }
        )

        console.log("========== DEDUCT CREDITS SUCCESS ==========")
        console.log("AUTH RESPONSE:", data)

        return data

    } catch (error) {

        console.error("========================================")
        console.error("========== CREDIT DEDUCTION FAILED ==========")
        console.error("========================================")

        console.error(
            "STATUS:",
            error.response?.status
        )

        console.error(
            "RESPONSE:",
            error.response?.data
        )

        console.error(
            "MESSAGE:",
            error.message
        )

        console.error("========================================")

        throw error
    }
}