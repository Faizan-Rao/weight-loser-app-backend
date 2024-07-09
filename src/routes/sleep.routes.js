
import { Router } from "express";
import {
    addSleep
} from "../controllers/sleep.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)


router.route('/add-sleep').post(addSleep)





export default router;