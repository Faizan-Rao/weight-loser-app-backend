
import { Router } from "express";
import {
    getQuote
} from "../controllers/quote.controller.js"
import authentication from "../middlewares/auth.middleware.js";


const router = Router();
router.use(authentication)

router.route("/get-quote/:day").get(getQuote);

export default router;