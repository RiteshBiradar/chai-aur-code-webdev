import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    name:String,
    email:String,
    password:String,
    role:{
        type : String,
        enum : ["user","admin"], //choose any one from the given
        default : "user"
    },
    isVerified:{
        type:Boolean,
        default : false
    },
    verifiedPassToken:{
        type:String
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    },
},
    {
        timestamps:true, // automatically provides createdAt and updatedAt
    }
)
userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next()   
})
const User = mongoose.model("User",userSchema)
export default User