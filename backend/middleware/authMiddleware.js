import jwt from "jsonwebtoken";

import Blacklist from "../models/tokenBlackListModel";
import User from "../models/userModel.js"

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const blacklisted = await Blacklist.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({ message: "token is blacklisted" });
    }

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);



    if (!authHeaders) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    req.user = user;

    next();



  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

export default protect