
import { Router } from "express";
import {
    getExercisePlans,
    viewExercisePlan,
    viewExerciseDetails,
} from "../controllers/exercise.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getExercisePlans)
router.route('/view-exercise-plan/:planId').get(viewExercisePlan)
router.route('/view-exercise-detail/:exerciseId').get(viewExerciseDetails)


export default router;