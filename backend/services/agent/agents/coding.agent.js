import { getModel } from "../config/llmModel.js"

export const codingAgent = async (state) => {
    try {
        const intentLlm = await getModel("intent")
        const llm = await getModel("coding")

        const intentResponse = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these exact values:

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

        const intent = intentResponse.content.trim()

        console.log("CODING INTENT:", intent)

        // =========================
        // CODE GENERATION
        // =========================

        if (intent === "CODE_GENERATION") {

            const prompt = `
You are SynapseAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React/Next.js/Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth animations
- Hover effects
- Beautiful spacing
- Single page unless user asks otherwise

FILES
==================

Return exactly these files:

1. index.html
2. style.css
3. script.js

index.html:
- Only HTML structure
- Do NOT include <script src="script.js"></script>
- Do NOT include <link rel="stylesheet" href="style.css">

style.css:
- Put ALL CSS here

script.js:
- Put ALL JavaScript here

IMPORTANT:
- Make the website fully functional.
- Do not use placeholder services.
- Do not use local image paths.
- Use real HTTPS image URLs only when images are needed.

OUTPUT FORMAT
==================

Return ONLY valid JSON.

The response MUST follow exactly this structure:

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

IMPORTANT:
- Start directly with {
- End directly with }
- No markdown
- No \`\`\`
- No explanation
- No extra text

User Request:
${state.prompt}
`

            const response = await llm.invoke(prompt)

            let raw = response.content.trim()

            console.log("========== CODING RAW RESPONSE ==========")
            console.log(raw)

            // Remove markdown code fences if model adds them
            raw = raw
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim()

            let data

            try {
                data = JSON.parse(raw)
            } catch (parseError) {

                console.error("========== JSON PARSE ERROR ==========")
                console.error(parseError)
                console.error("RAW MODEL RESPONSE:")
                console.error(raw)

                throw new Error(
                    `Coding agent returned invalid JSON: ${parseError.message}`
                )
            }

            if (!data.files || !Array.isArray(data.files)) {
                throw new Error("Coding agent response does not contain valid files array")
            }

            console.log("FILES GENERATED:", data.files.length)

            return {
                ...state,

                aiResponse: "Code generated successfully",

                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: data.files,
                        title: state.prompt
                    }
                ]
            }
        }

        // =========================
        // OTHER CODING REQUESTS
        // =========================

        const response = await llm.invoke(`
The user's request is:

${state.prompt}

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

        return {
            ...state,
            aiResponse: response.content,
            artifacts: []
        }

    } catch (error) {

        console.error("========== CODING AGENT ERROR ==========")
        console.error("MESSAGE:", error.message)
        console.error("STACK:", error.stack)

        throw error
    }
}