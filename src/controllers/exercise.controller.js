
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



//API : For Active Plans
export const getExercisePlans = asyncHandler(async (req, res)=>{
    try
    {
        
        const exercisePlans = await prisma.plan.findMany({
            where : {
               plan_type: "exercise"
            }
        })
       

        if(!exercisePlans)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetExercisePlans : Not Found"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "GetExercisePlans : Success", 
        { 
            exercisePlans
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetExercisePlans : Something went wrong")
    }
})

// API : For Viewing Food Plan
export const viewExercisePlan = asyncHandler(async (req, res)=>{
    try
    {
        const { planId } = req.params
        
        const fullPlan = await prisma.exercise_plan.findMany({
            where : {
                plan_plan_id : parseInt(planId),
            },
            include: {
                exercise: true
            },
            orderBy: {
                exercise_plan_day: 'asc'
            },
        })

        if(fullPlan.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewExercisePlan : Records not found"
            ))
        }
     

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewExercisePlan : Records found",
                fullPlan
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewDietPlans : Something went wrong")
    }
})

// API : For Viewing Food Details 
export const viewExerciseDetails = asyncHandler(async (req, res)=>{
    try
    {
        const { exerciseId } = req.params
        
        const exercise = await prisma.exercise.findFirst({
            where : {
                exercise_id : exerciseId,
            },
        })

        if(!exercise)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewExerciseDetail : Records not found"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewExerciseDetail : Records found",
                exercise
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewDietPlans : Something went wrong")
    }
})

