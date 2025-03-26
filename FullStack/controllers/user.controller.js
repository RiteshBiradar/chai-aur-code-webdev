import User from "../models/userSchema.js";
import crypto from "crypto"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const registerUser = async (req,res)=>{
    const {name,email,password} = req.body
    if(!name || !email || !password){
        return res.status(400).json({
            message : "All fields are required"
        })
    }
    try {
        const existingUser = await User.findOne({email})
        if(existingUser){
        return res.status(400).json({
            message:"User already exists"
        })
        }
        const user = await User.create({
            name,
            email,
            password
        })
        if(!user){
            return res.status(400).json({
                message:"User not registered"
            })
        }
        const token = crypto.randomBytes(32).toString("hex")
        user.verifiedPassToken = token
        await user.save()


        const transport = nodemailer.createTransport({
            host: process.env.MAILSTRAP_HOST,
            port: process.env.MAILSTRAP_PORT,
            auth: {
              user: process.env.MAILSTRAP_USER,
              pass: process.env.MAILSTRAP_PASS
            }
          });

          await transport.sendMail({
            from: process.env.MAILSTRAP_HOST, 
            to: user.email, 
            subject: "Welcome to my authentication ", 
            text: `Please click the below the link : ${process.env.BASE_URL}/api/auth/users/verify/${user.verifiedPassToken}`, 
          });
          console.log(user)
          res.status(201).json({
            message:"User registered successfully",
            success : true
          })
     } catch (error) {
        res.status(400).json({
            message:"User registeration failed",
            success : true,
            error
          })
    }
};

const verifyUser = async (req,res)=>{
    const {token} = req.params; 
    if(!token){
        res.status(400).json({
            message : "Invalid token"
        })
    }
    const user = await User.findOne({verifiedPassToken:token})
    if(!user){
        res.status(400).json({
            message : "No such user exists"
        })        
    }
    user.isVerified = true;
    user.verifiedPassToken = undefined 
    await user.save()
    res.status(201).json({
        message : "User verified successfully",
        success : true
    })
}

const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400).json({
            message : "All fields are required"
        })   
    }
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message : "Please signup first"
            })  
        }
        if(user.isVerified===false){
            return res.status(400).json({
                message : "Please verify your account"
            }) 
        }
        const isValidPass = await bcrypt.compare(password,user.password);
        if(!isValidPass){
            return res.status(400).json({
                message : "Enter valid password"
            }) 
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const cookieOptions = {
            httpOnly : true,
            secure : true
        }
        res.cookie("token",token,cookieOptions)
        res.status(200).json({
            message:"Login successfull",
            success:true,
            token 
        })
    }
    catch(error){
        res.status(400).json({
            message:"User login failed",
            error
          })
    }
}

const getProfile = async(req,res)=>{
    try {
        const data = req.user
        const user = await User.findById(req.user.id).select('-password')
        if(!user){
            return res.status(400).json({
                message : "Not a valid user",
                success : false
            })
        }
        res.status(201).json({
            message : "User profile",
            success : true,
            user
        })
    } catch (error) {
        return res.status(400).json({
            message : "Something failed"
        })
    }
}

const logoutUser = async(req,res)=>{
    res.cookie('token','')
    return res.status(201).json({
        message : "User logged out successfully",
        success : true
    })
}

const forgetPassword = async(req,res)=>{
    const {email} = req.body
    if(!email){
        return res.status(400).json({
            message : "Enter a valid email"
        })
    }
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message : "Enter a valid email"
            })        
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpiry = Date.now() + 10*60*1000 
        user.resetPasswordToken = resetToken 
        user.resetPasswordExpires = resetExpiry
        user.save();

        const transport = nodemailer.createTransport({
            host: process.env.MAILSTRAP_HOST,
            port: process.env.MAILSTRAP_PORT,
            auth: {
              user: process.env.MAILSTRAP_USER,
              pass: process.env.MAILSTRAP_PASS
            }
          });

          await transport.sendMail({
            from: process.env.MAILSTRAP_HOST, 
            to: user.email, 
            subject: "Welcome to my authentication ", 
            text: `Please click the below the link : ${process.env.BASE_URL}/api/auth/users/resetPass/${user.resetPasswordToken}`, 
          });
          res.status(201).json({
            message : "We have sent a link to your email",
            success : true
          })
    } 
    catch (error) {
            res.status(400).json({
                message : "Internal Server Error",
                success : false
        })
    }
}

const resetPassword = async(req,res)=>{
    const {token} = req.params
    const {password} =req.body
    // console.log(password)
    if(!token || !password){
        return res.status(401).json({
            message : "All fields are required"
        })
    }
    try {  
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpires : {$gt: Date.now()}
        })
        if(!user){
            return res.status(401).json({
                message : "User not found"
            })            
        }
        user.password = password
        user.resetPasswordExpires = ""
        user.resetPasswordToken = ""
        user.save()
        res.status(201).json({
            message : "Your password has been reset",
            success : true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message : "Internal Server error"
        })                    
    }
}
export {registerUser , verifyUser ,loginUser, getProfile , logoutUser, forgetPassword ,resetPassword}