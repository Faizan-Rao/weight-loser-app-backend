

import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {  budgetValidator, getDiaryValidator } from "../validator/object.schema.validator.js";
import {
    addBreakFast,
    addDinner,
    addLunch,
    addSnack,
    addWater,
    addExercise
} from  "../utils/budget.functions.js";
import _ from "lodash";
const { now } = _


//API : FOR Fetching Todays Food
export const addUserNutrientsProgress = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value  = budgetValidator(req.body, res, "addUserNutrientsProgress")
        const {
            FoodId,
            ServingSize,
            Calories,
            fat,
            Protein,
            Carbs,
            MealType,
            Burn_Calories
           } = value
        
        const currentdate = new Date(now()).toISOString().split("T")[0];
       
        let record = null;
        
        const recordCount = await prisma.budget.count()
         
        if(recordCount > 0)
        {
            record = await prisma.budget.findMany({
                where: {
                    user_user_id : user_id,
                },
                orderBy:{
                    budget_created_at: "desc"
                }
            })
    
            record = record[0]
        }
      
        const isToday = record?.budget_created_at.toISOString().split("T")[0] === currentdate
        
       
        if(!isToday)
        {
            
            record = await prisma.budget.create({
                data: {
                    user_user_id : user_id,
                    budget_consume_calories: 0,
                    budget_burn_calories: 0,
                    budget_protein :  0,
                    budget_total_fat : 0,
                    budget_carbs: 0,
                    budget_diet_score : 0,
                    budget_created_at: new Date(now())

                }
            })
        }
       
        let currentBudget = null;
        switch(MealType)
        {
            case "Breakfast":
                if(record)
                {
                    const breakFast = await addBreakFast(value, currentdate);
                   
                    let payload = {}

                    payload.budget_protein =  parseFloat(record.budget_protein) + parseFloat(Protein)
                    payload.budget_total_fat =  parseFloat(record.budget_total_fat) + parseFloat(fat)
                    payload.budget_carbs =  parseFloat(record.budget_carbs) + parseFloat(Carbs)
                    payload.budget_consume_calories =  record.budget_consume_calories + parseFloat(Calories)
                    payload.budget_burn_calories = record.budget_burn_calories + parseInt(Burn_Calories)
                   
                    payload.budget_diet_score =  parseFloat(payload.budget_consume_calories) - parseFloat(payload.budget_burn_calories)
                    
                    if(payload.budget_diet_score < 0)
                    {
                        payload.budget_diet_score = 0
                    }
                   
                    payload.breakfast_breakfast_id = parseInt(breakFast.breakfast_id)

                    currentBudget = await prisma.budget.update({
                        data: payload,
                        where:{
                            budget_id : record.budget_id,
                        },
                    })
                    console.log(currentBudget)

                    await prisma.history.create({
                        data:{
                            
                            breakfast_breakfast_id : breakFast.breakfast_id,
                            history_type: "breakfast",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })
                    
                }
                break;
            case "Lunch":
                if(record)
                {
                    const lunch = await addLunch(value, currentdate);
            
                    let payload = {}
                   
                    payload.budget_protein =  parseFloat(record.budget_protein) + parseFloat(Protein)
                    payload.budget_total_fat =  parseFloat(record.budget_total_fat) + parseFloat(fat)
                    payload.budget_carbs =  parseFloat(record.budget_carbs) + parseFloat(Carbs)
                    payload.budget_consume_calories =  record.budget_consume_calories + parseFloat(Calories)
                    payload.budget_burn_calories = record.budget_burn_calories + parseInt(Burn_Calories)
                   
                    payload.budget_diet_score =  parseFloat(payload.budget_burn_calories) - parseFloat(payload.budget_burn_calories)
                    if(payload.budget_diet_score < 0)
                    {
                        payload.budget_diet_score = 0
                    }
                    
                    payload.lunch_lunch_id = parseInt(lunch.lunch_id)
                   
                    currentBudget = await prisma.budget.update({
                        data: payload,
                        where:{
                            budget_id : record.budget_id,
                        },
                    })

                    await prisma.history.create({
                        data:{
                            
                            lunch_lunch_id : lunch.lunch_id,
                            history_type: "lunch",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })

                }
                break;
            case "Snacks":
                if(record)
                {
                    const snack = await addSnack(value, currentdate);
            
                    let payload = {}
                    
                    payload.budget_protein = parseFloat(record.budget_protein) + parseFloat(Protein)
                    payload.budget_total_fat =  parseFloat(record.budget_total_fat) + parseFloat(fat)
                    payload.budget_carbs =  parseFloat(record.budget_carbs) + parseFloat(Carbs)
                    payload.budget_consume_calories =  parseInt(record.budget_consume_calories) + parseInt(Calories)
                    payload.budget_burn_calories = record.budget_burn_calories + parseInt(Burn_Calories)
                   
                    payload.budget_diet_score =  parseFloat(payload.budget_consume_calories) - parseFloat(payload.budget_burn_calories)
                    if(payload.budget_diet_score < 0)
                    {
                        payload.budget_diet_score = 0
                    }
                    payload.snack_snack_id = parseInt(snack.snack_id)

                    currentBudget = await prisma.budget.update({
                        data: payload,
                        where: {
                            budget_id : record.budget_id,
                        },
                    })

                    await prisma.history.create({
                        data:{
                            
                            snack_snack_id : snack.snack_id,
                            history_type: "snack",
                            user_user_id: user_id,
                            history_created_at: new Date(now())
                        }
                    })
                }
                break;
            
               
            case "Dinner":
                    if(record)
                    {
                        const dinner = await addDinner(value, currentdate);
                
                        let payload = {}
                       
                        payload.budget_protein =  parseFloat(record.budget_protein) + parseFloat(Protein)
                        payload.budget_total_fat =  parseFloat(record.budget_total_fat) + parseFloat(fat)
                        payload.budget_carbs =  parseFloat(record.budget_carbs) + parseFloat(Carbs)
                        payload.budget_consume_calories =  record.budget_consume_calories + parseFloat(Calories)
                        payload.budget_burn_calories = record.budget_burn_calories + parseInt(Burn_Calories)
                   
                        payload.budget_diet_score =  parseFloat(payload.budget_consume_calories) - parseFloat(payload.budget_burn_calories)
                        if(payload.budget_diet_score < 0)
                        {
                            payload.budget_diet_score = 0
                        }
                        
                        payload.dinner_dinner_id = parseInt(dinner.dinner_id)
                        
                        currentBudget = await prisma.budget.update({
                            data: payload,
                            where:{
                                budget_id : record.budget_id,
                            },
                        })
                        
                        await prisma.history.create({
                            data:{
                                
                                dinner_dinner_id : dinner.dinner_id,
                                history_type: "dinner", 
                                user_user_id: user_id,
                                history_created_at: new Date(now())
                            }
                        })
                    }
                    break;
            case "Water":
                if(record)
                {
                        const water = await addWater(value, currentdate);
                
                        let payload = {}
                        
                        payload.budget_protein =  parseFloat(record.budget_protein) 
                        payload.budget_total_fat =  parseFloat(record.budget_total_fat) 
                        payload.budget_carbs =  parseFloat(record.budget_carbs) 
                        payload.budget_consume_calories =  record.budget_consume_calories 
                        payload.budget_burn_calories = record.budget_burn_calories 
                   
                        payload.budget_diet_score =  parseFloat(payload.budget_consume_calories) - parseFloat(payload.budget_burn_calories)
                        if(payload.DietScore < 0)
                        {
                            payload.DietScore = 0
                        }
                       
                        payload.water_water_id = parseInt(water.water_id)
    
                        currentBudget = await prisma.budget.update({
                            data: payload,
                            where: {
                                budget_id : record.budget_id,
                            },
                        })
                        await prisma.history.create({
                            data: {
                                water_water_id: water.water_id,
                                history_type: "water",
                                user_user_id: user_id,
                                history_created_at: new Date(now())
                            }
                        })
                }
                break;
                case "Exercise":
                    if(record)
                    {
                        console.log(value)
                        const exercise = await addExercise(value, currentdate, user_id)
                        
                        const payload = {}
                        payload.exercise_exercise_id = exercise.exercise_exercise_id;
                        payload.budget_burn_calories = parseInt(record.budget_burn_calories) + parseInt(exercise.user_exercise_calories);
                        payload.budget_diet_score = record.budget_consume_calories - payload.budget_burn_calories;

                        currentBudget = await prisma.budget.update({
                            data : payload,
                            where : {
                                budget_id : record.budget_id,
                            }
                        })
                        
                        
                    }
        }

        if(!currentBudget)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "AddUserNutrientProgress : Data not inserted"))
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, "AddUserNutrientProgress : Data inserted", currentBudget)
        )
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddUserNutrientProgress : Something went wrong")
    }
})

