"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const log_controller_1 = require("../controllers/log.controller");
const logRouter = express_1.default.Router();
logRouter.get("/", log_controller_1.getAllLogs);
exports.default = logRouter;
