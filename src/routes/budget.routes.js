import { Router } from "express";
import {
    addUserNutrientsProgress,
    avgFoodNutrients,
    weightStats,
    exerciseStats,
    sleepStats,
    waterStats,
    userTodayDiary
} from "../controllers/budget.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/add-budget').post(addUserNutrientsProgress)
router.route('/get-avg').get(avgFoodNutrients)
router.route('/get-weight-stats').get(weightStats)
router.route('/get-water-stats').get(waterStats)
router.route('/get-sleep-stats').get(sleepStats)
router.route('/get-exercise-stats').get(exerciseStats)
router.route('/get-diary').get(userTodayDiary)

export default router;