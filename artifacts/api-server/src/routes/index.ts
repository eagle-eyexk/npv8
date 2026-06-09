import { Router, type IRouter } from "express";
import healthRouter from "./health";
import walletRouter from "./wallet";
import transactionsRouter from "./transactions";
import merchantsRouter from "./merchants";
import tapRouter from "./tap";
import cardRouter from "./card";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(walletRouter);
router.use(transactionsRouter);
router.use(merchantsRouter);
router.use(tapRouter);
router.use(cardRouter);
router.use(dashboardRouter);

export default router;
