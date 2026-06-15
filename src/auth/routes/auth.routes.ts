import {Router, Response, Request, NextFunction} from "express";
import {AuthController} from "../controller/auth.controller";

const controller = new AuthController()
const authRoutes = Router()

authRoutes.post("/register", (req : Request, res : Response, next : NextFunction) => controller.register(req, res, next))
authRoutes.post("/login", (req : Request, res : Response, next : NextFunction) => controller.login(req, res, next))

export {authRoutes}
