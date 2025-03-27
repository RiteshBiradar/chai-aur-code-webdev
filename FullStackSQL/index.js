import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
const app = express()
const port = 3000 
import router from "./routes/auth.router.js"


app.use(cors({
    origin : 'http://localhost:5173'
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/auth/",router)

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.listen(port,()=>{
    console.log(`Listening at port ${port}`)
})