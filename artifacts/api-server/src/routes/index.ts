import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import walletRouter from "./wallet";
import transactionsRouter from "./transactions";
import merchantsRouter from "./merchants";
import tapRouter from "./tap";
import cardRouter from "./card";
import dashboardRouter from "./dashboard";
import miningRouter from "./mining";
import adminRouter from "./admin";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(walletRouter);
router.use(transactionsRouter);
router.use(merchantsRouter);
router.use(tapRouter);
router.use(cardRouter);
router.use(dashboardRouter);
router.use(miningRouter);
router.use(adminRouter);

export default router;
