import joi from 'joi'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const validator = (schema) => (payload, res, funcName = "API",) =>{
    
    const {value, error} = schema.validate(payload)
    
    if(error?.details.length > 0)
    {
        let errorMessage = error.details.map(item => item.message)

        if(res)
        {
            return res.status(401).json(new ApiResponse (401, `${funcName} : Fields are incorrect or Empty`, errorMessage))
        }
        
        throw new ApiError (401, JSON.stringify(error?.details) || `${funcName} : Fields are incorrect or Empty`)
    }
    else
    {
        return value;
    }
}

// Authentication Controller : API Payload Schema 

const signupSchema = joi
.object({
    name : joi.string().trim().min(6).max(20).trim().lowercase().required(),
    email : joi.string().trim().email().min(6).max(50).lowercase().required(),
    password : joi.string().trim().min(8).max(20).required(),
}).options({abortEarly: false})


 const loginSchema = joi
.object({
    email : joi.string().trim().email().min(6).max(50).lowercase().required(),
    password : joi.string().trim().min(8).max(20).required(),
}).options({abortEarly: false})

const comparePasswordSchema = joi
.object({
    password : joi.string().trim().min(8).max(20).required(),
    hashedPassword : joi.string().trim().required()
}).options({abortEarly: false})

const otpVerifySchema = joi
.object({
    otpCode : joi.string().trim().max(4).required(),
}).options({abortEarly: false})

const otpResendSchema = joi
.object({
    Email :  joi.string().trim().email().min(6).max(50).lowercase(),
})

const forgetPasswordSchema = joi
.object({
    email : joi.string().trim().email().min(6).max(50).lowercase(),
    otpCode: joi.string().trim().max(4),
    password : joi.string().trim().min(8).max(20),
}).options({abortEarly: false})

const deleteUserSchema = joi
.object({
    email : joi.string().trim().email().min(6).max(50).lowercase().required(),
    password : joi.string().trim().min(8).max(20).required(),
    review: joi.string().trim()
}).options({abortEarly: false})


// Questionaire Controller : API Payload Schema 

const questionAnswerSchema = joi
.object({
    QId : joi.number().required(),
    Answer : joi.string().trim().required(),
    QCode : joi.number().required(),
    QOrder : joi.number().required(), 
    PageName : joi.string().trim().required()
}).options({abortEarly: false})

// User Controller : API Payload Schema 

const genderPayloadSchema = joi
.object({
   gender : joi.string().trim().valid("Male", "Female", "Nonbinary").max(10).required(),
   pageName : joi.string().trim().required()
}).options({abortEarly: false})

const heightPayloadSchema = joi
.object({
   height : joi.string().trim().lowercase().max(10).required(),
   heightUnit: joi.string().trim().lowercase().valid('cm','ft').max(10).required(),
   pageName : joi.string().trim().required()
}).options({abortEarly: false})

const weightPayloadSchema = joi
.object({
   weight : joi.string().trim().lowercase().max(10).required(),
   weightUnit: joi.string().trim().lowercase().valid('kg','lb').max(10).required(),
   pageName : joi.string().trim().required()
}).options({abortEarly: false})

const pregnantPayloadSchema = joi
.object({
   isPragnent : joi.number().valid(1, 0).required(),
   pageName : joi.string().trim().required()
   
}).options({abortEarly: false})

const agePayloadSchema = joi
.object({
   age : joi.string().trim().max(3).required(),
   pageName : joi.string().trim().required()
}).options({abortEarly: false})

const targetPayloadSchema = joi
.object({
    targetWeight : joi.string().trim().max(3).required(),
    targetWeightUnit: joi.string().trim().max(3).required(),
    pageName : joi.string().trim().required()
}).options({abortEarly: false})

const dobPayloadSchema = joi
.object({
    dob : joi.date().required(),
    pageName : joi.string().trim().required()
}).options({abortEarly: false})

const motivationPayloadSchema = joi
.object({
    motivation : joi.string().trim().max(10).required(),
    pageName : joi.string().trim().required()
}).options({abortEarly: false})

