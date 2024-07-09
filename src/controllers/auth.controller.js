import { prisma } from "../client/client.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { 
    signUpValidator,
    loginValidator,
    otpVerifyValidator,
    forgetPasswordValidator,
    deleteUserValidator,
    otpResendValidator
 } from "../validator/object.schema.validator.js"
import _ from "lodash"
import { hashPassword } from "../utils/HashPassword.js"
import { comparePassword } from "../utils/ComparePassword.js"
import { mail } from "../utils/Mail.js"
import generateOTP from "../utils/GenerateOTP.js"
import { cookieOptions } from "../config/CookieOption.js"
import { generateToken } from "../utils/GenerateTokens.js"

const { now } = _

// API : FOR USER SIGNUP
export const signUp = asyncHandler(async (req, res) =>{
    try
    {
        // check the credentials are valid 
        // find the user must not exist
        // create new record and return 
       
        const value =  signUpValidator(req.body, res, "SignUp")
        const {name, email, password} = value
    
        const user = await prisma.user.findFirst({
            where: {
                user_email: email
            }
        })

        if(user)
        {
            return res
            .status(402)
            .json( new ApiResponse(402, "SignUp : User already exists"))
        }

       // TODO : Create New User
        const hashedPassword = await hashPassword(password)
      
        const newUser = await prisma.user.create({
            data :{
                user_email : email,
                user_password : hashedPassword,
                user_name : name,
                user_created_at: new Date(now())
            }
        })
        
        const currentUser = await prisma.user.findFirst({
            where:{
                user_email: newUser?.user_email
            },
            
            
        })
        
        const { accessToken } = generateToken(currentUser) 

        
        
        if(!currentUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "SignUp : User not created"))
        }
        
        const otp = generateOTP()
        const userOtp = await prisma.otp.findUnique({
            where:{
                user_user_id: newUser?.user_id
            } 
        })

        if(userOtp)
        {
            await prisma.otp.update({
                where:{
                    user_user_id: newUser?.user_id
                },
                data:{
                    otp_code: `${otp}`,
                    otp_created_at: new Date(now())
                }
            })
        }
        else
        {
            await prisma.otp.create({
                data:{
                    user_user_id: newUser?.user_id,
                    otp_code: `${otp}`,
                    otp_status: 1,
                    otp_created_at: new Date(now())
                }
            })
        }
        
        await mail(currentUser.user_email, otp)
        
        await prisma.login_status.create({
            data:{
                user_user_id: currentUser?.user_id,
                login_status_is_active: true,
                login_status_created_at: new Date(now())
            }
        })
       
        await prisma.user_profile.create({
            data: {
                user_profile_name: currentUser.user_name,
                user_user_id: currentUser.user_id,
                user_profile_created_at: new Date(now())
            }
        })
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new ApiResponse(200, "SignUp : User created successfully", { accessToken }))
    
    }
    catch(err){
        
        throw new ApiError(403, err?.message || "SignUp : Something went wrong")
    }    
    
})

// API : FOR USER LOGIN
export const login = asyncHandler(async (req, res)=>{
    try
    {
       
        // Validate Credentials 
        // Proceed login
        const value = loginValidator(req.body, res, "Login")
        const {email, password} = value
       
        const user = await prisma.user.findFirst({
            where : {
                user_email : email
            },
            include:{
                    user_page_history: {
                        orderBy:{
                            page_history_created_at: "desc"
                        },
                        take: 1
                    }
                }
        })
       
        

        if(!user)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "Login : User not found"))
        }

        const isPasswordValid = await comparePassword(password, user.user_password, res)
        
        if(!isPasswordValid)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "Login : User Password Mismatched"))
        }

        const { accessToken } = generateToken(user);
        
        if(user.user_deleted_at !== null)
        {
            return res
            .status(405)
            .json(new ApiResponse(405, "Login : User is Deleted", {
                accessToken
            }))
        }

        await prisma.login_status.upsert({
            create:{
                user_user_id: user?.user_id,
                login_status_is_active: true,
                login_status_created_at: new Date(now())
            },
            update:{
                login_status_is_active: true,
                login_status_modified_at: new Date(now())
            },
            where:{
                    user_user_id: user?.user_id
            }
        })

        
        user.accessToken = accessToken
        user.user_page_history = user.user_page_history[0]
        delete user.user_password
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new ApiResponse(200, "Login : You are successfully logined", user))
    }
    catch(err)
    {
        throw new ApiError(403, err?.message || "Login : Something Went Wrong")
    }
})

// API : FOR OTP VERIFICATION
export const otpVerify = asyncHandler(async (req, res)=>{
    try
    {
        const {user_id, user_email }= req.user
        const { otpCode } = otpVerifyValidator(req.body, res, "OTPverify")

        const user = await prisma.user.findFirst({
            where: {
                user_email : user_email,
            },
        })
       
        if(!user)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "OtpVerify : User not found"))
        }
        
        const userOtp = await prisma.otp.findFirst({
            where:{
                user_user_id: user. user_id
            }
        })

        if(userOtp.otp_code !== otpCode){
            return res
            .status(402)
            .json(new ApiResponse(401, "OtpVerify : Your otp is wrong"))
        }

        const updatedUser = await prisma.user.update({
            data:{
                user_is_email_verify : 1,
                user_modified_at : new Date(now())
            },
            where:{
                user_id : user_id,
                user_email : user_email
            },
        })
       
        if(!updatedUser.user_is_email_verify)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "OtpVerify : User Email Not Verified"))
        }
        return res
            .status(200)
            .json(new ApiResponse(200, "OtpVerify : User Email Verified"))
    }
    catch(err)
    {
        throw new ApiError(403, err?.message || "OtpVerify : Something went wrong")
    }
})

