// This can be app.js , main.js or index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// credentials = true so we can send cookies and the request . This is how to hanlde authentication
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); // allows to parse incoming requests under the req.body
app.use(cookieParser()); // allow to parse incoming cookies

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: ", PORT);
});
