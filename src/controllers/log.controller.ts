import type { Request, Response } from "express";
import Log from "../models/log.model";

/**
 * @desc Get all logs (optionally filtered by level, date, etc.)
 * @route GET /api/logs
 * @access Private/Admin but for simplicity, no auth here
 */
export const getAllLogs = async (req: Request, res: Response) => {
  try {
    const { level, limit = 50, page = 1 } = req.query;

    const query: Record<string, any> = {};
    if (level) query.level = level;

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Log.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      limit: Number(limit),
      logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: error.message,
    });
  }
};
