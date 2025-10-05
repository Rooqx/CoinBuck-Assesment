"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arcject_config_1 = __importDefault(require("../configs/arcject.config"));
/*
    Arcjet middleware to protect routes
*/
const arcjetMiddleware = async (req, res, next) => {
    try {
        //
        const decision = await arcject_config_1.default.protect(req, { requested: 3 });
        // logger.warn("Arcjet Decision:", decision); // Debugging
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: `Rate limit exceeded` });
            }
            if (decision.reason.isBot()) {
                return res.status(403).json({ error: `Bot Detected` });
            }
            return res.status(403).json({ error: `Access denied` });
        }
        next();
    }
    catch (err) {
        console.error(`Arcjet Middleware Error: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.default = arcjetMiddleware;
