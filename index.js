import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import userAuth from "./routes/user.auth.js";
import getUser from "./routes/user.js";
import userClickEarning from "./routes/service/user.clickEarning.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(
    cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use("/api", userAuth);
app.use("/api", getUser);
app.use("/api", userClickEarning);

app.listen(port, () => {
    console.log(`Server is running on port ${port} successfully`)
})