// API : For Average Nutrients and Average Total
export const avgFoodNutrients = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const allBudgetRecord = await prisma.budget.findMany({
            where : {
                user_user_id : user_id
            }
        })

        if(allBudgetRecord.length <= 0)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "AvgFoodNutrients : Records Not Found"))
        }

        const budgetRecordCount  = allBudgetRecord.length;

        const sumNutrients = allBudgetRecord.reduce(
        (accum , item)=>{
            accum.totalCalories += item.budget_consume_calories;
            accum.totalProtein += item.budget_protein;
            accum.totalFats += item.budget_total_fat;;
            accum.totalCarbs += item.budget_carbs;
            
            return accum
        },{
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
           
        })

        let avgNutrients = {};
        avgNutrients.avgCalories =  sumNutrients.totalCalories / budgetRecordCount
        avgNutrients.avgProtein =  sumNutrients.totalProtein / budgetRecordCount
        avgNutrients.avgCarbs =  sumNutrients.totalCarbs / budgetRecordCount
        avgNutrients.avgFats =  sumNutrients.totalFats / budgetRecordCount
       

        let avgTotal =  avgNutrients.avgCalories
        + avgNutrients.avgProtein
        + avgNutrients.avgCarbs
        + avgNutrients.avgFats

        return res
        .status(200)
        .json( new ApiResponse(200, "AvgFoodNutrients : Success", {
            avgNutrients,
            avgTotal,
            TotalDays: budgetRecordCount
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AvgFoodNutrients : Something went wrong")
    }
})

