"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authRouter = (0, express_1.Router)();
//Signup Route
authRouter.post("/signup", auth_controller_1.register);
//Signin Route
authRouter.post("/signin", auth_controller_1.login);
//Logout Route
authRouter.post("/logout", (req, res) => {
    res.send("Logout");
});
exports.default = authRouter;