const targetDatePayloadSchema = joi
.object({
    targetDate : joi.date().required(),
    pageName : joi.string().trim().required()
}).options({abortEarly: false})

const oathPayloadSchema = joi
.object({
    oath : joi.number().valid(1, 0).required(),
    pageName : joi.string().trim().required()
}).options({abortEarly: false})

// Package Controller : API Payload Schema 
const packageSchema = joi
.object({
    packageId : joi.number().required(),
    name : joi.string().trim().min(6).max(30).required(),
    amount : joi.string().trim().required(), 
    source : joi.string().trim().required(), 
    startDate : joi.date().required(),
    endDate : joi.date().required(),
    type : joi.string().trim().required(),
    duration : joi.number().required(),
}).options({abortEarly: false})

// Selfie Controller : API Payload Schema
const selfieSchema = joi
.object({
    weight : joi.string().trim().max(4).required(),
    waist : joi.string().trim().max(4).required(),
    capturedDate : joi.date().required(),
}).options({abortEarly: false})

// Todo Controller : API Payload Schema
const todoSchema = joi
.object({
    todoId : joi.string().trim().max(4).required(),
    completed : joi.number().valid(0, 1).required(),
}).options({abortEarly: false})

const activeTodoSchema = joi
.object({
    currentDate : joi.string().required()
}).options({abortEarly: false})

// History Controller : API Payload Schema
const budgetSchema = joi
.object({
    FoodId: joi.string().trim().max(15),
    ServingSize : joi.string().trim().max(4).required(),
    Calories : joi.string().trim().max(4).required(),
    Burn_Calories : joi.string().trim().max(4).required(),
    fat: joi.string().trim().max(4),
    Protein: joi.string().trim().max(4),
    Carbs: joi.string().trim().max(4),
    MealType: joi.string().trim().max(10),
    ExerciseId: joi.string().trim().max(4),
    Duration: joi.string().trim().max(4)
}).options({abortEarly: false})

// ChealMeal Controller : API Payload Schema
const cheatSchema = joi
.object({
    Calories : joi.string().trim().max(4).required(),
    Name : joi.string().trim().required(),
    FoodTakenDate : joi.string().trim().required(),
}).options({abortEarly: false})

// Scanner Controller : API Payload Schema
const scannerSchema = joi
.object({
    ServingSize : joi.string().trim().max(4),
    Calories : joi.string().trim().max(4),
    fat: joi.string().trim().max(4),
    Protein: joi.string().trim().max(4),
    Carbs: joi.string().trim().max(4),
    MealType: joi.string().trim().max(10),
    FileName : joi.string().trim(),
    Name: joi.string().trim(),
    PlanId: joi.string().trim(),
    Day: joi.string().trim(),
    Phase : joi.string().trim(),
    
}).options({abortEarly: false})

// Grocery Controller : API Payload Schema
const grocerySchema = joi
.object({
    ListId : joi.string().trim().max(4).required(),
}).options({abortEarly: false})

// ActivaPlan Controller : API Payload Schema
const activePlanSchema = joi
.object({
    PlanId : joi.string().trim().max(4).required(),
    Type: joi.string().trim().required()
}).options({abortEarly: false})

const activePlanUpdateSchema = joi
.object({
    ActivePlanId : joi.string().trim().max(4).required(),
    Type: joi.string().trim().required(),
    Day: joi.string().trim().max(4).required()
}).options({abortEarly: false})

// FoodPlan Controller : Api Payload Schema
const foodReplaceSchema = joi
.object({
    ReplaceCalories : joi.string().trim().required(),
    MealType: joi.string().trim().required()
}).options({abortEarly: false})

const replaceFoodCache = joi
.object({
    foodReplaceId : joi.string().trim().required(),
    foodId: joi.string().trim().required()
}).options({abortEarly: false})

// Favourite Controller : Api Payload Schema
const addFavouriteSchema = joi
.object({
    FavouriteCatagory : joi.string().trim().max(20).required(),
    FavouriteType: joi.string().trim().max(4).required(),
    FavouriteSType: joi.string().trim(),
    VidId: joi.string(),
}).options({abortEarly: false})

