import { checkAgentLimit } from "../config/agentlimit.js"
import { searchTool } from "../config/tavily.js"

export const searchAgent=async(state)=>{
    try {
        await checkAgentLimit(state.userId,"search")
        const results=await searchTool.invoke({
            query:state.prompt
        })
        console.log(results)
        return {
            ...state,
            searchResults:results,
            images:results.images
        }
    } catch (error) {
         console.log(error)
            return{
                ...state,
                searchResults:[],
                images:[],
                aiResponse:error?.data?.message || "failed to generate search ",
              
            }
    }
}