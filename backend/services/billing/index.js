import dotenv from "dotenv"
import express from "express"
import connectDb from "./config/db.js"

dotenv.config()

const port=process.env.PORT

const app=express()
app.use(express.json())  // middileware used to fetch data from req.body 


app.get("/",(req,res)=>{
    res.json({message:"hello from billing"})
})

app.listen(port,()=>{
    console.log(`billing started at ${port}`);
    connectDb()
    
})

