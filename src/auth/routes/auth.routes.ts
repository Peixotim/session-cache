import {Router} from "express";
import {AuthController} from "../controller/auth.controller";
import {validateBody} from "../../shared/middlewares";
import {createUserSchema} from "../../users/DTOs/create-user.dto";
import {loginSchema} from "../DTOs/login.dto";

const controller = new AuthController()
const authRoutes = Router()

authRoutes.post("/register", validateBody(createUserSchema), controller.register.bind(controller))
authRoutes.post("/login", validateBody(loginSchema), controller.login.bind(controller))

export {authRoutes}
