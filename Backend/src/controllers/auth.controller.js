import { response } from "express";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import {ENV} from "../lib/env.js"


//signup end point
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
                // after CR:
                // Persist user first, then issue auth cookie
                const savedUser = await newUser.save();
                generateToken (savedUser._id, res);
    
                res.status(201).json({
                    _id:newUser._id,
                    email:newUser.email,
                    fullName:newUser.fullName,
                    profilePic:newUser.profilePic,
                });
                
                try {
                    await sendWelcomeEmail(savedUser.email,savedUser.fullName,ENV.CLIENT_URL)
                } catch (error) {
                    console.log("failed to send welcome email")
                }


            }
        } catch (error) {
            console.log("error in signup controller"+error)
            res.status(500).json({message:"internal server error"})
        }
           
};

//login end point
export const login=async (req,res)=>{
    const{email,password}=req.body

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"invalid credentials"});
        console.log("user checked ");
        console.log(user.password );
        console.log(user.email);
        console.log(password );
        //console.log(user );
        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect) res.status(400).json({message:"Invalid credentials"});
 console.log("pwd checked ");

         generateToken(user._id, res)
    
                res.status(200).json({
                    _id:user._id,
                    email:user.email,
                    fullName:user.fullName,
                    profilePic:user.profilePic,
                });

    } catch (error) {
        console.log("error in login controller",error)
        res.status(500).json({message:"Internal server error"})
    }
    //res.send("login endpoint")
};

//logout end point
export const logout=async (_,res)=>{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logout endpoint"})
};


export const updateProfile = async (req,res)=>{

    try {
        const {profilePic} = req.body;
        if(!profilePic) return res.status(401).json({message:"porfile pic is required"})
    
        const userId= req.user._id;
    
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
    
        const updatedUser = await User.findByIdAndUpdate(userId,
            {profilePic:uploadResponse.secure_url},
            {new:true}
        )
        
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in update profile",error)
        res.status(500).json({message:"Internal server error"})
        
    }



}







