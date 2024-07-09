
import { Router } from "express";
import {
    getTodaysFoodPlan,
    getReplacedFoodPlanList,
    replaceFoodCache
} from "../controllers/foodplan.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/get-plan/e/:exercisePlan/p/:planId/d/:day').get(getTodaysFoodPlan)
router.route('/get-replaced-plan/p/:planId').post(getReplacedFoodPlanList)
router.route('/replace-food/p/:planId/d/:day').post(replaceFoodCache)

export default router;