// API : For User Weight Stats
export const weightStats = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        

        const user = await prisma.user.findFirst({
            where : {
                user_id : user_id
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "WeightStats : Record Not Found"))
        }

       const currentSelfies = await prisma.selfie.findMany({
            where:{
                user_user_id : user_id
            },
            orderBy:{
                selfie_created_at: "desc"
            }
       })

       if(currentSelfies.length < 0)
       {
            return res
            .status(404)
            .json( new ApiResponse(404, "WeightStats : Record not found"))
       }

       const recentRecord = currentSelfies[0]

       if(!recentRecord)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "WeightStats : Record Not Found"))
        }

        let payload = {
            startingWeight : user.user_weight,
            startDate: user.user_created_at,
            currentWeight: recentRecord.selfie_weight,
            weightUnit: user.user_weight_unit,
            Date: recentRecord.selfie_date,
            targetWeight: user.user_target_weight,
            targetDate: user.user_target_date
         }
         
         
        

        return res
        .status(200)
        .json( new ApiResponse(200, "WeightStats : Success", payload))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "WeightStats : Something went wrong")
    }
})

// API : For User Exercise Stats
export const exerciseStats = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const user = await prisma.user.findFirst({
            where : {
                user_id : user_id
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "ExerciseStats : Record Not Found"))
        }

       const currentExercises = await prisma.user_exercise.findMany({
            where:{
                user_user_id : user_id
            },
            orderBy:{
                user_exercise_created_at: "desc"
            }
       })

       const exerciseRecordCount  = currentExercises.length;

        const sumNutrients = currentExercises.reduce(
        (accum , item)=>{
            accum.totalBurn_Calories += item.user_exercise_calories;
            accum.totalDuration += item.user_exercise_duration;

            return accum
        },{
            totalBurn_Calories: 0,
            totalDuration: 0,
           
        })

        let avgExercise = {};
        avgExercise.avgBurn_Calories =  sumNutrients.totalBurn_Calories / exerciseRecordCount
        avgExercise.avgDuration =  sumNutrients.totalDuration / exerciseRecordCount
        
        return res
        .status(200)
        .json( new ApiResponse(200, "ExerciseStats : Success", {
            avgExercise,
            totalBurn_Calories: sumNutrients.totalBurn_Calories,
            totalExerciseDuration: sumNutrients.totalDuration,
            totalExercises: exerciseRecordCount
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ExerciseStats : Something went wrong")
    }
})

// API : For User Water Stats
export const waterStats = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const user = await prisma.user.findFirst({
            where : {
                user_id : user_id
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "WeightStats : Record Not Found"))
        }

       const currentWater = await prisma.history.findMany({
            where:{
                user_user_id : user_id,
            },
            orderBy:{
                history_created_at: "desc"
            }
       })
       
        

        let getAllWaterRecords = await Promise.allSettled(currentWater.map(async (item)=>{
                const waterRecord = await prisma.water.findFirst({
                    where: {
                        water_id : item.water_water_id,
                        // water_date: item.history_created_at
                    }
                })
               
                return waterRecord
        })) 

        getAllWaterRecords = getAllWaterRecords.filter(item => item.value ? true : false)
        getAllWaterRecords = getAllWaterRecords.map(item => item.value)

        console.log(getAllWaterRecords)
        

         
        const sumNutrients = getAllWaterRecords.reduce(
        (accum , item, intake)=>{
            accum.totalIntakes += intake + 1 ;
            accum.totalServing += item.Serving;

            const today = item.water_created_at.toISOString().split("T")[0] 
            === currentWater[0].history_created_at.toISOString().split("T")[0];
            
            if(today)
            {
                accum.todayIntake += 1
            }

            return accum
        },{
            totalIntakes: 0,
            totalServing: 0,
            todayIntake: 0
        })
        
        const totalWater = getAllWaterRecords.length;
        let avgServing =  sumNutrients.totalServing / totalWater;
     
        return res
        .status(200)
        .json( new ApiResponse(200, "WaterStats : Success", {
            avgServing,
            TotalNutrients: sumNutrients
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "WaterStats : Something went wrong")
    }
})


