import { getModel } from "../config/llmModel.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { checkAgentLimit } from "../config/agentlimit.js"

export const visionAgent = async (state) => {

  try {
    await checkAgentLimit(state.userId,"image")
    const llm = await getModel("image")

    console.log("🔥 LLM TYPE:", typeof llm)
    console.log("🔥 LLM INVOKE:", typeof llm?.invoke)

    // 1. Generate detailed image prompt
    const res = await llm.invoke(`
      You are an elite AI image prompt engineer.

      Convert the user request into a highly detailed image generation prompt.

      Requirements:
      - Cinematic lighting
      - Professional composition
      - Ultra realistic
      - High detail
      - Beautiful color palette
      - Sharp focus
      - 8K quality
      - Photorealistic
      - Depth of field
      - Professional photography
      - Stunning visuals

      Return only the image prompt.

      User Request:
      ${state.prompt}
    `)

    const prompt = res.content.trim()

    console.log("🔥 GENERATED PROMPT:", prompt)

    // 2. Generate image using Pollinations
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer"
    })

    // 3. Convert response to buffer
    const buffer = Buffer.from(imageRes.data)

    // 4. Detect actual image type
    const contentType =
      imageRes.headers["content-type"] || "image/jpeg"

    const extension = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : "jpg"

    const filename = `image-${Date.now()}.${extension}`

    console.log("🔥 IMAGE CONTENT TYPE:", contentType)
    console.log("🔥 IMAGE FILENAME:", filename)

    // 5. Upload to S3
    await uploadToS3(
      filename,
      buffer,
      contentType
    )

    console.log("🔥 IMAGE UPLOADED TO S3")

    // 6. Generate signed URL - 10 minutes
    const downloadUrl = await getFromS3(
      filename,
      10 * 60
    )

    console.log("🔥 FINAL IMAGE URL:", downloadUrl)

    // 7. Return response
    return {
      ...state,

      aiResponse: `
![Generated Image](${downloadUrl})

⬇️ [Download Image](${downloadUrl})

⏳ Link expires in 10 minutes.
      `
    }

  } catch (error) {

    console.log(error)
            return{
                ...state,
                aiResponse:error?.data?.message || "failed to generate image",
          
     }
  }
}