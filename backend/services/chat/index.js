import dotenv from "dotenv"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/chat.route.js"

dotenv.config()

const port=process.env.PORT

const app=express()
app.use(express.json())  // middileware used to fetch data from req.body 
app.use("/",router)

app.get("/",(req,res)=>{
    res.json({message:"hello from chat"})
})

app.listen(port,()=>{
    console.log(`chat started at ${port}`);
    connectDb()
    
})

