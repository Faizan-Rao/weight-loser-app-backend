
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import _ from "lodash"
import { addSleepValidator } from "../validator/object.schema.validator.js";
const { now } = _


//API : For add sleep
export const addSleep = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user

        const value = await addSleepValidator(req.body, res, "AddSleep")
        const {
            MoodType,
            SleepTime,
            AwakeTime,
            PlanId
        } = value

        let sleepTime = new Date(SleepTime)
        let awakeTime = new Date(AwakeTime)
        let TotalSleep = new Date();

        TotalSleep = TotalSleep.setHours(awakeTime.getHours() + sleepTime.getHours());

        const currentSleep = await prisma.sleep.create({
            data:{
                sleep_awake_time: sleepTime,
                sleep_start_time: awakeTime,
                sleep_mood_type: MoodType,
                user_user_id: user_id,
                sleep_total_sleep: new Date(TotalSleep),
                sleep_created_at: new Date(now())
            }
        })



        if(!currentSleep)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "AddSleep : Failed"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "AddSleep : Success", 
        
            currentSleep
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddSleep : Something went wrong")
    }
})




