
import { Router } from "express";
import {
    getActivePlans,
    addActivePlan,
    updateActivePlanDay,
    reversePlanDays
} from "../controllers/activeplan.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getActivePlans)
router.route('/activate-plan').post(addActivePlan)
router.route('/update-day').patch(updateActivePlanDay)
router.route('/reverse-plan/:planId').patch(reversePlanDays)

export default router;