import { response } from "express";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs"

export const signup = async (req,res)=>{
   
    const{fullName,email,password}=req.body

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message:"please fill required fields"});
        }
    
        if(password.length <6 ){
            return res.status(400).json({message:"password must be atleast 6 characters"});
        }
    
        // check if emailis valid: regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            //console.log(email+" - "+emailRegex.test(email))
            if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
            }
    
            const user = await User.findOne({email:email});
            if(user) res.status(400).json({message:"email already exists"})
    
    
            //encryption
            const salt=await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password,salt)
    
            const newUser = new User({
                fullName,
                email,
                password:hashedPassword
    
            })
            console.log(newUser.fullName);
            if(newUser){
                generateToken(newUser._id,res)
                await newUser.save()
    
                res.status(201).json({
                    _id:newUser._id,
                    email:newUser.email,
                    fullName:newUser.fullName,
                    profilePic:newUser.profilePic,
                })
            }
        } catch (error) {
            console.log("error in signup controller"+error)
            res.status(500).json({message:"internal server error"})
        }
           
};








