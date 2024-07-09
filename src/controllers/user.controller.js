import { 
    agePayloadValidator, 
    dobPayloadValidator, 
    genderPayloadValidator, 
    heightPayloadValidator, 
    motivationPayloadValidator, 
    oathPayloadValidator, 
    pregnantPayloadValidator, 
    targetDatePayloadValidator, 
    targetPayloadValidator, 
    weightPayloadValidator 
} from "../validator/object.schema.validator.js";
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { validUser } from "../utils/ValidUser.js";
import _ from "lodash";
const { now } = _

// Api : For Gender Update
export const updateGender = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await genderPayloadValidator(req.body, res, "UpdateGender")
        const { gender, pageName } = value

        const user = await validUser(user_email, "UpdateGender", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_gender : gender,
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            },
            
        })

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateGender : Gender not updated"))
        }

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateGender : Gender updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateGender : Something went wrong")
    }
})

// Api : For Height Update
export const updateHeight = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await heightPayloadValidator(req.body, res, "UpdateHeight")
        const { height, heightUnit, pageName } = value

        const user = await validUser(user_email, "UpdateHeight", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_height : parseFloat(height),
                user_height_unit : heightUnit,
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            },
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateHeight : Height not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateHeight : Height updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateHeight : Something went wrong")
    }
})

// Api : For Weight Update 
export const updateWeight = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await weightPayloadValidator(req.body, res, "UpdateWeight")
        const { weight, weightUnit, pageName } = value

        const user = await validUser(user_email, "UpdateWeight", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_weight : parseFloat(weight),
                user_weight_unit : weightUnit,
               
                user_modified_at: new Date(now())
            },
            where : {
                user_id : user.user_id
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateWeight : Weight not updated"))
        }
        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })
        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateWeight : Weight updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateWeight : Something went wrong")
    }
})

// Api : For Age Update 
export const updateAge = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await agePayloadValidator(req.body, res, "UpdateAge")
        const { age, pageName } = value

        const user = await validUser(user_email, "UpdateAge", res) 

        if(age < 18 || age > 75)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateAge : Age not valid", { ageInvalid : true}))
        }


        const updatedUser = await prisma.user.update({
            data : {
               user_age : parseInt(age),
            
               user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            },
           
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateAge : Age not updated"))
        }
        
        await prisma.user_page_history.create({
            data:{
                user_user_Id: user.user_id,
                page_history_name: pageName,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateAge : Age updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateAge : Something went wrong")
    }
})

// Api : For Pregnant Update
export const updatePregnant = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await pregnantPayloadValidator(req.body, res, "UpdatePregnant")
        const { isPragnent, pageName } = value

        const user = await validUser(user_email, "UpdatePregnant", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_is_pregnant : parseInt(isPragnent),
                
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            },
            
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdatePregnant : Pregnancy not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdatePregnant : Pregnancy updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdatePregnant : Something went wrong")
    }
})

// Api : For Target Weight Update
export const updateTarget = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await targetPayloadValidator(req.body, res, "UpdateTarget")
        const { targetWeight, targetWeightUnit, pageName } = value

        const user = await validUser(user_email, "updateTarget", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_target_weight : parseFloat(targetWeight),
                user_target_weight_unit : targetWeightUnit,
                
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateTarget : Target not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateTarget : Target updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateTarget : Something went wrong")
    }
})

// Api : For Dob Update
export const updateDob = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await dobPayloadValidator(req.body, res, "UpdateDOB")
        const { dob, pageName } = value

        const user = await validUser(user_email, "UpdateDob", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_date_of_brith : dob,
               
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateDob : Dob not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateDob : Dob updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateDob : Something went wrong")
    }
})

// Api : For Motivation Update
export const updateMotivation = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await motivationPayloadValidator(req.body, res, "UpdateMotivation")
        const { motivation, pageName } = value

        const user = await validUser(user_email, "UpdateMotivation", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_reason_to_loss_weight : motivation,
                
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            },
            
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateMotivation : Motivation not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateMotivation : Motivation updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateMotivation : Something went wrong")
    }
})

// Api : For Target Date Update
export const updateTargetDate = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await targetDatePayloadValidator(req.body, res, "UpdateTargetDate")
        const { targetDate, pageName } = value
        
        const user = await validUser(user_email, "UpdateTargetDate", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_target_date : targetDate,
               
                user_modified_at : new Date(now())
            },
            where : {
                user_id : user.user_id
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateTargetDate : Target date not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateTargetDate : Target Date updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateTargetDate : Something went wrong")
    }
})

// Api : For Oath Update
export const updateOath = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;

        const value = await oathPayloadValidator(req.body, res, "UpdateOath")
        const { oath, pageName } = value
        
        const user = await validUser(user_email, "UpdateOath", res) 

        const updatedUser = await prisma.user.update({
            data : {
                user_is_oath_taken : parseInt(oath),
                user_modified_at : new Date(now())
            },
            where : {
                user_id: user.user_id
            }
        })

        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UpdateOath : Oath not updated"))
        }

        await prisma.user_page_history.create({
            data:{
                page_history_name: pageName,
                user_user_Id: user.user_id,
                page_history_created_at: new Date(now())
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "UpdateOath : Oath updated", updatedUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateOath : Something went wrong")
    }
})


// Api : For Get Target Date 
export const getTargetData = asyncHandler(async (req, res)=>{
    try
    {
        const { user_email } = req.user;
        
        const user = await validUser(user_email, "GetTargetData", res) 

        const currentUser = await prisma.user.findFirst({
            where : {
                user_id : user.user_id,
            },
            
        })
        
        if(!currentUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "GetTargetData : Target data not found"))
        }

        return res
            .status(200)
            .json(new ApiResponse(200, "GetTargetData : Target Data found", currentUser))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateTargetDate : Something went wrong")
    }
})


// API : to Update User Active
export const updateUserActive = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { active } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                user_id: user_id
            }
        })

        if(!user)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdateUserActive : Record not found"
            ))
        }

        const currentUser = await prisma.user.update({
            where:{
                user_id : user_id
            },
            data: {
                user_is_account_active: active
            }
        })

        if(!currentUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "UpdateUserActive : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "UpdateUserActive : Success",
                currentUser,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateUserActive : Something went wrong")
    }
})