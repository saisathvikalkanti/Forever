import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// connect database
await connectDB();

// routes
app.use("/api/auth", authRoutes);




// test route
app.get("/", (req, res) => {
  res.send("FOREVER API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});