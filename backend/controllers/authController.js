import { User } from "../models/userModel.js";
import BlackList from "../models/tokenBlackListModel.js";
import { sendEmail } from "../utils/sendEmail.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


// ================= GENERATE TOKEN =================

const generateToken = (id) => {
  return jwt.sign({ _id: id }, process.env.SECRET_KEY, {
    expiresIn: "7d"
  });
};


// ================= REGISTER =================

export const registerController = async (req, res) => {
  try {

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
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
        message: "Email and password are required"
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
      phone: existingUser.phone,
      avatar: existingUser.avatar,
      role: existingUser.role,
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

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

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


// ================= GET CURRENT USER =================

export const getMeController = async (req, res) => {

  res.status(200).json({
    user: req.user
  });

};


// ================= UPDATE USER PROFILE =================
export const updateProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      message: "user not found"
    })

  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.avatar = req.body.avatar || user.avatar;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "Profile updated",
    user: updatedUser
  });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}


// ================= CHANGE USER PASSWORD =================
export const changeUserPasswordController = async (req, res) => {
  try {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if(!isMatch){
      return res.status(400).json({
        message: "old password is incorrect"
      })
    }
    const newHashed = await bcrypt.hash(newPassword, 10);
    user.password = newHashed;
    user.save();

    res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}


// ================= FORGOT USER PASSWORD =================
export const forgotPasswordController = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Reset your password using this link:\n\n${resetUrl}\n\nThis link expires in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message
    });

    res.status(200).json({
      message: "Password reset email sent"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// ================= RESET USER PASSWORD =================

export const resetPasswordController = async (req, res) => {

  try {

    const resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
