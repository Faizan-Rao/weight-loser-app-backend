import { Router } from "express";
import {
    getFoodPlans,
    getReciepes,
} from "../controllers/reciepe.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)


router.route('/get-reciepes/:current?/:max?/:planId?').get(getReciepes)
router.route('/get-cuisines').get(getFoodPlans)


export default router;