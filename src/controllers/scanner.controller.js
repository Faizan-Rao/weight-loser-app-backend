
import _ from "lodash";
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { scannerValidator } from "../validator/object.schema.validator.js"
import redisClient from "../client/redis-client.js";
import { addBreakFast,addDinner, addLunch, addSnack } from "../utils/budget.functions.js";

const {now} = _


//API : FOR Fetching Todays Food
export const addScannerMeal = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = scannerValidator(req.body, res, "AddScannerMeal")
        const {
             ServingSize,
             Calories,
             fat,
             Protein,
             Carbs,
             MealType,
             Name,
             Phase,
             FileName,
             PlanId,
             Day
        } = value;

        let filePath = null
        if(req.file)
        {
            filePath = "/uploads/" + req.file.filename  
        }
        
        const recentFood = await prisma.food.findFirst({
            orderBy: {
                food_id : 'desc' 
            }
        })
       
        const newFood = await prisma.food.create({
            data: {
                food_calories : parseFloat(Calories),
                food_id : parseInt(JSON.stringify(recentFood.food_id)) + 1,
                food_fat : parseFloat(fat),
                food_protein : parseFloat(Protein),
                food_carbs: parseFloat(Carbs),
                food_serving_size: parseFloat(ServingSize),
                food_filename: filePath,
                food_name: Name,
                food_description : "Doing Work !"
            }
        })
       
       let newFoodplan =  await prisma.foodplan.create({
            data:{
                food_food_id : newFood.food_id,
                plan_plan_id : parseInt(PlanId),
                foodplan_day : 0,
                foodplan_serving_size: parseInt(ServingSize),
                foodplan_phase: parseInt(Phase),
                foodplan_meal_type: MealType,
                foodplan_created_at: new Date(now())
            }
        })

         await prisma.food_detail.create({
            data:{
                food_food_id: newFood.food_id,
                food_detail_is_allergic : 0,
                food_detail_created_at: new Date(now())
            }
        })


        switch(MealType)
        {
            case "Breakfast":
               
               
                let breakfastPayload = {
                    FoodId : `${newFood.food_id}`,
                    ServingSize : `${newFood.food_serving_size}`,
                    Calories: `${newFood.food_calories}`,
                    Protein : `${newFood.food_protein}`,
                    fat : `${newFood.food_fat}`,
                    Carbs : `${newFood.food_carbs}`,
                }
                    const breakFast = await addBreakFast(breakfastPayload, new Date(now()));

                    await prisma.history.create({
                        data:{
                            
                            breakfast_breakfast_id : breakFast.breakfast_id,
                            history_type: "breakfast",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })
                    
                
                break;
            case "Lunch":
                
                    let lunchPayload = {
                        FoodId : `${newFood.food_id}`,
                        ServingSize : `${newFood.food_serving_size}`,
                        Calories: `${newFood.food_calories}`,
                        Protein : `${newFood.food_protein}`,
                        fat : `${newFood.food_fat}`,
                        Carbs : `${newFood.food_carbs}`,
                    }
                    const lunch = await addLunch(lunchPayload, new Date(now()));
            
                   

                    await prisma.history.create({
                        data:{
                           
                            lunch_lunch_id : lunch.lunch_id,
                            history_type: "lunch",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })

                
                break;
            case "Snacks":
               
                   let snacksPayload = {
                        FoodId : `${newFood.food_id}`,
                        ServingSize : `${newFood.food_serving_size}`,
                        Calories: `${newFood.food_calories}`,
                        Protein : `${newFood.food_protein}`,
                        fat : `${newFood.food_fat}`,
                        Carbs : `${newFood.food_carbs}`,
                    }
                    const snack = await addSnack(snacksPayload, new Date(now()));
            

                    await prisma.history.create({
                        data:{
                            
                            snack_snack_id: snack.snack_id,
                            history_type: "snack",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })
                
                break;
            
               
            case "Dinner":
                        let dinnerPayload = {
                            FoodId : `${newFood.food_id}`,
                            ServingSize : `${newFood.food_serving_size}`,
                            Calories: `${newFood.food_calories}`,
                            Protein : `${newFood.food_protein}`,
                            fat : `${newFood.food_fat}`,
                            Carbs : `${newFood.food_carbs}`,
                        }
                   
                        const dinner = await addDinner(dinnerPayload, new Date(now()));
                        
                        await prisma.history.create({
                            data:{
                               
                                dinner_dinner_id: dinner.dinner_id,
                                history_type: "dinner", 
                                user_user_id: user_id,
                                history_created_at: new Date(now())
                            }
                        })
                    
                    break;
            
                    
        }
        const recentRecord = await prisma.budget.findFirst({
            where: {
                user_user_id : user_id
            },
            orderBy:{
                budget_created_at: "desc"
            }
        })

        const payload = {}
        payload.budget_consume_calories = parseFloat(Calories) + parseFloat(recentRecord.budget_consume_calories)
        payload.budget_total_fat = parseFloat(fat) + parseFloat(recentRecord.budget_total_fat)
        payload.budget_protein = parseFloat(Protein) + parseFloat(recentRecord.budget_protein)
        payload.budget_carbs = parseFloat(Carbs) + parseFloat(recentRecord.budget_carbs)
        payload.budget_diet_score = parseFloat(payload.budget_consume_calories) - parseFloat(recentRecord.budget_burn_calories)

        const currentRecord = await prisma.budget.update({
            data: payload,
            where: {
                user_user_id: user_id,
                budget_id: parseInt(recentRecord.budget_id)
            }
        })

        if(!currentRecord)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddScannerMeal : Success",
                currentRecord,
            ))
        }
        await updateTodaysFoodPlan(user_id, PlanId, newFoodplan, newFood)
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddScannerMeal : Success",
                currentRecord,
            ))

    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodaysFoodPlan : Something went wrong")
    }
})

