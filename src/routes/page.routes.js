
import { Router } from "express";
import {
    getPage
} from "../controllers/page.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getPage) 

export default router;