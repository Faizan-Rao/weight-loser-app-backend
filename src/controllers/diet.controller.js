
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



//API : For Active Plans
export const getDietPlans = asyncHandler(async (req, res)=>{
    try
    {
        

        const dietPlans = await prisma.plan.findMany({
            where : {
               plan_type: "diet"
            }
        })
       

        if(dietPlans.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetDietPlan : Not Found"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "GetDietPlan : Success", 
        { 
            dietPlans
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetDietPlan : Something went wrong")
    }
})

// API : For Viewing Food Plan
export const viewDietPlan = asyncHandler(async (req, res)=>{
    try
    {
        const { planId } = req.params
        
        const fullPlan = await prisma.foodplan.findMany({
            where : {
                plan_plan_id : parseInt(planId),
            },
            include:{
                food : {
                    include : {
                        food_detail : true
                    }
                }
            },
            orderBy: {
                foodplan_day: 'asc'
            }
        })

        

        if(fullPlan.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewDietPlan : Records not found"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewDietPlan : Records found",
                fullPlan
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewDietPlans : Something went wrong")
    }
})

// API : For Viewing Food Details 
export const viewFoodDetails = asyncHandler(async (req, res)=>{
    try
    {
        const { foodId } = req.params
        
        const food = await prisma.food_detail.findFirst({
            where : {
                food_food_id : foodId,
            },
        })

        if(!food)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewFoodDetail : Records not found"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewFoodDetail : Records found",
                food
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewDietPlans : Something went wrong")
    }
})

