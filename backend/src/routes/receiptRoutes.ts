import { Router } from "express";
import { receiptController } from "../controllers/receiptController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const receiptRoutes = Router();

receiptRoutes.post("/verify", asyncHandler(receiptController.verify));
