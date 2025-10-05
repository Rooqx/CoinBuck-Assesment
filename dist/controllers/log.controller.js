"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLogs = void 0;
const log_model_1 = __importDefault(require("../models/log.model"));
/**
 * @desc Get all logs (optionally filtered by level, date, etc.)
 * @route GET /api/logs
 * @access Private/Admin but for simplicity, no auth here
 */
const getAllLogs = async (req, res) => {
    try {
        const { level, limit = 50, page = 1 } = req.query;
        const query = {};
        if (level)
            query.level = level;
        const logs = await log_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await log_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: Number(page),
            limit: Number(limit),
            logs,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch logs",
            error: error.message,
        });
    }
};
exports.getAllLogs = getAllLogs;
