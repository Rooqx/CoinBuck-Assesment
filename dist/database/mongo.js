"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("../configs/env.config");
const connectToMongo = async () => {
    if (!env_config_1.MONGO_URI || env_config_1.MONGO_URI == "") {
        throw new Error("Please provide MONGO_URI in the environment variables");
    }
    try {
        await mongoose_1.default.connect(env_config_1.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (error) {
        console.log("MongoDB connection error", error);
    }
};
exports.connectToMongo = connectToMongo;
