
import { Router } from "express";
import {
    getDietPlans,
    viewDietPlan,
    viewFoodDetails,
} from "../controllers/diet.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getDietPlans)
router.route('/view-diet-plan/:planId').get(viewDietPlan)
router.route('/view-diet-detail/:foodId').get(viewFoodDetails)

export default router;