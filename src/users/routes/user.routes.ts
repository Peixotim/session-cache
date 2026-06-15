import {Router} from "express";
import {UserController} from "../controller/user.controller";

const router = Router();
const controller = new UserController();

router.get("/email/:email", controller.findByEmail);

export const userRoutes = router;
