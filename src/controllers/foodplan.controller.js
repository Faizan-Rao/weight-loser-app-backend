
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import _ from "lodash";
import { foodReplaceCacheValidator, foodReplaceValidator } from "../validator/object.schema.validator.js";
import redisClient from "../client/redis-client.js";
const { now } = _


//API : For Replacing Food In Cache
export const replaceFoodCache = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const { planId, exercisePlan, day } = req.params;
        const value = await foodReplaceCacheValidator(req.body, res, "ReplaceFoodCache")
        const {
            foodReplaceId,
            foodId
        } = value 


        let cachedValue = await redisClient
        .get(`get-todays-food-plan:user:${user_id}:p:${planId}`)

        if(cachedValue)
        {
            cachedValue = JSON.parse(cachedValue)
            let foodData =  null
               let foodPlan = await prisma.foodplan.findFirst({
                where:{
                    food_food_id: foodId,
                    plan_plan_id: planId,
                    foodplan_day: parseInt(day),
                }
               }) 

               let food = await prisma.food.findFirst({
                where:{
                    food_id: foodId,         
                }
               }) 

               foodData = { foodPlan, food}
           
               

           
            let foodPlanIndex = cachedValue.todayFoodMeals.findIndex(item => parseFloat(item.FoodId) === parseFloat(foodReplaceId))

            let foodIdIndex = cachedValue.todaysFood.findIndex(item => parseFloat(item.FoodId) === parseFloat(foodReplaceId))

            cachedValue.todayFoodMeals[foodPlanIndex] = foodData.foodPlan
            cachedValue.todaysFood[foodIdIndex] = foodData.food

            await redisClient.set(`get-todays-food-plan:user:${Id}:p:${planId}`, JSON.stringify(cachedValue), `KEEPTTL`)

            return res
            .status(200)
            .json(new ApiResponse(200, "ReplaceFood : Success",
            cachedValue))


        }

        return res
        .status(404)
        .json(new ApiResponse(404, "ReplaceFood : Failure"))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ReplaceFood : Something went wrong")
    }
})




//API : FOR Fetching Todays Food
export const getTodaysFoodPlan = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const { planId, exercisePlan, day } = req.params;

        const cachedValue = await redisClient
        .get(`get-todays-food-plan:user:${user_id}:p:${planId}`)

        if(cachedValue)
        {
            return res
            .status(200)
             .json(new ApiResponse(200, "GetTodaysFoodPlan : Success", 
            JSON.parse(cachedValue)))
        }
        
        const exercises = await prisma.exercise_plan.findMany({
            where: {
                plan_plan_id : exercisePlan,
                exercise_plan_day: parseInt(day)
            },
            include:{
                exercise: true
            }   
        })

   
        const todayFoodPlan = await prisma.foodplan.findMany({
            where : {
                plan_plan_id : parseInt(planId),
                foodplan_day : parseInt(day) 
            }
        })
       
        const question = await prisma.user_answer.findFirst({
            where:{
                user_user_id: user_id,
                user_answer_question_code: 13
            },
            orderBy:{
                user_answer_created_at: 'desc'
            }
        })
        
        if(!question || !todayFoodPlan || !exercises)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetTodaysFoodPlan : Not Found"))
        }

        const allergicFoodAns = JSON.parse(question.user_answer_answer)
       
        const foods = await Promise.allSettled(todayFoodPlan.map(async item =>{

            let food = await prisma.food.findFirst({
                where:{
                    food_id : item.food_food_id
                },
                include:{
                    food_detail: true
                }
            })
            return food
        }))
        
        const todayFoods = foods.map(item => item.value) // Per Day All Meals (without Filter)
    
        const FilteredFood = await Promise.allSettled(todayFoods
        .map(
            async item =>{
               
           
            
            const allergie = JSON.parse(item.food_detail[0].food_detail_allergic_food)
            
            
            
            let ual = 0
            for(ual; ual < allergie.length; ual++)
            {
                if(allergicFoodAns.includes(allergie[ual]))
                {
                    return null;
                }
            }

            return item  
        }))

        let todaysFood = []
        FilteredFood.forEach(item => {
            if(item.value !== null)
            {
                todaysFood.push(item.value)
            }
        })
       
        
        
        let foodToSendPayload = todaysFood
        
        // Calculated Data
        const target = foodToSendPayload.reduce((accum, item) =>{
            accum.targetConCalories += parseFloat(item?.food_calories)
            accum.targetTotalFat += parseFloat(item?.food_fat)
            accum.targetTotalProtein += parseFloat(item?.food_protein)
            accum.targetTotalCarb += parseFloat(item?.food_carbs)
            return accum
            
        }, {
            targetConCalories: 0,
            targetTotalProtein: 0,
            targetTotalFat : 0,
            targetTotalCarb : 0
         })
        
        const targetBurnCalories = exercises.reduce((accum, item)=>{
            return accum += parseFloat(item.exercise.exercise_calorie_burn)
        }, 0.0)



        
        if(!todayFoodPlan)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetTodaysFoodPlan : Not Found"))
        }

        foodToSendPayload = foodToSendPayload.filter(item=> item !== null ? true : false)
        
        let payload = { 
            targetBurnCalories,
            targetNutrients : target,
            todayFoodMeals: todayFoodPlan,
            todaysFood : foodToSendPayload,
        }

        await redisClient.set(`get-todays-food-plan:user:${user_id}:p:${planId}`,
        JSON.stringify(payload))

        await redisClient.expire(`get-todays-food-plan:user:${user_id}:p:${planId}`,
         process.env.PROJECT_STATE === "production" ? 24 * 60 * 60 : 120)
        
        return res
        .status(200)
        .json(new ApiResponse(200, "GetTodaysFoodPlan : Success", 
        payload))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodaysFoodPlan : Something went wrong")
    }
})


