import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";


const app = express()



app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECERT
}))

app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json({
    limit:"10mb"
}));

app.use(express.urlencoded({
    limit:"10mb",
    extended: true
}));

app.use(express.static('public'));

app.use(cookieParser());

// API V1 Router Imports
import AuthRouter from "./routes/auth.routes.js"
import QuesRouter from "./routes/questionaire.routes.js"
import UserRouter from "./routes/user.routes.js"
import PackageRouter from "./routes/package.routes.js"
import OathRouter from "./routes/oauth.google.routes.js"
import SelfieRouter from "./routes/selfie.routes.js"
import TodoRouter from "./routes/todo.routes.js"
import QuoteRouter from "./routes/quote.routes.js"
import FoodPlanRouter from "./routes/foodplan.routes.js"
import ActivePlanRouter from "./routes/activeplans.routes.js"
import BudgetRouter from "./routes/budget.routes.js"
import CheatRouter from "./routes/cheatmeal.routes.js"
import ScannerRouter from "./routes/scanner.routes.js"
import GroceryRouter from "./routes/grocery.routes.js"
import DietRouter from "./routes/diet.routes.js"
import ExerciseRouter from "./routes/exercise.routes.js"
import MindRouter from "./routes/mind.routes.js"
import FavouriteRouter from "./routes/favourite.routes.js"
import SleepRouter from "./routes/sleep.routes.js"
import ChatRouter from "./routes/chat.routes.js"
import ProfileRouter from "./routes/profile.routes.js"
import ReciepeRouter from "./routes/reciepe.routes.js"
import PageRouter from "./routes/page.routes.js"

// API V1 Routes
app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/auth/oath", OathRouter)
app.use("/api/v1/q", QuesRouter)
app.use("/api/v1/u", UserRouter)
app.use("/api/v1/package", PackageRouter)
app.use("/api/v1/selfie", SelfieRouter)
app.use("/api/v1/todo", TodoRouter)
app.use("/api/v1/quote", QuoteRouter )
app.use("/api/v1/foodplan", FoodPlanRouter )
app.use("/api/v1/activeplan", ActivePlanRouter )
app.use("/api/v1/budget", BudgetRouter )
app.use("/api/v1/cheatmeal",  CheatRouter)
app.use("/api/v1/scanner",  ScannerRouter)
app.use("/api/v1/grocery", GroceryRouter)
app.use("/api/v1/diet", DietRouter)
app.use("/api/v1/exercise", ExerciseRouter)
app.use("/api/v1/mind", MindRouter)
app.use("/api/v1/favourite", FavouriteRouter)
app.use("/api/v1/sleep", SleepRouter)
app.use("/api/v1/chat", ChatRouter)
app.use("/api/v1/profile", ProfileRouter)
app.use("/api/v1/reciepe", ReciepeRouter)
app.use("/api/v1/page", PageRouter)

export { app }