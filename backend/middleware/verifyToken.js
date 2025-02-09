import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // next job is to called the next function inside the verifyToken. In this case it will called checkAuth function

  const token = req.cookies.tokenJWT;
  if (!token)
    return res
      .status(401)
      .json({ sucess: false, message: "Unauthorized - no token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ sucess: false, message: "Unauthorized - no token provided" });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in verifyToken", error);
    return res.status(500).json({ sucess: false, message: "Server error" });
  }
};
