
import express from "express";
import dotenv from "dotenv";
import path, { dirname } from "path";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js"

dotenv.config();
console.log(process.env.PORT)

const __dirname = path.resolve();
const app =express();
app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

//make ready for deployment
if(process.env.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
}

app.get("*", (_,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
});

app.listen(process.env.PORT,()=> console.log("Server is running at port 3000"));