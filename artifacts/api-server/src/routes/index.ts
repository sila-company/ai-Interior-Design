import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import redesignsRouter from "./redesigns";
import roomsRouter from "./rooms";
import stylesRouter from "./styles";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/styles", stylesRouter);
router.use("/rooms", roomsRouter);
router.use("/redesigns", redesignsRouter);
router.use("/uploads", uploadsRouter);

export default router;
