
import express from "express";

import path, { dirname } from "path";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js"
import cookiePareser from "cookie-parser"
import { connectDB }   from "./lib/db.js";
import {ENV} from "./lib/env.js"
//dotenv.config();
console.log(ENV.PORT)

const __dirname = path.resolve();
const app =express();
app.use(express.json()); //to get json body vaues req.body
app.use(cookiePareser())
app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);


//make ready for deployment
if(ENV.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
}

app.get("*", (_,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
});



app.listen(ENV.PORT,()=> {
    console.log("Server is running at port 3000");
    connectDB()
});