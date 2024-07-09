
import { Router } from "express";
import {
    addSelfie,
    getSelfie
} from "../controllers/selfie.controller.js"
import authentication from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(authentication)

router.route("/get-selfies").get(getSelfie);
router.route("/add-selfie").post(upload.single("selfie"),addSelfie)

export default router;