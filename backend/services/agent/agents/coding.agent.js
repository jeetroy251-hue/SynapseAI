import { getModel } from "../config/llmModel.js"

export const codingAgent = async (state) => {
    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")
    const intentResponse = await intentLlm.invoke(`
        You are an intent classifier.

        Return ONLY one of these values.

        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION

        User Request:
        ${state.prompt}
        `)
    const intent = intentResponse.content
    if (intent == "CODE_GENERATION") {
        const prompt = `
            You are SynapseAI Coding Agent.

            Generate the requested project.

            Default stack:
            - HTML
            - CSS 
            - JavaScript

            Use React/Next.js/ Vue ONLY if explicitly requested

            Rules:

            - Responsive
            - Modern UI
            - CSS Variables
            - Flexbox/Grid
            - Smooth Scroll
            - Hover Effects
            - Beautiful spacing
            - Single page unless user asks otherwise.
           IMAGES
==================

When the user requests images, use real Unsplash images.

Rules:
- Every image must have a unique relevant image URL.
- Use different images for different items.
- Pizza → pizza image
- Burger → burger image
- Pasta → pasta image
- Salad → salad image
- Never use the same image URL for multiple different items.
- Never use placeholder services.
- Never use local or relative image paths.

Use complete HTTPS URLs from images.unsplash.com.

Example:

Pizza:
https://images.unsplash.com/photo-1574071318508-1cdbab80d002

Burger:
https://images.unsplash.com/photo-1568901346375-23c9450c58cd

Pasta:
https://images.unsplash.com/photo-1473093295043-cdd812d0e601

Salad:
https://images.unsplash.com/photo-1512621776951-a57141f2eefd

FILES
==================

- index.html must contain only HTML structure.
- Do NOT include <script src="script.js"></script>.
- Do NOT include <link rel="stylesheet" href="style.css">.
- CSS and JavaScript are injected automatically by the preview system.
- Put all CSS inside style.css.
- Put all JavaScript inside script.js.

            Return ONLY valid JSON.

            Schema:

            {
            "files":[
            {
               "name":"index.html",
               "content":"..." 
            },
            {
                "name":"style.css",
                "content":"..."
            },
            {
                "name":"script.js",
                "content":"..."
            }
            ]
            }

            Rules:

            - Output must start with{
            - Output must end with }
            - No markdown
            - No explanation
            - No extra text
            - No \`\`\`
            - Never mention intent

            User Request:
             ${state.prompt}
            `
        const res = await llm.invoke(prompt)
        const raw = res.content.trim()
        const data = JSON.parse(raw)

        return {
            ...state,
            aiResponse: "Code generated successfully",
            artifacts: [
                {
                    id: Date.now(),
                    type: "Project",
                    files: data.files || [],
                    title: state.prompt

                }
            ]
        }
    }

    const res = await llm.invoke(`
            The user's request is:

            ${intent}

            Return Markdown only.

            Never generate project files.

            Use headings like:

            # Overview 

            ## Explanation

            ## Problems

            ## Improvements

            ## Best Practices

            ## Optimized Code (if needed)

            User Request:

            ${state.prompt}
            `)

    const data = res.content
    return {
        ...state,
        aiResponse: data,
        artifacts: []
    }
}