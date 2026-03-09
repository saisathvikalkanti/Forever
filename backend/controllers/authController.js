import { User } from "../models/userModel.js";
import BlackList  from "../models/tokenBlackListModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ _id: id }, process.env.SECRET_KEY, {
    expiresIn: "7d"
  });
};


// ================= REGISTER =================

export const registerController = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already taken"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: `Internal server error: ${error.message}`
    });

  }
};


// ================= LOGIN =================

export const loginController = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = generateToken(existingUser._id);

    const responseUserObject = {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      token
    };

    res.status(200).json({
      message: "User logged in successfully",
      user: responseUserObject
    });

  } catch (error) {

    res.status(500).json({
      message: `Internal server error: ${error.message}`
    });

  }
};


// ================= LOGOUT =================

export const logoutController = async (req, res) => {
  try {

    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = req.headers.authorization.split(" ")[1];

    await BlackList.create({ token });

    res.status(200).json({
      message: "User logged out successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: `Internal server error: ${error.message}`
    });

  }
};