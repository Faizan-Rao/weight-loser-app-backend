
import { Router } from "express";

import {
    successRedirect,
    failureRedirect,
} from '../controllers/oath.controller.js'

const router = Router()

router.post('/google/success', successRedirect)
router.get('/failure', failureRedirect)

export default router