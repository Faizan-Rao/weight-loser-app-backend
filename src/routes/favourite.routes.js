
import { Router } from "express";
import {
    getAllFavourites,
    addFavourite,
    deleteFavourite
} from "../controllers/favourite.controller.js"
import authentication from "../middlewares/auth.middleware.js";



const router = Router();
router.use(authentication)

router.route('/').get(getAllFavourites)
router.route('/add-favourite').post(addFavourite)
router.route('/delete-favourite/:favId').delete(deleteFavourite)




export default router;