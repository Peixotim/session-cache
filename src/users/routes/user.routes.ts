import {Router} from "express";
import {UserController} from "../controller/user.controller";
import {AuthMiddleware} from "../../shared/middlewares";

const router = Router();
const controller = new UserController();

router.get("/me", AuthMiddleware, controller.getProfile.bind(controller));
router.get("/email/:email", controller.findByEmail.bind(controller));

export const userRoutes = router;
