import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export const register = async (req,res)=>{
    res.send("User registered")
    await prisma.user.findUnique({
        where : {email}
    })
}