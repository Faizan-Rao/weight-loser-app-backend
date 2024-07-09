
import { Router } from "express";
import {
    updateGender,
    updateHeight,
    updateAge,
    updateDob,
    updateMotivation,
    updatePregnant,
    updateTarget,
    updateTargetDate,
    updateWeight,
    getTargetData,
    updateOath
} from "../controllers/user.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route("/update-gender").patch(updateGender);
router.route("/update-height").patch(updateHeight);
router.route("/update-weight").patch(updateWeight);
router.route("/update-age").patch(updateAge);
router.route("/update-preg").patch(updatePregnant);
router.route("/update-target").patch(updateTarget);
router.route("/update-dob").patch(updateDob);
router.route("/update-motivation").patch(updateMotivation);
router.route("/update-target-date").patch(updateTargetDate);
router.route("/update-oath").patch(updateOath);
router.route("/get-target").get(getTargetData);

export default router;