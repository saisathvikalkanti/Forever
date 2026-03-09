// package imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

// Loading env variables
dotenv.config();

// from file imports
import connectDB from "./config/db.js";

// creating server instance
const app = express();

// using middlewares
app.use(express.json());


const PORT = process.env.PORT || 5000;

await connectDB();

// triggering routes
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  
})

