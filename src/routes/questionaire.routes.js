
import { Router } from "express";
import {
    getQuestion,
    userAnswer,
    getInitial
} from "../controllers/questionaire.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authentication)

router.route("/get-initial").get(getInitial);
router.route("/get-question/:current/:type?").get(getQuestion);
router.route("/ans-question/").post(userAnswer);


export default router;