import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/email.js";
import { User } from "../models/User.js";

export const signup = async (req, res) => {
  const { email, password, name, userType, secretKey } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    let isVerified = false;
    let verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // Initialize verificationToken for all users

    if (userType === "admin" && secretKey === "Admin$") {
      isVerified = true; // Admins are automatically verified if the correct secret key is used
      verificationToken = undefined; // Clear the token since it's not needed for verified admins
    } else if (userType === "admin") {
      return res.status(401).json({ message: "Invalid secret key" });
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      userType: userType === "admin" ? "Admin" : "User",
      isVerified, // Set based on the logic above
      verificationToken, // Always initialized, conditionally cleared
      verificationTokenExpiresAt: isVerified
        ? undefined
        : Date.now() + 24 * 60 * 60 * 1000, // No need to set expiration if already verified
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    if (!isVerified && verificationToken) {
      await sendVerificationEmail(email, verificationToken); // Send only if not verified and token exists
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  // Check with the verification code to verify the email
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Invalid or expired verification code",
      });
    }

    // after checking above details set isVerified attribute in database to : True
    user.isVerified = true;
    // then remove both verificationToken and verificationTokenExpiresAt attributes from database.
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    // save above details to database
    await user.save();

    // Send welcome email to the user
    await sendWelcomeEmail(user.email, user.name);

    // send response message (use in postman)

    res.status(200).json({
      sucess: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail", error);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check either email available at database
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }

    // Check if password is entered coreectly compare with database
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }

    // If all credentials are correct generate the token and cookie
    generateTokenAndSetCookie(res, user._id);

    // Updating the log in history
    user.lastLogin = new Date();
    await user.save();

    // Send response back
    res.status(200).json({
      sucess: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login", error);
    res.status(400).json({ sucess: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("tokenJWT");
  res.status(200).json({ sucess: true, message: "Logged out sucessfully" });
};

export const forgotPassword = async (req, res) => {
  // This is what user will provide
  const { email } = req.body;

  try {
    // Check user
    const user = await User.findOne({ email });

    // If user not found
    if (!user) {
      return res.status(400).json({ sucess: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // Set expire date to the resetToken - 1h
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    // update the database
    await user.save();

    //  Send email

    // we can replace the URL in .env file when deploying we can replace it with react app url
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    // Send response back
    res.status(200).json({
      sucess: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(400).json({ sucess: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with reset password token
    const user = await User.findOne({
      resetPasswordToken: token,
      // Check if expire date gt (greater than) date.now which is current date
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    // If token is expired
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;

    // after updating the password remove resetPasswordToken and resetPasswordExpiresAt from database
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    // update the database
    await user.save();

    // Send reset sucess email
    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ sucess: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword", error);

    res.status(400).json({ sucess: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    // If user does not exist
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
