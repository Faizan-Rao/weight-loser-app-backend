
import { Router } from "express";
import {
    getCheatMealStats,
    addCheatMeal,
    getUserCheatMealHistory
} from "../controllers/cheatmeal.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/get-cheatmeal-stats').get(getCheatMealStats)
router.route('/add-cheatmeal').post(addCheatMeal)
router.route('/get-history').get(getUserCheatMealHistory)

export default router;