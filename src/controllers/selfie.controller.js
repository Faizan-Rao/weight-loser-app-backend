
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
    selfieValidator
} from '../validator/object.schema.validator.js';
import _ from "lodash";
const { now } = _

// API : FOR ADDING SELFIE
export const addSelfie = asyncHandler(async (req, res)=>{
    try
    {
        
       
        const { user_id } = req.user
        const value = await selfieValidator(req.body, res, "AddSelfie")
        const { weight, waist, capturedDate } = value

        let filePath = null
        if(req.file)
        {
            filePath ="/uploads/" + req.file.filename  
        }

        const Selfie = await prisma.selfie.create({
            data : {
                user_user_id : user_id,
                selfie_weight : parseInt(weight),
                selfie_waist : parseFloat(waist),
                selfie_filename : filePath,
                selfie_date : capturedDate,
                selfie_created_at: new Date(now())
            }
        })

        const currentSelfie = await prisma.selfie.findFirst({
            where :{
                selfie_id : Selfie.selfie_id
            }
        })

        if(!currentSelfie)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "AddSelfie : Selfie Not Added"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "AddSelfie : Selfie Added", currentSelfie))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddSelfie : Something went wrong")
    }
})

//API : FOR FETCHING Selfies
export const getSelfie = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user

        const currentSelfie = await prisma.selfie.findMany({
            where : {
                user_user_id  : user_id
            }
        })

        if(!currentSelfie)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "GetSelfie : Failed"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "GetSelfie : Success", currentSelfie))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetSelfie : Something went wrong")
    }
})