
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import _ from "lodash"
import { activePlanUpdateValidator, activePlansValidator } from "../validator/object.schema.validator.js";
import redisClient from "../client/redis-client.js";
const { now } = _


//API : For Active Plans
export const getActivePlans = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user

        const cachedValue = await redisClient.get(`get-active-plan:user:${user_id}`)

        if(cachedValue)
        {
            return res
             .status(200)
             .json(new ApiResponse(200, "GetActivePlan : Success", JSON.parse(cachedValue)))
        }

        const activePlans = await prisma.activeplan.findMany({
            where : {
               user_user_id : user_id,
               OR:[
                   {activeplan_type : "mind"},
                   {activeplan_type: "diet"},
                   {activeplan_type : "exercise"},
               ]
            }
        })
    
        let activeFilteredPlans = activePlans.reduce((accum, item)=>{
            if(parseInt(item.activeplan_is_active) === 1)
            {
                accum.activePlanList.push(item)
            }
            else
            {
                accum.inactivePlanList.push(item)
            }
            return accum
        }, {
            activePlanList : [],
            inactivePlanList: []
        })

        if(!activePlans)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetActivePlan : Not Found"))
        }

        let payload = { 
            activePlanLists: activeFilteredPlans
         }

        await redisClient.set(`get-active-plan:user:${user_id}`, JSON.stringify(payload), `KEEPTTL`)
        await redisClient.expire(`get-active-plan:user:${user_id}`, process.env.PROJECT_STATE === "production" ?60 * 60 : 60)

        return res
        .status(200)
        .json(new ApiResponse(200, "GetActivePlan : Success", 
        { 
           activePlanLists: activeFilteredPlans
        }))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetActivePlan : Something went wrong")
    }
})


// API : To Activate Plans
export const addActivePlan = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const value = await activePlansValidator(req.body, res, "AddActivePlan");
        const { PlanId, Type } = value;

        await prisma.activeplan.updateMany({
            where: {
                user_user_id : user_id,
                activeplan_type: Type
            },
            data:{
                activeplan_is_active: 0,
                activeplan_modified_at: new Date(now())
            }
        })
        
        const currentActivePlan = await prisma.activeplan.create({
            data:{
                user_user_id: user_id,
                plan_plan_id: PlanId,
                activeplan_is_active: 1,
                activeplan_days: 1,
                activeplan_type: Type,
                activeplan_created_at: new Date(now()),
            }
        })

        if(!currentActivePlan)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401, 
                "AddActivePlan : Plan not activated"
            ))
        }

        
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            "AddActivePlan : Plan activated",
            currentActivePlan
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddActivePlan : Something went wrong")
    }
})

// API : For Updating Day of Current Active Plan
export const updateActivePlanDay = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        

        let recordToUpdateDiet = await prisma.activeplan.findFirst({
            where: {
                 user_user_id : user_id,
                 activeplan_type: "diet"
            },
            orderBy:{
                activeplan_created_at: "desc"
            }
        })

        let recordToUpdateExercise = await prisma.activeplan.findFirst({
            where: {
                 user_user_id : user_id,
                 activeplan_type: "exercise"
            },
            orderBy:{
                activeplan_created_at: "desc"
            }
        })

        let recordToUpdateMind = await prisma.activeplan.findFirst({
            where: {
                 user_user_id : user_id,
                 activeplan_type: "mind"
            },
            orderBy:{
                activeplan_created_at: "desc"
            }
        }) 
        

        let daysDiet =  recordToUpdateDiet?.activeplan_days;
        let daysMind =  recordToUpdateMind?.activeplan_days;
        let daysExercise =  recordToUpdateExercise?.activeplan_days;

        if(daysDiet && recordToUpdateDiet?.activeplan_days <= 70)
        {
            daysDiet = recordToUpdateDiet.activeplan_days + 1

           await prisma.activeplan.update({
                where: {
                    activeplan_id_user_user_id_plan_plan_id:{
                        activeplan_id: recordToUpdateDiet?.activeplan_id,
                        user_user_id: user_id,
                        plan_plan_id: recordToUpdateDiet?.plan_plan_id
                    }
                },
                data:{
                    activeplan_days: daysDiet,
                    activeplan_modified_at: new Date(now())
                }
            })
        }
        if(daysMind  && recordToUpdateMind?.activeplan_days <= 70)
        {
            daysMind = recordToUpdateMind.activeplan_days + 1

           await prisma.activeplan.update({
                where: {
                    activeplan_id: recordToUpdateMind?.activeplan_id,
                },
                data:{
                    activeplan_days: daysMind,
                    activeplan_modified_at: new Date(now())
                }
            })
        }
        if(daysExercise && recordToUpdateExercise?.activeplan_days <= 70)
        {
            daysExercise = recordToUpdateExercise.activeplan_days + 1
            await prisma.activeplan.update({
                where: {
                    activeplan_id: recordToUpdateExercise?.activeplan_id,
                },
                data:{
                    activeplan_days: daysExercise,
                    activeplan_modified_at: new Date(now())
                }
            })
        }

        let payload = await getActiveplansList(user_id)

        await redisClient.set(`get-active-plan:user:${user_id}`, JSON.stringify(payload), `KEEPTTL`)
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "UpdateActivePlanDay : Record updation successful",
                payload
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdateActivePlanDay : Something went wrong")
    }
})

// GetActivePlanList : Function to get active PlanList for Caching
const getActiveplansList = async (user_id) => {
    const activePlans = await prisma.activeplan.findMany({
        where : {
           user_user_id : user_id,
           OR:[
               {activeplan_type : "mind"},
               {activeplan_type : "diet"},
               {activeplan_type : "exercise"},
           ]
        }
    })

    let activeFilteredPlans = activePlans.reduce((accum, item)=>{
        if(parseInt(item.Active) === 1)
        {
            accum.activePlanList.push(item)
        }
        else
        {
            accum.inactivePlanList.push(item)
        }
        return accum
    }, {
        activePlanList : [],
        inactivePlanList: []
    })

    return Promise.resolve({ 
        activePlanLists: activeFilteredPlans
     })
}


// API : For Reversing the Plan Day
export const reversePlanDays = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { planId } = req.params;

        const plan = await prisma.activeplan.findFirst({
            where: {
                plan_plan_id: parseInt(planId),
                user_user_id: user_id
            },
            orderBy:{
                activeplan_created_at: "desc"
            }
        })

        if(!plan)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "ReversePlanDays : Record not found"
            ))
        }

        const updateActivePlan = await prisma.activeplan.update({
            where : {
                activeplan_id_user_user_id_plan_plan_id : {
                    user_user_id: user_id,
                    plan_plan_id: planId,
                    activeplan_id: plan.activeplan_id,
                }

            },
            data : {
                activeplan_days : 42,
            }
        }) 

        if(!updateActivePlan)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "ReversePlanDays : Record not found"
            ))
        }

        let payload = await getActiveplansList(user_id)

        await redisClient.set(`get-active-plan:user:${user_id}`, JSON.stringify(payload), `KEEPTTL`)
        
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "ReversePlanDays : Success",
                updateActivePlan
            ))

    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "ReversePlanDays : Something went wrong")
    }
})