import jwt from "jsonwebtoken";
import Blacklist from "../models/tokenBlackListModel.js";
import { User } from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const blacklisted = await Blacklist.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({
        message: "Token is blacklisted"
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }
};

export default protect;