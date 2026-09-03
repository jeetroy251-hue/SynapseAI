import { getModel } from "../config/llmModel.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { generatePdf } from "../utils/generatePdf.js"

export const pdfAgent=async(state)=>{
    try {
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


        const data=JSON.parse(res.content)
        const pdfBuffer= await generatePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        await uploadToS3(filename,pdfBuffer,"application/pdf")

        const downloadUrl=await getFromS3(filename,60*10)

        return{
            ...state,
            aiResponse: `# PDF Generated

            **${data.title}**

            [Download PDF](${downloadUrl})

            _Link expires in 10 minutes._
            `
        }

    } catch (error) {
        console.log(error)
       return{
        ...state,
        aiResponse:"Failed to generate pdf"
       }

    }
}