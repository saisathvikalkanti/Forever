import mongoose  from "mongoose";

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_STRING);
    console.log("Connected to DB");
    

  } catch (error) {
    console.log(`DB ERROR ${error}`);
    process.exit(1);
  }
}

export default connectDB;