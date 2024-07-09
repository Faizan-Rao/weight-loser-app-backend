
import { Router } from "express";
import {
    getMindPlans,
    viewMindPlan,
    viewMindDetails,
    getAllVideos
} from "../controllers/mind.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getMindPlans)
router.route('/view-mind-plan/:planId').get(viewMindPlan)
router.route('/view-mind-detail/:videoId').get(viewMindDetails)
router.route('/get-video/:planId').get(getAllVideos)

export default router;