import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    // set token expires after 7 days
    expiresIn: "7d",
  });

  res.cookie("tokenJWT", token, {
    httpOnly: true, // this prevent attack call XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // this prevent csrf attacks
    maxAge: 7 * 24 * 60 * 1000, // if u want for 15 days update 7 for 15
  });

  return token;
};
