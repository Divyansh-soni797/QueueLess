import { Router } from "express";
import { shopController } from "../controllers/shopController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const shopRoutes = Router();

shopRoutes.get("/:shopId", asyncHandler(shopController.getShop));
shopRoutes.put("/:shopId", asyncHandler(shopController.updateShop));
