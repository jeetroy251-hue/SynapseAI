import {getAuth} from "firebase-admin/auth"
import User from "../models/user.model.js";
import { app } from "../config/firebase.js";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";

export const login=async(req,res)=>{
    try{
        const {token}=req.body
        const decoded=await getAuth(app).verifyIdToken(token)
        let user=await User.findOne({
            firebaseUid:decoded.uid
        })

        if(!user){
            user=await User.create({
                firebaseUid:decoded.uid,
                name:decoded.name,
                email:decoded.email,
                avatar:decoded.picture
            })
        }

        const sessionId=crypto.randomUUID()  // whenever user done a payment , the plan of the user doen not get updated since the session is not getting updated instantly , so we store the sessionId in the redis 

        await redis.set(`user-session-${user?._id}`,
        sessionId
        ,"EX",7*24*60*60)

        await redis.set(`session-${sessionId}`,JSON.stringify({
            userId:user._id,
            name:user.name,
            email:user.email,
            avatar:user.avatar,
             plan:user.plan,
            credits:user.credits,
            totalCredits:user.totalCredits,
            planExpiresAt:user.planExpiresAt
        }),"EX",7*24*60*60)

        res.cookie("session",sessionId,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })

        return res.status(200).json(user)
    }catch(error){
        return res.status(500).json({message:`login error ${error}`})
    }
    
}

export const logOut=async (req,res)=>{
    try{
        const sessionId=req.cookies?.session
        await redis.del(`session-${sessionId}`)

        res.clearCookie("session")
        return res.status(200).json({message:"logout seccessfull"})
    }catch(error){
        return res.status(500).json({message:`logout error ${error}`})
    }
}

export const updateUserPayment=async (req,res)=>{
    try {
        const {plan,credits,userId,sessionId}=req.body
        const user=await User.findById(userId)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        user.plan=plan
        user.credits+=credits
        user.totalCredits+=credits
        user.planExpiresAt=new Date(Date.now()+30*24*60*60*1000)
        await user.save()

        const activeSessionId = sessionId || await redis.get(`user-session-${user?._id}`)
        if (activeSessionId) {
            await redis.set(`session-${activeSessionId}`,JSON.stringify({
             userId:user._id,
            name:user.name,
            email:user.email,
            avatar:user.avatar,
            plan:user.plan,
            credits:user.credits,
            totalCredits:user.totalCredits,
            planExpiresAt:user.planExpiresAt
            }),"EX",7*24*60*60)
        }

        return res.status(200).json(user)
           

    } catch (error) {
        console.error("Update user payment error:", error)

    return res.status(500).json({
        message: `Update user payment error: ${error.message}`
    })
    }
}