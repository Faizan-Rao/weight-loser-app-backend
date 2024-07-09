
import { Router } from "express";
import {
    addScannerMeal,
    addCustomMeal
} from "../controllers/scanner.controller.js"
import authentication from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router();
router.use(authentication)

router.route('/add-scanner-meal').post(upload.single("FileName"),addScannerMeal)
router.route('/add-custom-meal').post(upload.single("CustomFoodImage"), addCustomMeal)

export default router;