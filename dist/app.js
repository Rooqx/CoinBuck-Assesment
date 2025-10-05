"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./middlewares/error.middleware");
const env_config_1 = require("./configs/env.config");
const mongo_1 = require("./database/mongo");
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const wallet_routes_1 = __importDefault(require("./routers/wallet.routes"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const arcject_middleware_1 = __importDefault(require("./middlewares/arcject.middleware"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
//Rate limiter and  bot protection
app.use(arcject_middleware_1.default);
//Routes
app.use("/api/v1/transactions", transaction_router_1.default);
app.use("/api/v1/wallets", wallet_routes_1.default);
app.use("/api/v1/auth", auth_router_1.default);
app.use("/api/v1/users", user_router_1.default);
//Global express server
app.use(error_middleware_1.errorHandler);
app.get("/", (_req, res) => {
    res.send("Hello from Server (Express + TS) 👋");
});
console.log(env_config_1.MONGO_URI);
app.listen(env_config_1.PORT, async () => {
    console.log(`✅ Server running at http://localhost:${env_config_1.PORT}`);
    await (0, mongo_1.connectToMongo)();
    //await connectToRedis();
    console.log(`Environment:${env_config_1.ENV}`);
});
