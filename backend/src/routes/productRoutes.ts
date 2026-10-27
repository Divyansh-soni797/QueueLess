import { Router } from "express";
import { productController } from "../controllers/productController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const productRoutes = Router();

// Nested under /shops/:shopId
productRoutes.get("/:shopId/products", asyncHandler(productController.listForShop));
productRoutes.get("/:shopId/products/barcode/:barcode", asyncHandler(productController.findByBarcode));
productRoutes.post("/:shopId/products", asyncHandler(productController.create));

export const productDirectRoutes = Router();
productDirectRoutes.put("/:productId", asyncHandler(productController.update));
productDirectRoutes.delete("/:productId", asyncHandler(productController.remove));
