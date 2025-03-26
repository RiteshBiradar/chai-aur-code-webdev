import jwt from "jsonwebtoken"
import dontenv from "dotenv"
dontenv.config()
export const isLoggedIn = async (req,res,next)=>{
    try {
        const token = req.cookies?.token
        console.log("token",token?"Yes":"No")
        if(!token){
            return res.status(401).json({
                message : "Authentication failed",
                success : false
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log("decoded data",decoded)
        req.user = decoded

        next();
    } catch (error) {
        console.log("Authentication failed",error)
        res.status(500).json({
            message : "Internal server error",
            success : false
        })
    }
}