import { prisma } from "../client/client.js";
import redisClient from "../client/redis-client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



//API : FOR FETCHING Seilfies
export const getQuote = asyncHandler(async (req, res)=>{
    try
    {
        const { day } = req.params;

        let cachedValue = await redisClient.get(`wl:get-quote:day:${day}`)

        if(cachedValue)
        {
            return res
            .status(200)
            .json(new ApiResponse(200, "GetQuote : Success", JSON.parse(cachedValue)))
        }
        
        const currentQuote = await prisma.quote.findFirst({
            where : {
                quote_day : parseInt(day)
            }
        })

        if(!currentQuote)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetQuote : Not Found"))
        }

        let payload = currentQuote
        await redisClient.set(`wl:get-quote:day:${day}`, JSON.stringify(payload))
        await redisClient.expire(`wl:get-quote:day:${day}`, process.env.PROJECT_STATE === "production" ? 3600 : 60)
        
        return res
        .status(200)
        .json(new ApiResponse(200, "GetQuote : Success", currentQuote))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetQuote : Something went wrong")
    }
})