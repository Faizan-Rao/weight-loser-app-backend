
import { Router } from "express";
import {
   getTodos,
   addTodo,
   activeTodos
} from "../controllers/todo.controller.js"
import authentication from "../middlewares/auth.middleware.js";


const router = Router();
router.use(authentication)

router.route("/get-todo").get(getTodos);
router.route("/add-task").post(addTodo)
router.route("/active-todo").post(activeTodos)
export default router;