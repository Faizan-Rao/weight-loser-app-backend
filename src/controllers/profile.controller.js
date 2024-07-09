
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { updateProfileValidator } from "../validator/object.schema.validator.js"
import _ from "lodash";
const { now } = _


//API : get profile
export const getProfile = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        
        const userProfile = await prisma.user_profile.findFirst({
            where:{
                user_user_id: user_id
            }
        })
        const user = await prisma.user.findUnique({
            where:{
                user_id : user_id
            }
        })

        if(!userProfile)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetProfile : User profile not found"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetProfile: Record Found",
            {
                user,
                userProfile
            }
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetProfile : Something went wrong")
    }
})

//API : For Update location
export const updateProfile = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id, user_name } = req.user;
        
        const value = await updateProfileValidator(req.body, res, "UpdateProfile")
        
        const userProfile = await prisma.user_profile.findFirst({
            where: {
                user_user_id: user_id,
            }
        }) 

        if(!userProfile)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdateProfile : Record Not Found",
            ))
        }


        let payload  = {};
        
        const objectProps = Object.getOwnPropertyNames(req.body)
        objectProps.forEach(item => {
            if(value[item] !== null)
            {
                payload[item] = value[item]
            }
        });
       
        payload.user_profile_modified_at = new Date(now())
        
        const currentUser = await prisma.user_profile.update({
            data: payload,
            where:{
                user_user_id: user_id,
               
            }
        })

        if(!currentUser)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdateProfile : Failed"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "UpdateProfile: Success",
            currentUser
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetProfile : Something went wrong")
    }
})


//API : For Update location
export const updateDp = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        
        let filePath = null
        if(req.file)
        {
            filePath = "/uploads/" + req.file.filename  
        }
        
        const userProfile = await prisma.user_profile.findFirst({
            where: {
                user_user_id: user_id,
            }
        }) 

        if(!userProfile)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdateDp : Record Not Found",
            ))
        }
        
        
        
        const currentUser = await prisma.user_profile.update({
            data: {
                user_profile_image: filePath
            },
            where:{
                user_user_id: user_id
            }
        })

        if(!currentUser)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdateDp : Failed"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "UpdateDp: Success",
            currentUser
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateDp : Something went wrong")
    }
})



