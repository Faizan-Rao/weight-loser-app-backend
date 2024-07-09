
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { addFavouriteValidator } from "../validator/object.schema.validator.js";
import _ from "lodash";
const { now } = _


// API : For Active Plans
export const getAllFavourites = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;

        const getAllFavourites = await prisma.favourite.findMany({
            where: {
                user_user_id : user_id,
                favourite_deleted_at: {
                    equals: null
                }
            }
        })

        if(getAllFavourites.length < 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetAllFavourites : Record not found"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetAllFavourites : Record found",
                getAllFavourites
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetAllFavourites : Something went wrong")
    }
})

// API : For Adding Favourite
export const addFavourite = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = await addFavouriteValidator(req.body, res, "AddFavourite")
        const {
            FavouriteCatagory,
            FavouriteType,
            FavouriteSType,
            VidId,
        } = value

        const currentFavourite = await prisma.favourite.create({
            data : {
                 favourite_category: FavouriteCatagory,
                 favourite_parent: FavouriteType,
                 favourite_child: FavouriteSType,
                 user_user_id : user_id,
                 favourite_created_at: new Date(now())
            }
        })

        if(!currentFavourite)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddFavourites : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddFavourite : Success"
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddFavourite : Something went wrong")
    }
})

// API : For Deleting Favourite
export const deleteFavourite = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { favId } = req.params;

        const deleteRecord  = await prisma.favourite.update({
            where: {
                favourite_id: favId,
                user_user_id : user_id,
            },
            data :{
                favourite_deleted_at: new Date(now())
            }
        })

        if(deleteRecord.favourite_deleted_at === null)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "DeleteFavourite: Failed"
            ))
        }
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "DeleteFavourite: Success",
                deleteRecord,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "DeleteFavourite : Something went wrong")
    }
})


