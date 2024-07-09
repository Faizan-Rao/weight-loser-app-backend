import { packageValidator } from "../validator/object.schema.validator.js";
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { addDays } from 'date-fns'
import _ from "lodash";
import redisClient from "../client/redis-client.js";
const { now } = _

// API : FOR Package Taken
export const purchasePackage = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user 
        const value = await packageValidator(req.body, res, "PurchasePackage")
        const {
            packageId, 
            name, 
            amount, 
            startDate, 
            endDate, 
            source,
            type, 
            duration } = value

        // Check Previous User Package
        const prevPackage = await prisma.user_purchase_package.findFirst({
            where:{
                user_user_id: user_id
            },
            orderBy:{
                purchase_created_at : 'desc'
            }
        })
        
        let currentEndDate = null;

        if(prevPackage)
        {
            prevPackage.purchase_amount += parseFloat(amount)
            prevPackage.purchase_duration += duration
            currentEndDate = addDays(prevPackage.purchase_ending_date, parseInt(duration))
        }
        
        const userPackage = await prisma.user_purchase_package.upsert({
            create : {
                package_package_id : packageId,
                user_user_id : user_id,
                purchase_amount : parseFloat(amount),
                purchase_starting_date : new Date(startDate),
                purchase_ending_date : currentEndDate || new Date(endDate) ,
                purchase_type: type,
                purchase_duration: prevPackage?.purchase_duration || duration,
                purchase_status : 'active',
                purchase_created_at : new Date(now())
            },
            update:{
                purchase_amount: prevPackage.purchase_amount ?? parseFloat(amount),
                purchase_starting_date : new Date(startDate),
                purchase_ending_date : currentEndDate || new Date(endDate) ,
                purchase_type: type,
                purchase_duration: prevPackage?.purchase_duration || duration,
                purchase_status : 'active',
                purchase_modified_at: new Date(now())
            },
            where: {
                purchase_id_package_package_id_user_user_id :{
                    user_user_id : user_id,
                    package_package_id: packageId,
                    purchase_id: prevPackage.purchase_id

                }
            }
        })

        if(!userPackage)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "PurchasePackage : Package purchase Failed" , {
                isPackageValid : false
            } ))
        }

        await prisma.transactions.create({
            data:{
                transaction_amount: parseFloat(amount),
                transaction_date: new Date(now()),
                transaction_source: source,
                transaction_status: "paid",
                transaction_created_at: new Date(now()),
                user_user_Id: userPackage.user_user_id
            }
        })

        return res
            .status(200)
            .json(new ApiResponse(200, "PurchasePackage : Package purchase successfully",
            {
                isPackageValid : true,
            }  ))

    }
    catch(error)
    {
        throw new ApiError(403, error.message || "SetPackageForUser : Something went wrong")
    }
})

export const getUserPackage = asyncHandler(async(req, res)=>{
    try
    {
        const { user_id } = req.user;

        let cachedValue = await redisClient.get(`wl:get-user-package:user_id:${user_id}`)

        if(cachedValue)
        {
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetUserPackage : Success",
           JSON.parse(cachedValue)
            ))
        }
        

        const userPackage = await prisma.user_purchase_package.findFirst({
            where: {
                user_user_id : user_id
            },
            orderBy:{
                purchase_created_at: "desc"
            }
        })
       
        if(!userPackage)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetUserPackage : Package Not Found",
                {
                    isPackageValid : false
                } 
            ))
        }

        let currentDate =  new Date(now())
        let endDate = new Date(userPackage?.purchase_ending_date)
        let isExpired = endDate.valueOf() < currentDate.valueOf()
       
        if(isExpired)
        {
            await prisma.user_purchase_package.update({
                where:{
                    purchase_id_package_package_id_user_user_id: {
                        user_user_id : user_id,
                        purchase_id: userPackage.purchase_id,
                        package_package_id: userPackage.package_package_id
                    }
                },
                data:{
                    purchase_status: "inactive"
                }
            })

            let payload = {
                packageExpired: true,
                isPackageValid: false,
                
            }

            await redisClient.del(`wl:get-user-package:user_id:${user_id}`)
            await redisClient.set(`wl:get-user-package:user_id:${user_id}`, JSON.stringify(payload), "KEEPTTL")
            await redisClient.expire(`wl:get-user-package:user_id:${user_id}`, process.env.PROJECT_STATE === 'production' ? 180 : 60)

            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetUserPackage : User Expired",
                {
                    packageExpired: true,
                    isPackageValid: false,
                    
                }
            ))
        }

        let payload = { 
            userPackage,
            isPackageValid : true
        }
        await redisClient.set(`wl:get-user-package:user_id:${user_id}`, JSON.stringify(payload), "KEEPTTL")
        await redisClient.expire(`wl:get-user-package:user_id:${user_id}`, process.env.PROJECT_STATE === 'production' ? 180 : 60)

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetUserPackage : Success",
        payload
        ))

        
    }
    catch(error)
    {
        throw new ApiError(403, error.message || "getUserPackage : Something went wrong")
    }
})

export const singlePackage = asyncHandler(async (req, res)=>{
    try
    {
        const { title, trial } = req.params
        let monthlyPackage = await prisma.packages.findFirst({
            where:{
                package_title: title
            }
        })

        if(!monthlyPackage)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "SinglePackage : Success",
                monthlyPackage
            ))
        }
        
        if(parseInt(trial) === 1)
        {
            monthlyPackage.package_discount = 50;
        }
        else if(parseInt(trial) === 0)
        {
            monthlyPackage.package_discount = 70;
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "SinglePackage : Success",
            monthlyPackage
        ))

    }
    catch(error)
    {
        throw new ApiError(403, error.message || "SinglePackage : Something went wrong")
    }
})

export const getAllPackages = asyncHandler(async (req, res)=>{
    try
    {
        const allPackages =  await prisma.packages.findMany()
        
        if(allPackages.length <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetAllPackages : Not found"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetAllPackages : Success",
                allPackages
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error.message || "GetAllPackages : Something went wrong")
    }
})