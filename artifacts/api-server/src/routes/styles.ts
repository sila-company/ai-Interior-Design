import { Router, type IRouter } from "express";
import { ListDesignStylesResponse } from "@workspace/api-zod";
import { listStyles } from "../data/styles";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  const data = ListDesignStylesResponse.parse(listStyles());
  res.json(data);
});

export default router;
