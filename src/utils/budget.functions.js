
import { prisma } from "../client/client.js";
import { ApiError } from "./ApiError.js";
import _ from "lodash"
const {now} = _

export const addBreakFast = async (rec, dateTime) => {
    try
    {
        const currentRecord = await prisma.breakfast.create({
            data : {
                breakfast_date: new Date(Date.now()),
                food_food_id: parseInt(rec.FoodId),
                breakfast_serving_size : parseFloat(rec.ServingSize),
                breakfast_calories : parseFloat(rec.Calories),
                breakfast_protein:  parseFloat(rec.Protein),
                breakfast_fats: parseFloat(rec.fat),
                breakfast_carbs: parseFloat(rec.Carbs),
                breakfast_created_at : new Date(Date.now())
            }

        })
        const food = await prisma.breakfast.findFirst({
            where: {
                breakfast_id : currentRecord.breakfast_id
            }
        })

        if(food)
        {
            return food;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddBreakFast : Something went wrong")
    }
}
export const addLunch = async (record, dateTime) => {
    try
    {
        const currentRecord = await prisma.lunch.create({
            data : {
                lunch_date: new Date(now()),
                food_food_id: parseInt( record.FoodId),
                lunch_serving_size : parseFloat(record.ServingSize),
                lunch_calories: parseFloat(record.Calories),
                lunch_protein:  parseFloat(record.Protein),
                lunch_fat: parseFloat(record.fat),
                lunch_sodium: 0,
                lunch_carbs : parseFloat(record.Carbs),
                lunch_created_at : new Date(now())
            }

        })

        const food = await prisma.lunch.findFirst({
            where: {
                lunch_id : currentRecord.lunch_id
            }
        })
        

        if(food)
        {
            return food;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "addLunch : Something went wrong")
    }
}
export const addSnack = async (record, dateTime) => {
    try
    {
        const currentRecord = await prisma.snacks.create({
            data : {
                snack_date: new Date(now()),
                food_food_id: parseInt(record.FoodId),
                snack_serving_size : parseFloat(record.ServingSize),
                snack_calories: parseFloat(record.Calories),
                snack_protein:  parseFloat(record.Protein),
                snack_fat: parseFloat(record.fat),
                snack_carbs : parseFloat(record.Carbs),
                snack_created_at : new Date(now())
            }

        })
        const food = await prisma.snacks.findFirst({
            where: {
                snack_id : currentRecord.snack_id
            }
        })

        if(food)
        {
            return food;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "addSnack : Something went wrong")
    }
}

export const addDinner = async (record, dateTime) => {
    try
    {
        const currentRecord = await prisma.dinner.create({
            data : {
                dinner_date : new Date(now()),
                food_food_id: parseInt(record.FoodId),
                dinner_serving_size : parseFloat(record.ServingSize),
                dinner_calories : parseFloat(record.Calories),
                dinner_protein:  parseFloat(record.Protein),
                dinner_fat : parseFloat(record.fat),
                dinner_carbs: parseFloat(record.Carbs),
                dinner_created_at : new Date(now())
            }

        })
        const food = await prisma.dinner.findFirst({
            where: {
                dinner_id : currentRecord.dinner_id
            }
        })

        if(food)
        {
            return food;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddDinner : Something went wrong")
    }
}

export const addWater = async (record, dateTime) => {
    try
    {
        const currentRecord = await prisma.water.create({
            data : {
                water_date: new Date(now()),
               
                water_serving : parseFloat(record.ServingSize),
                
              
                water_created_at : new Date(now())
            }

        })
        const food = await prisma.water.findFirst({
            where: {
                water_id : currentRecord.water_id
            }
        })

        if(food)
        {
            return food;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddBreakFast : Something went wrong")
    }
}


export const addExercise = async (record, dateTime, Id)=>{
    try
    {
        console.log(record)
        
        const currentRecord = await prisma.user_exercise.create({
            data : {
                user_user_id : Id,

                exercise_exercise_id :  parseInt(record.ExerciseId),
                user_exercise_date: new Date(now()),
                user_exercise_calories: parseInt(record.Burn_Calories),
                user_exercise_created_at : new Date(now())
            }

        })
        const exercise = await prisma.user_exercise.findFirst({
            where: {
                user_exercise_id: currentRecord.user_exercise_id
            }
        })

        if(exercise)
        {
            return exercise;
        }
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddExercise : Something went wrong")
    }
}