// Sleep Controller: Api schema paylaod
const addSleepSchema = joi
.object({
    MoodType : joi.string().trim().max(10).required(),
    SleepTime: joi.date().required(),
    AwakeTime: joi.date().required(),
    PlanId : joi.string().max(4).trim().required()
    
}).options({abortEarly: false})

// Profile Controller: Api schema payload

const updateProfileSchema = joi
.object({
    user_profile_location : joi.string().trim().min(5),
    user_profile_mobile : joi.string().trim(),
    user_profile_name: joi.string().trim().max(25)
}).options({abortEarly: false})

// ChatPost Controller : API Schema Payload
const AddChatPostSchema = joi
.object({
    FileName: joi.string().trim().min(6),
    UserText : joi.string().trim().min(6),
}).options({abortEarly: false})

const UpdateChatPostSchema = joi
.object({
    ChatId: joi.string().trim(),
    FileName: joi.string().trim().min(6),
    UserText : joi.string().trim().min(6),
}).options({abortEarly: false})

const AddLikeCommentSchema = joi
.object({
    UserLike: joi.string().trim().max(1),
    UserComment : joi.string().trim(),
    ChatId: joi.string().trim()
}).options({abortEarly: false})

// Page Controller : Api Schema Payload
const pageSchema = joi
.object({
   
    slug : joi.string().trim().required(),
   
}).options({abortEarly: false})

// Budget Controller : Api schema playload
const getDiarySchema = joi
.object({
   
    currentUserDate : joi.string().trim().required(),
   
}).options({abortEarly: false})

export const signUpValidator = validator(signupSchema)
export const loginValidator = validator(loginSchema)
export const comparePasswordValidator = validator(comparePasswordSchema)
export const otpVerifyValidator = validator(otpVerifySchema)
export const otpResendValidator = validator(otpResendSchema)
export const forgetPasswordValidator = validator(forgetPasswordSchema)
export const questionAnswerValidator = validator(questionAnswerSchema)
export const genderPayloadValidator = validator(genderPayloadSchema)
export const heightPayloadValidator = validator(heightPayloadSchema)
export const weightPayloadValidator = validator(weightPayloadSchema)
export const pregnantPayloadValidator = validator(pregnantPayloadSchema)
export const agePayloadValidator = validator(agePayloadSchema)
export const targetPayloadValidator = validator(targetPayloadSchema)
export const dobPayloadValidator = validator(dobPayloadSchema)
export const motivationPayloadValidator = validator(motivationPayloadSchema)
export const targetDatePayloadValidator = validator(targetDatePayloadSchema)
export const oathPayloadValidator = validator(oathPayloadSchema)
export const packageValidator = validator(packageSchema)
export const selfieValidator = validator(selfieSchema)
export const todoValidator = validator(todoSchema)
export const activeTodoValidator = validator(activeTodoSchema)
export const budgetValidator = validator(budgetSchema)
export const addCheatMealValidator = validator(cheatSchema)
export const scannerValidator = validator(scannerSchema)
export const groceryValidator = validator(grocerySchema)
export const activePlansValidator = validator(activePlanSchema)
export const activePlanUpdateValidator = validator(activePlanUpdateSchema)
export const deleteUserValidator = validator(deleteUserSchema)
export const addFavouriteValidator = validator(addFavouriteSchema)
export const addSleepValidator = validator(addSleepSchema)
export const updateProfileValidator = validator(updateProfileSchema)
export const addChatPostValidator = validator(AddChatPostSchema)
export const addLikeCommentValidator = validator(AddLikeCommentSchema)
export const UpdateChatPostValidator = validator(UpdateChatPostSchema)
export const pageValidator = validator(pageSchema)
export const foodReplaceValidator = validator(foodReplaceSchema)
export const getDiaryValidator = validator(getDiarySchema)
export const foodReplaceCacheValidator = validator(replaceFoodCache)
