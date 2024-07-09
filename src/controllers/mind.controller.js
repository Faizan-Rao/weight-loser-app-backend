
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



//API : For Active Plans
export const getMindPlans = asyncHandler(async (req, res)=>{
    try
    {
        
        const mindPlans = await prisma.plan.findMany({
            where : {
               plan_type: "mind"
            }
        })
       

        if(mindPlans.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetMindPlans : Not Found"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "GetMindPlans : Success", 
        mindPlans
    ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetMindPlans : Something went wrong")
    }
})

// API : For Viewing Food Plan
export const viewMindPlan = asyncHandler(async (req, res)=>{
    try
    {
        const { planId } = req.params
        
        const fullPlan = await prisma.mind_plan.findMany({
            where : {
                plan_plan_id : parseInt(planId),
            },
            orderBy: {
                mindplan_day: 'asc'
            },
            include:{
                video: true,
            }
        })

        if(fullPlan.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewMindPlan : Records not found"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewMindPlan : Records found",
                fullPlan
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewMindPlan : Something went wrong")
    }
})

// API : For Viewing Food Details 
export const viewMindDetails = asyncHandler(async (req, res)=>{
    try
    {
        const { videoId } = req.params
        
        const video = await prisma.video.findFirst({
            where : {
                video_id : parseInt(videoId),
            },
        })

        if(!video)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ViewVideoDetails : Records not found"
            ))
        }
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ViewVideoDetails : Records found",
                video
            ))
        
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ViewVideoDetails : Something went wrong")
    }
})


// API : for fetching videos for sleep 

export const getAllVideos = asyncHandler(async (req, res)=>{
    try
    {
        const { planId } = req.params
        const allMindPlans = await prisma.mindplans.findMany({
            where: {
                PlanId : planId
            },
            orderBy:{
                Day: 'asc'
            }
        })

        if(allMindPlans.length < 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetVideos : Records not found"
            ))
        }

        let allVideoRecord = await Promise.allSettled(allMindPlans.map( async item =>{
            const videoRecord = await prisma.videos.findFirst({
                where: {
                    Id : item.VideoId
                }
            })

            return videoRecord;
        }))

        allVideoRecord = allVideoRecord.map(item => item.value)

        if(allVideoRecord.length < 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetVideos : Videos not exists"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetVideos : Record Found",
            {
                videoPlans : allMindPlans,
                allVideos : allVideoRecord
            }
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetVideos : Something went wrong")
    }
})