// API : For User Sleep Stats
export const sleepStats = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const user = await prisma.user.findFirst({
            where : {
                user_id :  user_id
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "AvgSleepStats : Record Not Found"))
        }

       const totalSleepRecords = await prisma.sleep.findMany({
            where:{
                user_user_id : user_id,
            },
       })

       const sleepRecordCount  = totalSleepRecords.length;
       
        const total = totalSleepRecords.reduce(
        (accum , item)=>{
            let currentDate = new Date(item.sleep_total_sleep)

            accum.totalHours += currentDate.getHours();
            accum.totalMin += currentDate.getMinutes();

            return accum
        },{
            totalHours: 0,
            totalMin: 0,
           
        })

        let avgSleep = {};
        avgSleep.avgHours =  parseInt(total.totalHours / sleepRecordCount)
        avgSleep.avgMinutes = parseInt(total.totalMin / sleepRecordCount)
      
        return res
        .status(200)
        .json( new ApiResponse(200, "AvgSleepStats : Success", {
            avgSleep,
            TotalDays: sleepRecordCount
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AvgSleepStats : Something went wrong")
    }
})


// API : for fetching user todays Meals
export const userTodayDiary = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        
        
        let todaysBudget = await prisma.history.findMany({
            where : {
                user_user_id : user_id,
              OR: [
                {history_type : 'breakfast'},
                {history_type : 'lunch'},
                {history_type : 'snack'},
                {history_type : 'dinner'},
              ]
            },
            orderBy:{
                history_created_at: 'desc'
            }
        })

        let currentDate = new Date(now()).toISOString().split('T')[0]

        todaysBudget = todaysBudget.filter(item => item.history_created_at.toISOString().split('T')[0] === currentDate)
       
       
        let userDiary = await Promise.allSettled(todaysBudget.map(async (item, index)=>{
            if(item.breakfast_breakfast_id !== null)
            {
               
                const breakfast = await prisma.breakfast.findFirst({
                    where : {
                        breakfast_id: item?.breakfast_breakfast_id
                    }
                })
                const foodDetail = await prisma.food.findFirst({
                    where:{
                        food_id : breakfast.food_food_id
                    },
                    select: {
                        food_name : true,
                        food_description : true,
                        food_filename : true,
                    }
                })
                breakfast.MealType = "breakfast"
                breakfast.foodDetail = foodDetail
                return breakfast
            }
            else if(item.lunch_lunch_id !== null)
            {
                const lunch = await prisma.lunch.findFirst({
                    where : {
                        lunch_id : item?.lunch_lunch_id
                    }
                })
                const foodDetail = await prisma.food.findFirst({
                    where:{
                        food_id : lunch.food_food_id
                    },
                    select: {
                        food_name : true,
                        food_description : true,
                        food_filename : true,
                    }
                })
                lunch.MealType = "lunch"
                lunch.foodDetail = foodDetail
                return lunch
            }
            else if(item.snack_snack_id !== null)
            {
                const snack = await prisma.snacks.findFirst({
                    where : {
                        snack_id : item?.snack_snack_id
                    }
                })
                const foodDetail = await prisma.food.findFirst({
                    where:{
                        food_id : snack.food_food_id
                    },
                    select: {
                        food_name : true,
                        food_description : true,
                        food_filename : true,
                    }
                })
                
                snack.foodDetail = foodDetail
                snack.MealType = "snack"
               return snack
            }

            else if(item.dinner_dinner_id !== null)
            {
                const dinner = await prisma.dinner.findFirst({
                    where : {
                        dinner_id : item?.dinner_dinner_id
                    }
                })
                const foodDetail = await prisma.food.findFirst({
                    where:{
                        food_id : dinner.food_food_id
                    },
                    select: {
                        food_name : true,
                        food_description : true,
                        food_filename : true,
                    }
                })
               
                dinner.foodDetail = foodDetail
                dinner.MealType = "dinner"
                return dinner
            }
            
            
            
        }))

       userDiary = userDiary.filter(item => !_.isEmpty(item.value) ? true : false)
       .map(item => item.value)
        
        if(!userDiary)
        {
            return res
            .status(404)
            .json( new ApiResponse(404, "UserTodayDiary : Record Not Found"))
        }

        return res
            .status(200)
            .json( new ApiResponse(200, "UserTodayDiary : Record Found", 
            userDiary))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UserTodayDiary : Something went wrong")
    }

})