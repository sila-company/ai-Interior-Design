import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stylesRouter from "./styles";
import redesignsRouter from "./redesigns";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/styles", stylesRouter);
router.use("/redesigns", redesignsRouter);

export default router;
