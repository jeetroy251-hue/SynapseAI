import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"

dotenv.config()

const port=process.env.PORT

const app=express()

app.use(express.json({ limit: "50mb" }))  // when we will be uploading a large size image The 413 Payload Too Large error occurs because your HTTP request body exceeds the payload size limit configured in Express or your proxy server (express-http-proxy). When sending base64 image strings or large raw image binary data directly through the request body to /api/agent/chat, Express rejects it before reaching your handler.
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(cookieParser())
app.use(morgan("dev"))

app.use("/api/auth",proxy(process.env.AUTH_SERVICE))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE))
app.get("/api/me",protect,getCurrentUser)


app.get("/",(req,res)=>{
    res.json({message:"hello from gateway"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`);
    
})

