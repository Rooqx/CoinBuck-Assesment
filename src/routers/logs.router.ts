import express from "express";
import { getAllLogs } from "../controllers/log.controller";

const logRouter = express.Router();

logRouter.get("/", getAllLogs);

export default logRouter;
