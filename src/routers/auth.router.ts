import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const authRouter = Router();

//Signup Route
authRouter.post("/signup", register);

//Signin Route
authRouter.post("/signin", login);

//Logout Route
authRouter.post("/logout", (req, res) => {
  res.send("Logout");
});

export default authRouter;
