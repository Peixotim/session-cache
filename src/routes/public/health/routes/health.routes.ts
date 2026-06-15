import {Router} from "express";
import {HealthController} from "../controller/health.controller";

const router : Router = Router();
const controller = new HealthController();

router.get('', controller.HealthCheck.bind(controller))


export const healthRoutes : Router = router;