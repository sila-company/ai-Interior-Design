import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import userProfilesRouter from "./user-profiles";
import furnitureItemsRouter from "./furniture-items";
import cartItemsRouter from "./cart-items";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/user-profiles", userProfilesRouter);
router.use("/furniture-items", furnitureItemsRouter);
router.use("/cart-items", cartItemsRouter);
router.use("/orders", ordersRouter);

export default router;
