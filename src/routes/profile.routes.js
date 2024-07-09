
import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updateDp
} from "../controllers/profile.controller.js"
import authentication from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getProfile)
router.route('/update-profile').patch(updateProfile)
router.route('/update-dp').patch(upload.single("displayPic"), updateDp)

export default router;