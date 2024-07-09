
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { updateProfileValidator } from "../validator/object.schema.validator.js"
import _ from "lodash";
const { now } = _


//API : get reciepes
export const getReciepes = asyncHandler(async (req, res)=>{
    try
    {
        const { planId, current, max } = req.params;
        let currentNum = current

        if(!current)
        {
            currentNum = 0
        }

        if(current > max)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetReciepes : Index Bound Error"
            ))
        }

        let currentReciepes = null;
        if(planId)
        {
            currentReciepes = await prisma.foodplan.findMany({
                where: {
                    plan_plan_id: parseInt(planId)
                },
                orderBy:{
                   foodplan_created_at: 'desc'
                }
           })
        }
        else
        {
            currentReciepes = await prisma.foodplan.findMany({
                
                orderBy:{
                   foodplan_created_at: 'desc'
                }
           })
        }

        if(currentReciepes.length < 0)
        {   
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetReciepes : Records not found"
            ))
        }

        let Foods = await Promise.allSettled(currentReciepes.map(async (item)=>{
            const food = await prisma.food.findFirst({
                where: {
                    food_id: item.food_food_id
                },
            });
            
            return food;
            
        }))

        Foods = Foods.map(item => item.value)

        let FoodsChunks = _.chunk(Foods, 50)
        let MaxFoodsIndex =  FoodsChunks.length - 1;

        if(!Foods)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetReciepes : Records not found"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetReciepes: Record Found",
            {
                totalRecords: Foods.length,
                CurrentFoodIndex: parseInt(currentNum),
                MaxFoodsIndex: MaxFoodsIndex,
                Foods: FoodsChunks[currentNum] || [],
            }
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetProfile : Something went wrong")
    }
})

// API : get Food Plans
export const getFoodPlans = asyncHandler(async (req, res)=>{
    try
    {
        const foodPlans = await prisma.plan.findMany({
            where: {
                plan_type: 'diet'
            }
        })

        if(foodPlans.length < 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetFoodPlans : Record Not Found"
            ))
        }


        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetFoodPlans : Record Found",
            foodPlans
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetProfile : Something went wrong")
    }
})





