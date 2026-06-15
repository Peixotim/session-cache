import {Router, Request, Response, NextFunction} from "express";
import {UserController} from "../controller/user.controller";

const router = Router();
const controller = new UserController();

router.get("/email/:email", (req: Request, res: Response, next: NextFunction) => controller.findByEmail(req, res, next));

export const userRoutes = router;
