
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js"

dotenv.config();
console.log(process.env.PORT)

const app =express();
app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);


app.listen(process.env.PORT,()=> console.log("Server is running at port 3000"));