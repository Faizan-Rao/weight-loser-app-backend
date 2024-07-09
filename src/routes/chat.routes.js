
import { Router } from "express";
import {
    getAllPost,
    addLikeComment,
    addPost,
    deleteComment,
    addSavePost,
    deletePost,
    deleteSavePost,
    getComments,
    getSavePosts,
    updatePost,

} from "../controllers/chat.controller.js"
import authentication from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(authentication)

router.route('/get-all-post/:current?/:max?').get(getAllPost)
router.route('/add-post').post(upload.array('images'), addPost)
router.route('/add-like-comment').post(addLikeComment)
router.route('/add-save-post/:chatId').get(addSavePost)
router.route('/delete-comment/:chatDetailId').delete(deleteComment)
router.route('/delete-post/:chatId').delete(deletePost)
router.route('/delete-save-post/:chatId').delete(deleteSavePost)
router.route('/get-comments/:chatId').get(getComments)
router.route('/get-save-posts').get(getSavePosts)
router.route('/update-post').patch(upload.array('images'), updatePost)

export default router;