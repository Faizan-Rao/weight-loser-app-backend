import { prisma } from "../client/client.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

export const validUser = async (email, funcName, res) => {
    try
    {
        const user = await prisma.user.findFirst({
            where:{
                user_email : email
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

        if(!user)
        {
            return res.status(404).json(new ApiResponse(404, `${funcName} : User Not Found`))
        }

        return user
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || `${funcName} : Something went wrong `)
    }
}