import { Router } from "express";
import { orderController } from "../controllers/orderController.js";
import { receiptController } from "../controllers/receiptController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const orderRoutes = Router();

orderRoutes.post("/", asyncHandler(orderController.create));
orderRoutes.get("/:orderId", asyncHandler(orderController.getOrder));
orderRoutes.patch("/:orderId/payment", asyncHandler(orderController.updatePaymentStatus));
orderRoutes.get("/:orderId/receipt", asyncHandler(receiptController.getByOrderId));

export const shopOrderRoutes = Router();
shopOrderRoutes.get("/:shopId/orders", asyncHandler(orderController.listForShop));