//API : FOR Fetching Todays Food
export const addCustomMeal = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = scannerValidator(req.body, res, "AddCustomMeal")
        const {
             ServingSize,
             Calories,
             fat,
             Protein,
             Carbs,
             MealType,
             Name,
             Phase,
             PlanId,
             Day
        } = value;

        let filePath = null
        if(req.file)
        {
            filePath = "/uploads/" + req.file.filename  
        }

        let recentFood = await prisma.food.findFirst({
            orderBy: {
                food_id: 'desc' 
            }
        })
        

        const newFood = await prisma.food.create({
            data: {
                food_calories : parseFloat(Calories),
                food_id : parseInt(JSON.stringify(recentFood.food_id)) + 1,
                food_fat : parseFloat(fat),
                food_protein : parseFloat(Protein),
                food_carbs: parseFloat(Carbs),
                food_serving_size: parseFloat(ServingSize),
                food_filename: filePath,
                food_name: Name,
                food_description : "Doing Work !"
            }
        })
       
        let newFoodplan =  await prisma.foodplan.create({
            data:{
                food_food_id : newFood.food_id,
                plan_plan_id : parseInt(PlanId),
                foodplan_day : 0,
                foodplan_serving_size: parseInt(ServingSize),
                foodplan_phase: parseInt(Phase),
                foodplan_meal_type: MealType,
                foodplan_created_at: new Date(now())
            }
        })

         await prisma.food_detail.create({
            data:{
                food_food_id: newFood.food_id,
                food_detail_is_allergic : 0,
                food_detail_created_at: new Date(now())
            }
        })

        switch(MealType)
        {
            case "Breakfast":
                
                let breakfastPayload = {
                    FoodId : `${newFood.food_id}`,
                    ServingSize : `${newFood.food_serving_size}`,
                    Calories: `${newFood.food_calories}`,
                    Protein : `${newFood.food_protein}`,
                    fat : `${newFood.food_fat}`,
                    Carbs : `${newFood.food_carbs}`,
                }       
                const breakFast = await addBreakFast(breakfastPayload, new Date(now()));

                   

                await prisma.history.create({
                    data:{
                        
                        breakfast_breakfast_id : breakFast.breakfast_id,
                        history_type: "breakfast",
                        user_user_id: user_id,
                        history_created_at: new Date(now())
                    }
                })
                    
                
                break;
            case "Lunch":
                
                    let lunchPayload = {
                        FoodId : `${newFood.food_id}`,
                        ServingSize : `${newFood.food_serving_size}`,
                        Calories: `${newFood.food_calories}`,
                        Protein : `${newFood.food_protein}`,
                        fat : `${newFood.food_fat}`,
                        Carbs : `${newFood.food_carbs}`,
                    }
                    const lunch = await addLunch(lunchPayload, new Date(now()));
            
                

                    await prisma.history.create({
                        data:{
                        
                            lunch_lunch_id : lunch.lunch_id,
                            history_type: "lunch",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })


                
                break;
            case "Snacks":
               
                    let snacksPayload = {
                        FoodId : `${newFood.food_id}`,
                        ServingSize : `${newFood.food_serving_size}`,
                        Calories: `${newFood.food_calories}`,
                        Protein : `${newFood.food_protein}`,
                        fat : `${newFood.food_fat}`,
                        Carbs : `${newFood.food_carbs}`,
                    }
                    const snack = await addSnack(snacksPayload, new Date(now()));
            

                    await prisma.history.create({
                        data:{
                            
                            snack_snack_id: snack.snack_id,
                            history_type: "snack",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })
                
                break;
            
               
            case "Dinner":
                   
                        let dinnerPayload = {
                            FoodId : `${newFood.food_id}`,
                            ServingSize : `${newFood.food_serving_size}`,
                            Calories: `${newFood.food_calories}`,
                            Protein : `${newFood.food_protein}`,
                            fat : `${newFood.food_fat}`,
                            Carbs : `${newFood.food_carbs}`,
                        }
                
                        const dinner = await addDinner(dinnerPayload, new Date(now()));
                        
                        await prisma.history.create({
                            data:{
                            
                                dinner_dinner_id: dinner.dinner_id,
                                history_type: "dinner", 
                                user_user_id: user_id,
                                history_created_at: new Date(now())
                            }
                        })
                                
                    break;
            
                    
        }
        const recentRecord = await prisma.budget.findFirst({
            where: {
                user_user_id : user_id
            },
            orderBy:{
                budget_created_at: "desc"
            }
        })

        const payload = {}
        payload.budget_consume_calories = parseFloat(Calories) + parseFloat(recentRecord.budget_consume_calories)
        payload.budget_total_fat = parseFloat(fat) + parseFloat(recentRecord.budget_total_fat)
        payload.budget_protein = parseFloat(Protein) + parseFloat(recentRecord.budget_protein)
        payload.budget_carbs = parseFloat(Carbs) + parseFloat(recentRecord.budget_carbs)
        payload.budget_diet_score = parseFloat(payload.budget_consume_calories) - parseFloat(recentRecord.budget_burn_calories)

        const currentRecord = await prisma.budget.update({
            data: payload,
            where: {
                user_user_id: user_id,
                budget_id: parseInt(recentRecord.budget_id)
            }
        })

        if(!currentRecord)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddCustomMeal : Success",
                currentRecord,
            ))
        }

        await updateTodaysFoodPlan(user_id, PlanId, newFoodplan, newFood)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddCustomMeal : Success",
                currentRecord,
            ))

    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddCustomMeal : Something went wrong")
    }
})


const updateTodaysFoodPlan = async (Id, PlanId, newFoodplan, newFood) =>{
    try
    {
        let cachedValue = await redisClient
        .get(`get-todays-food-plan:user:${Id}:p:${PlanId}`)

        if(cachedValue)
        {
           
            cachedValue = JSON.parse(cachedValue)
            
            cachedValue.todayFoodMeals.push(newFoodplan)
            cachedValue.todaysFood.push(newFood) 
            await redisClient.set(`get-todays-food-plan:user:${Id}:p:${PlanId}`, JSON.stringify(cachedValue), `KEEPTTL`)
      
        }
    }
    catch(error)
    {
        console.log(error?.message)
    }
}