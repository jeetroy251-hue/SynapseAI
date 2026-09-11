import { getModel } from "../config/llmModel.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { generatePdf } from "../utils/generatePdf.js"
import { checkAgentLimit } from "../config/agentlimit.js"

export const pdfAgent=async(state)=>{

  
    try {
        await checkAgentLimit(state.userId,"pdf")
        const llm=await getModel("pdf")

       console.log("🔥 PDF MODEL:", llm.constructor.name)

        const prompt=`
        You are an expert document writer.

        Return ONLY valid JSON.

        Do NOT return markdown.

        Do NOT return explanations.

        Structure:

        {
        "title":"",
        "subtitle":"",
        "sections":[
        {
        "heading":"",
        "points":[]
        }
        ]
        }

        Generate 4-8 sections.

        Each section should have 3-6 concise bullet points.

        Topic:

        ${state.prompt}
        `

        const res=await llm.invoke(prompt)

      console.log("🔥 FULL RESPONSE:", res)
    console.log("🔥 CONTENT:", res?.content)


if (!res?.content) {
    throw new Error("LLM returned no content")
}


        const raw=typeof res.content==="string" ? res.content : JSON.stringify(res.content)
        const cleaned=raw
            .replace(/^```(?:json)?\s*/i,"")
            .replace(/\s*```$/,"")
            .trim()
        const data=JSON.parse(cleaned)
        const pdfBuffer= await generatePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        await uploadToS3(filename,pdfBuffer,"application/pdf")

        const downloadName=`${data.title || "document"}.pdf`
        const downloadUrl=await getFromS3(filename,60*10,downloadName)

        return{
            ...state,
            aiResponse:
`# PDF Generated

**${data.title || "Your document"}**

[Download PDF](${downloadUrl})

_Download expires in 10 minutes._
`
        }

    } catch (error) {
         console.error("PDF AGENT ERROR:", error)
            return{
                ...state,
                aiResponse:error?.data?.message || `failed to generate pdf: ${error?.message}`
            }

    }
}