// API : FOR FORGET PASSWORD
export const forgetPassword = asyncHandler(async (req, res)=>{
    try
    {
        const value = forgetPasswordValidator(req.body, res, "ForgetPassword")
        const {email, password, otpCode} = value;

        let otp = otpCode || null
        
        // TODO :  OTP MAIL VERIFICATION
        const user = await prisma.user.findFirst({
            where:{
                user_email : email
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "ForgetPassword : User not found"))
        }

        const userOtp = await prisma.otp.findFirst({
            where:{
                user_user_id: user.user_id
            }
        })

        
        let OTPValid = JSON.parse(userOtp.otp_code) === JSON.parse(`${otp}`)
       
        let updateUser = user;

        if(OTPValid)
        {
          updateUser =  await prisma.user.update({
                data:{
                    user_is_email_verify : 1,
                    user_modified_at: new Date(now())
                },
                where:{
                    user_id : user.user_id,
                    user_email : user.user_email
                },
            })

            return res
            .status(200)
            .json(new ApiResponse(200, "ForgetPassword : User Email Verified"))

        }

        if(!updateUser.user_is_email_verify)
        {
            const otp = generateOTP()
             await prisma.otp.update({
                where:{
                    otp_id: userOtp.otp_id
                },
                data:{
                    otp_code: `${otp}`
                }
            })
    
            await mail(user.user_email, otp)

            return res
            .status(200)
            .json(new ApiResponse(200, "ForgetPassword : User Email Send Successfully "))
        }

        let accessToken = "";

        if(password)
        {
            //after Verification
        const hashedPassword = await hashPassword(password)
        
        const updatedUser = await prisma.user.update({
            where :{
                user_id : user.user_id
            },
            data : {
                user_password : hashedPassword,
                user_modified_at: new Date(now())
            },
            select:{
                user_id: true,
                user_name: true,
                user_email: true,
                user_is_email_verify: true,
                user_password: true,
                user_is_account_active: true 
            }
        })

        if(!updatedUser)
        {
            return res.status(402).json(new ApiResponse(402, "ForgetPassword : User's password is not updated"))
        }

         accessToken = generateToken(updatedUser)?.accessToken
    }

        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new ApiResponse(200, "ForgetPassword : Success", {
            accessToken
        }))

    }
    catch(err)
    {
        throw new ApiError(403, err?.message || "ForgetPassword : Something went wrong")
    }
})  

// API : FOR RESEND OTP
export const resendOTP = asyncHandler(async (req, res)=>{
    try
    {
        const value = await otpResendValidator(req.body, res, "ResendOTP")
        const { Email } = value;
        
        const otp = generateOTP()
        
        const user = await prisma.user.findFirst({
            where:{
                user_email : Email
            }
        })
        
        if(!user)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "ResendOTP : User not found"))
        }

        const updatedUser = await prisma.otp.update({
            where : {
                user_user_id : user.user_id
            },
            data : {
                otp_code : `${otp}`,
                otp_modified_at: new Date(now())
            }
        })
        
        if(!updatedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(404, "ResendOTP : Otp Resend failed"))
        }

        if(user.user_is_email_verify)
        {
            return res
            .status(200)
            .json(new ApiResponse(200, "ResendOTP : User already verified"))
        }

        await mail(user.user_email, otp)
        
        return res
        .status(200)
        .json(new ApiResponse(200, "ResendOTP : Otp Resend Successfully"))
    }
    catch(err)
    {
        throw new ApiError(403, err?.message || "ResendOTP : Something went wrong")
    }
})

// API : For user Logout
export const userLogout = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        
        const userlogin = await prisma.login_status.update({
            where:{
                user_user_id: user_id,
            },
            data:{
                login_status_is_active: false,
                login_status_modified_at: new Date(now())
            }
        })
        
        if(userlogin.login_status_is_active !== false)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "UserLogout : User logout failed"
            ))
        }

        return res
        .status(200)
        .clearCookie("accessToken")
        .json(new ApiResponse(
            200,
            "UserLogout : User successfully Logout"
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UserLogout : Something went wrong")
    }
})

// API : For Account Deletion
export const userAccountDeletion = asyncHandler(async (req, res)=>{
    try
    {
        const { email, password, review } = await deleteUserValidator(req.body);
        const { user_id } = req.user;

        const user = await prisma.user.findFirst({
            where:{
                user_id: user_id,
                user_email: user_email,
            }
        }) 
        
        if(user.user_deleted_at !== null)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404, 
                "userAccountDeletion : User Already Deleted"
            ))
        }
        
        const isPasswordValid = await comparePassword(password, user.user_password, res)
        
        if(!isPasswordValid)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401, 
                "userAccountDeletion : User Password Mismatched"
            ))
        }

        const deletedUser = await prisma.user.update({
            where:{
                user_id: user_id,
                user_email: email,
                user_review: review
            },
            data:{
                user_deleted_at: new Date(now())
            }
        })

        if(!deletedUser)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401, 
                "userAccountDeletion : User not deleted"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200, 
                "userAccountDeletion : Successfull"
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UserLogout : Something went wrong")
    }
})


