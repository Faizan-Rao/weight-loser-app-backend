import { prisma } from "../client/client.js";
import { cookieOptions } from "../config/CookieOption.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/GenerateTokens.js";
import generateOTP from "../utils/GenerateOTP.js";
import { mail } from "../utils/Mail.js";
import _ from "lodash";
const { now } = _ ;
export const successRedirect = asyncHandler(async (req, res)=>{
    
   try {
     let googleUser = req.body;
    
     if(_.isEmpty(googleUser))
     {
         return res
         .status(402)
         .json( new ApiResponse(402, "Oath with Gooogle : Invalid Credentials"))
     }

     let user = await prisma.user.findFirst({
        where: {
            user_email: googleUser.email
        }
    });

  
    const newUser = await prisma.user.upsert({
        create :{
            user_email : googleUser.email,
            user_name : googleUser.displayName,
            user_is_account_active: 1
        },
        update:{
            user_email : googleUser.email,
            user_name : googleUser.displayName,
        },
        where:{
            user_email : googleUser.email
        }
    })
    
    const currentUser = await prisma.user.findFirst({
        where:{
            user_email: newUser.user_email
        },
    })
    
    const {accessToken } = generateToken(currentUser) 

    if(!currentUser)
    {
        return res
        .status(401)
        .json(new ApiResponse(401, "Oath with Gooogle : Failed"))
    }

    if(currentUser.user_deleted_at !== null)
    {
            return res
            .status(405)
            .json(new ApiResponse(405, "Oath with Gooogle : User is Deleted", {
                accessToken
            }))
    }

    if(!currentUser.user_is_email_verify)
    {
        const otp = generateOTP()
        await mail(currentUser.user_email, otp)
    }
    
    if(!user)
    {
        await prisma.user_profile.create({
            data:{
                user_user_id: currentUser.user_id,
                user_profile_name: currentUser.user_name,
                user_profile_created_at: new Date(now()),
            }
        })
        await prisma.login_status.create({
            data:{
                user_user_id: currentUser.user_id,
                login_status_is_active: true,
                login_status_created_at: new Date(now()),
            }
        })
    }
    

    currentUser.accessToken = accessToken

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, "Oath with Gooogle : Successfully", currentUser))
    

}
catch(err){
    
    throw new ApiError(403, err?.message || "SignUp : Something went wrong")
}    

})

export const failureRedirect = asyncHandler(async (req, res)=>{
    console.log("User Not Logged In")
    res.send("not working")
})