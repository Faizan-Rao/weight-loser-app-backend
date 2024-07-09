
import { Router } from "express";
import {
    purchasePackage,
    getUserPackage,
    singlePackage,
    getAllPackages
} from "../controllers/package.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/purchase-package').post(purchasePackage)
router.route('/get-package').get(getUserPackage) 
router.route('/single-package/:title/:trial?').get(singlePackage) 
router.route('/all-package').get(getAllPackages) 

export default router;