
import { Router } from "express";
import {
    getGrocery,
    addGrocery
} from "../controllers/grocery.controller.js"
import authentication from "../middlewares/auth.middleware.js";


const router = Router();
router.use(authentication)

router.route('/get-grocery/p/:planId/d/:day/:type?').get(getGrocery)
router.route('/add-grocery').post(addGrocery)


export default router;