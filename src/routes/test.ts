import { Router, Request, Response } from "express";

const testRouter = Router();

testRouter.get("/", (_req: Request, res: Response) => {
  res.send("Hello from test");
});

export default testRouter;