//API : FOR Fetching Todays Replaced Food
export const getReplacedFoodPlanList = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const { planId, day } = req.params;
        const value = await foodReplaceValidator(req.body, res, "GetReplacedFoodPlanList");
        const { ReplaceCalories, MealType }  = value;
       
       

   
        const todayFoodPlan = await prisma.foodplans.findMany({
            where : {
                PlanId : parseInt(planId),
                MealType : MealType,
                Day : {
                    not:{
                        equals : 0
                    }
                }
            }
        })
       
        
        const question = await prisma.questionanswers.findFirst({
            where:{
                UserId: Id,
                QId: 13
            }
        })
        
        if(!question || !todayFoodPlan )
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetTodaysFoodPlan : Not Found"))
        }

        const allergicFoodAns = JSON.parse(question.Answer)
       
        const foods = await Promise.allSettled(todayFoodPlan.map(async item =>{

            let food = await prisma.foods.findFirst({
                where:{
                    FoodId : `${item.FoodId}`
                },
            })
            return food
        }))
        
        const todayFoods = foods.map(item => item.value) // Per Day All Meals (without Filter)
       
        const FilteredFood = await Promise.allSettled(todayFoods
        .map(
            async item =>{

            let food = await prisma.fooddetails.findFirst({
                where:{
                    FoodId : `${item.FoodId}`,
                },
            })

            const allergie = JSON.parse(food.AllergicFood)
            
            for(let ual = 0; ual < allergie.length; ual++)
            {
                if(allergicFoodAns.includes(allergie[ual]))
                {
                    return null;
                }
            }

            return food  
        }))

        let todaysFood = []
         FilteredFood.forEach(item => {
           if(item.value !== null)
           {
               todaysFood.push(item.value)
           }
        })
        
        const foodToSend = await Promise.allSettled(todaysFood.map(async item =>{

            let food = await prisma.foods.findFirst({
                where:{
                    FoodId : `${item.FoodId}`
                },
            })
            return food
        }))
        
        const foodToSendPayload = foodToSend.map(item => item.value)
        .filter(item => item?.Calories <= ReplaceCalories)
        
        
      
       
        
        if(!todayFoodPlan)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetTodaysFoodPlan : Not Found"))
        }

        
        return res
        .status(200)
        .json(new ApiResponse(200, "GetTodaysFoodPlan : Success", 
        { 
            foodPlans : todayFoodPlan,
            todaysReplaceFood : foodToSendPayload,
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodaysFoodPlan : Something went wrong")
    }
})


