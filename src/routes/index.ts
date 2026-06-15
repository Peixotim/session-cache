import {Router} from "express";
import {userRoutes} from "../users/routes/user.routes";
import {healthRoutes} from "./public/health/routes/health.routes";

const routes = Router();

const modules = [
    {path: "/users", router: userRoutes},
    {path: "/health", router: healthRoutes},
] as const;

modules.forEach(({path, router}) => routes.use(path, router));

export {routes};
