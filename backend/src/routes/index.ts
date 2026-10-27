import { Router } from "express";
import { shopRoutes } from "./shopRoutes.js";
import { productRoutes, productDirectRoutes } from "./productRoutes.js";
import { orderRoutes, shopOrderRoutes } from "./orderRoutes.js";
import { receiptRoutes } from "./receiptRoutes.js";

export const apiRouter = Router();

apiRouter.use("/shops", shopRoutes);
apiRouter.use("/shops", productRoutes); // /shops/:shopId/products...
apiRouter.use("/shops", shopOrderRoutes); // /shops/:shopId/orders
apiRouter.use("/products", productDirectRoutes); // /products/:productId
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/receipts", receiptRoutes);
