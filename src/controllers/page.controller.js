import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

import _ from "lodash";
import { pageValidator } from "../validator/object.schema.validator.js";
import redisClient from "../client/redis-client.js";
const { now } = _

//API - For Fetching Page Data
export const getPage = asyncHandler(async (req, res)=>{
    try
    {

        const value = await pageValidator(req.body, res, "GetPage")
        const { slug } = value
        
        let cachedPage = await redisClient.get(`wl:get-page:slug:${slug}`)
        
        if(cachedPage)
        {
            return res
            .status(200)
            .json(new ApiResponse(
                    200,
                    "GetPage : Record Found",
                    JSON.parse(cachedPage)
            ))
        }

        const page = await prisma.page.findFirst({
                where: {
                    page_slug : slug
                }
            }) 

        if(!page)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                    404,
                    "GetPage : Not Found"
            ))
        }
        let payload = page

        await redisClient.set(`wl:get-page:slug:${{slug}}`, JSON.stringify(payload));    

        await redisClient.expire(`wl:get-page:slug:${{slug}}`, process.env.PROJECT_STATE === "production" ? 3600 : 60);

        return res
        .status(200)
        .json(new ApiResponse(
                 200,
                "GetPage : Record Found",
                payload
        ))
        
    }
    catch(error)
    {
        throw new ApiError(403, "GetPage : Something went wrong")
    }
})