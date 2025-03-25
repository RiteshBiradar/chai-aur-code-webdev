import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import db from "./utils/db.js" //sometimes db.js likhna padh sakta

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors(
    {
        origin: process.env.BASE_URL, //from where I am allowing the request
        credentials:true,
        methods : ['GET','POST','PUT','DELETE','OPTIONS'], //not case sensitive  
        allowedHeaders : ['Content-Type','Authorization'] //case sensitive
    }
));

app.use(express.json()) //accepts json data from user
app.use(express.urlencoded({extended:true})) //accepts %20 like space based raha input string mai

app.get("/",(req,res)=>{
    res.send("Cohort")
})

app.get("/ritesh",(req,res)=>{
    res.send("Ritesh Biradar")
})
db();
app.listen(port,()=>{
    console.log(`Listening on the port ${port}`)
})