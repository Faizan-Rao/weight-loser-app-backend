
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { groceryValidator } from "../validator/object.schema.validator.js"
import _ from "lodash"
const { now } = _


//API : For Fetching Grocery
export const getGrocery = asyncHandler(async (req, res)=>{
    try
    {
        const {
            day,
            planId,
            type,
        } = req.params

        let days = day;
        
        if(type === "weekly")
        {
            days = parseInt(day) + 7 
        }

        else if(type === "monthly")
        {
            days = parseInt(day) + 30
        }

        const foodPlans = await prisma.foodplan.findMany({
            where:{
                plan_plan_id : parseInt(planId),
                foodplan_day: {
                    gte :parseInt(day),
                    lte : parseInt(days)
                }
            },
            include: {
                food:{
                    include:{
                        food_detail: {
                            include:{
                                grocery_list: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                foodplan_day: 'asc'
            }
        })
       
        let GroceryItems = foodPlans.map(item =>({
            foodId : item.food.food_id,
            planId: item.plan_plan_id,
            phase: item.foodplan_phase, 
            foodName : item.food.food_name,
            foodGrocery : item.food.food_detail[0].grocery_list
        }))
        
        if(GroceryItems.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetGrocery : Record Not Found"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
                200,
                "GetGrocery : Record Found",
                GroceryItems
        ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetGrocery : Something went wrong")
    }
})


//API : For Adding Grocery
export const addGrocery = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const value = await groceryValidator(req.body, res, "AddGrocery")
        const {
            ListId ,
        } = value

        const currentRecord = await prisma.user_grocery.create({
            data: {
                user_user_id: user_id,
                grocery_list_grocery_list_id: parseFloat(ListId),
                user_grocery_is_purchased: 1,
                user_grocery_created_at: new Date(now()) 
            }
        })

        const groceryItem = await prisma.user_grocery.findFirst({
            where:{
                user_grocery_id : currentRecord.user_grocery_id
            }
        })

        if(!groceryItem)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "AddGrocery : Record Not Found",
                    
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddGrocery : Record Added",
                groceryItem
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddGrocery : Something went wrong")
    }
})
