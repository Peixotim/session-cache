import {Router} from "express";
import {userRoutes} from "../users/routes/user.routes";
import {healthRoutes} from "./public/health/routes/health.routes";
import {authRoutes} from "../auth/routes/auth.routes";

const routes = Router();

const modules = [
    {path: "/auth", router: authRoutes},
    {path: "/users", router: userRoutes},
    {path: "/health", router: healthRoutes},
] as const;

modules.forEach(({path, router}) => routes.use(path, router));

export {routes};
