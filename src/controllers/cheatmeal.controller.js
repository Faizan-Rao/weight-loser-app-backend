
import { prisma } from "../client/client.js";
import redisClient from "../client/redis-client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
    addCheatMealValidator
} from "../validator/object.schema.validator.js"

import _ from "lodash"
const { now } = _

//API : FOR Fetching Todays Food
export const getCheatMealStats = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        
        let budgetRecords = [];

        const budgetRecordsCount = await prisma.budget.count({
            where: {
                user_user_id: user_id
            }
        })

        if(budgetRecordsCount <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetCheatMealStats : No Record Found"
            ))
        }

        
            budgetRecords = await prisma.budget.findMany({
                where: {
                    user_user_id : user_id,
                },
                orderBy:{
                    budget_created_at: "desc"
                },
                take: 7
            })
        
        
        const cheatMealStats = budgetRecords.reduce((accum, item)=>{
            const isCompleted = item.breakfast_breakfast_id
            && item.lunch_lunch_id 
            && item.snack_snack_id
            && item.exercise_exercise_id 
            && item.dinner_dinner_id

            
            
            if(isCompleted)
            {
                accum.daysCompleted++
                if(accum.daysCompleted === 7)
                {
                    accum.cheatMeal = true;
                }
            }

            else
            {
                accum.reset = true;
            }

            return accum
        },
        {
            cheatMeal: false,
            daysCompleted: 0,
            reset: false
        })
        
        if(cheatMealStats.reset)
        {
            cheatMealStats.daysCompleted = 0;
            cheatMealStats.cheatMeal = false;
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetCheatMealStats : Record Found",
            {
                cheatMeal : cheatMealStats.cheatMeal,
                daysCompleted : cheatMealStats.daysCompleted
            }
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodaysFoodPlan : Something went wrong")
    }
})

//API : ADD CheatMeal 
export const addCheatMeal = asyncHandler(async(req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = await addCheatMealValidator(req.body, res, "AddCheatMeal")
        const { Name, Calories, FoodTakenDate } = value; 

        await prisma.cheatfood.create({
            data : {
                user_user_id: user_id,
                cheatfood_name: Name,
                cheatfood_total_calories: parseInt(Calories),
                cheatfood_taken_date: new Date(FoodTakenDate),
                cheatfood_created_at: new Date(now())
            }
        })
        const recentBudget = await prisma.budget.findFirst({
            where : {
                user_user_id: user_id,
            },
            orderBy: {
                budget_created_at: 'desc'
            },
        })
        
        const newCalorieCount = parseInt(recentBudget.budget_consume_calories) + parseInt(Calories)
        
        const updatedRecord = await prisma.budget.update({
            where :{
                budget_id: recentBudget.budget_id,
                user_user_id: user_id,
            },
            data: {
                budget_consume_calories: newCalorieCount
            }
        })
        
        const currentRecord = await prisma.budget.findFirst({
            where :{
                budget_id : updatedRecord.budget_id
            }
        })
        if(!currentRecord)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddCheatMeal : Failed"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddCheatMeal : Success",
                currentRecord
            ))
    }
    catch(err)
    {
        throw new ApiError(403, err?.message || "AddCheatMeal : Something went wrong ")
    }
})

// API : Get User Cheat Meal History
export const getUserCheatMealHistory = asyncHandler(async (req, res) =>{
    try
    {
        const { user_id } = req.user;

        const cachedValue = await redisClient.get(`get-user-cheat-history:user:${user_id}`)

        if(cachedValue)
        {
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                "getUserCheatMealHistory : Success",
                JSON.parse(cachedValue)
            ))
        }

        const cheatMeals = await prisma.cheatfood.findMany({
            where: {
                user_user_id : user_id,
            }
        })

        if(!cheatMeals)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "getUserCheatMealHistory : Failed"
            ))
        }

        await redisClient.set(`get-user-cheat-history:user:${user_id}`, JSON.stringify(cheatMeals))
        await redisClient.expire(`get-user-cheat-history:user:${user_id}`,  process.env.PROJECT_STATE === "production" ? 24 * 60 * 60 : 120)
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "getUserCheatMealHistory : Success",
                cheatMeals
            ))
    }

    catch(error)
    {
        throw new ApiError(403, error?.message || "GetUserCheatMeal : Something went wrong ")
    }
})
