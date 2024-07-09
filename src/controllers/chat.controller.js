
import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { UpdateChatPostValidator, addChatPostValidator, addLikeCommentValidator } from "../validator/object.schema.validator.js"
import _ from "lodash"
const { now } = _

//API : FOR Fetching Todays Food
export const getAllPost = asyncHandler(async (req, res)=>{
    try
    {
        const {current, max} = req.params;
        let currentNum = current;
        if(!currentNum)
        {
            currentNum = 0
        }
        if(currentNum > max)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetAllPost : Index Bound Error"
            ))
        }
        const allChatPosts = await prisma.chatpost.findMany({
            orderBy:{
                chatpost_created_at: "desc"
            },
            where: {
                chatpost_deleted_at : {
                    equals : null
                }
            }
        })

        let AllPostsWithDetails = await Promise.allSettled(allChatPosts.map(async item =>{
            const chatFile = await prisma.chat_file.findMany({
                where: {
                        user_user_id : item.user_user_id,
                        chatpost_chatpost_id: item.chatpost_id
                }
            })

            const likes = await prisma.chat_detail.count({
                where: {
                    chat_detail_like: {
                        not : {
                            equals : null
                        }
                    },
                    chatpost_chatpost_id: item.chatpost_id,
                },
                orderBy: {
                    chat_detail_created_at: "desc"
                },
            })
            
            const comments = await prisma.chat_detail.count({
                where: {
                    chat_detail_comment: {
                        not : {
                            equals : null
                        }
                    },
                    chatpost_chatpost_id: item.chatpost_id,
                },
                orderBy: {
                    chat_detail_created_at: "desc"
                },
            })
            
            return {
                chatPost : item,
                chatFiles: chatFile || null,
                likes: likes || 0,
                comments: comments ,
            }
        }))
        
        if(AllPostsWithDetails.length < 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "GetAllPost : No Post Found"
            ))
        }

        AllPostsWithDetails = AllPostsWithDetails.map(item => item.value)
        
        const AllPostsWithDetailsChunks = _.chunk(AllPostsWithDetails, 50);
        const totalChunks = AllPostsWithDetailsChunks.length;

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "GetAllPost : Posts Found",
            {
                Posts : AllPostsWithDetailsChunks[currentNum] || [] ,
                MaxChunkIndex : totalChunks - 1,
            },
        ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodaysFoodPlan : Something went wrong")
    }
})

// API : to add new post
export const addPost = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const value = await addChatPostValidator(req.body, res, "AddPost");

        
        const {
            UserText,
        } = value;
        
        const currentPost = await prisma.chatpost.create({
            data: {
                user_user_id: user_id,
                chatpost_text: UserText,
                chatpost_category : "chat",
                chatpost_created_at: new Date(now())
            }
        })

        await Promise.allSettled( req.files?.map(async item =>{
            
            if(item)
            {
              let ChatFile = await prisma.chat_file.create({
                    data:{
                        chat_file_name: "/uploads/" + item.filename,
                        user_user_id: user_id,
                        chatpost_chatpost_id: currentPost.chatpost_id,
                        chat_file_created_at : new Date(now())
                    }
                })
                return ChatFile
            }
        }))

      
        
      

        if(!currentPost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddPost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddPost : Success",
                currentPost,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddPost : Something went wrong")
    }
})

// API : Update Post
export const updatePost = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const value = await UpdateChatPostValidator(req.body, res, "UpdatePost");

        const {
            FileName,
            UserText,
            ChatId,
        } = value;

        const chatPost = await prisma.chatpost.findFirst({
            where: {
                chatpost_id: parseFloat(ChatId),
                user_user_id: user_id,
            }
        })

        if(!chatPost)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "UpdatePost : Record Not Found"
            ))
        }

        
        const currentPost = await prisma.chatpost.update({
            where:{
                chatpost_id : chatPost.chatpost_id,
                user_user_id: user_id,
            },
            data: {
                
                chatpost_text: UserText,
                chatpost_modified_at: new Date(now())
            }
        })

        // await Promise.allSettled( req.files?.map(async item =>{
            
        //     if(item)
        //     {
        //        await prisma.chat_file.create({
        //             data:{
        //                 chat_file_name: "/uploads/" + item.filename,
        //                 user_user_id: user_id,
        //                 chatpost_chatpost_id: chatPost.chatpost_id,
        //                 chat_file_created_at : new Date(now())
        //             }
        //         })
        //     }
        // }))


       
        if(!currentPost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "UpdatePost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "UpdatePost : Success",
                currentPost,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UpdatePost : Something went wrong")
    }
})

// API : Delete Post
export const deletePost = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { chatId } = req.params;

        const chatPost = await prisma.chatpost.findFirst({
            where:{
                chatpost_id : parseFloat(chatId),
                user_user_id: user_id,
            }
        })

        if(!chatPost)
        {
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "DeletePost : Record not found"
            ))
        }

        const currentChatPost = await prisma.chatpost.update({
            data:{
                chatpost_deleted_at : new Date(now())
            },
            where:{
                chatpost_id : chatPost.chatpost_id
            }
        })

        if(currentChatPost.DeletedAt === null)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "DeletePost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "DeletePost : Success",
                currentChatPost
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "DeletePost : Something went wrong")
    }
})

// API : add like and Comment
export const addLikeComment = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const value = await addLikeCommentValidator(req.body, res, "addLikeComment");

        const {
            UserLike,
            UserComment,
            ChatId,
        } = value;

        
        if(UserLike)
        {
           return await likeChatPost(res, value, user_id)
        }

        

        const currentPost = await prisma.chat_detail.create({
            data: {
                user_user_id: user_id,
                chat_detail_comment: UserComment || null,
                
                chatpost_chatpost_id: parseInt(ChatId),
                chat_detail_created_at: new Date(now())
            }
        })

        if(!currentPost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddPost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddLikeComment : Success",
                currentPost,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddLikeComment : Something went wrong")
    }
})

// Function to Like A Chatpost 
const likeChatPost = async (res, value, userId)=>{
    try
    {
        const currentPostDetail = await prisma.chat_detail.findFirst({
            where: {
                user_user_id: userId,
                chatpost_chatpost_id: parseInt(value.ChatId),
                chat_detail_comment : {
                    equals: null
                },
            },
            orderBy:{
                chat_detail_created_at:"desc"
            }
        })

        let like = false
        if(parseInt(value.UserLike) === 1 && !currentPostDetail?.chat_detail_like)
        {
            like = true
        }

        const currentPost = await prisma.chat_detail.upsert({
            create: {
                user_user_id: userId,
                chat_detail_like : like || null,
                chatpost_chatpost_id: parseInt(value.ChatId),
                chat_detail_created_at: new Date(now())
            },
            update:{
                chat_detail_like : like || null,
                chat_detail_modified_at: new Date(now())
            },
            where:{
                chat_detail_id: currentPostDetail?.chat_detail_id || 0,
                user_user_id: userId,
                chatpost_chatpost_id: parseInt(value.ChatId),
            }
        })

        if(!currentPost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddLikeComment : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddLikeComment : Success",
                currentPost,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "LikeChatPost : Something went wrong")
    }
}





// API : get comments on posts
export const getComments = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { chatId } = req.params;

        const currentPosts = await prisma.chat_detail.findMany({
            where: {
                user_user_id: user_id,
                chatpost_chatpost_id: parseFloat(chatId),
                chat_detail_comment: {
                    not: {
                        equals: null
                    }
                },
                chat_detail_deleted_at: {
                    equals: null
                }

            }
        })

        if(!currentPosts)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetComments : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetComments : Success",
                currentPosts,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetSavePost : Something went wrong")
    }
})

// API : get comments on posts
export const deleteComment = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { chatDetailId } = req.params;

        const currentPosts = await prisma.chat_detail.update({
            where: {
                user_user_id: user_id,
                chat_detail_id: parseFloat(chatDetailId),
                chat_detail_comment: {
                    not: {
                        equals: null
                    }
                }
            },
            data: {
                chat_detail_deleted_at: new Date(now())
            }
            
        })

        if(!currentPosts)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetComments : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetComments : Success",
                currentPosts,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetSavePost : Something went wrong")
    }
})


// API : add Post to Save
export const addSavePost = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { chatId } = req.params;

        const currentPost = await prisma.chatsave.create({
            data: {
                user_user_id: user_id,
                chatpost_chatpost_id: chatId,
                chatpost_is_saved: 1,
                chatpost_created_at: new Date(now())
            }
        })

        if(!currentPost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "AddSavePost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "AddSavePost : Success",
                currentPost,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddSavePost : Something went wrong")
    }
})

// API : get save posts
export const getSavePosts = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;

        const currentPosts = await prisma.chatsave.findMany({
            where: {
                user_user_id: user_id,
                chatpost_is_saved: 1,
            }
        })

        if(!currentPosts)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "GetSavePost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "GetSavePost : Success",
                currentPosts,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetSavePost : Something went wrong")
    }
})

// API : delete save post
export const deleteSavePost = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user;
        const { chatId } = req.params;

        const chatSavePost = await prisma.chatsave.findFirst({
            where:{
                user_user_id: user_id,
                chatpost_chatpost_id: parseFloat(chatId),
                chatpost_is_saved: 1
            }
        })

        if(!chatSavePost)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "DeleteSavePost : ChatSavePost not found"
            ))
        }

        const currentPosts = await prisma.chatsave.update({
            where: {
                chatsave_id_chatpost_chatpost_id_user_user_id: {
                    user_user_id: user_id,
                    chatpost_chatpost_id: parseFloat(chatId),
                    chatsave_id: chatSavePost?.chatsave_id ,

                },
                chatpost_is_saved: 1,

            },
            data:{
                chatpost_is_saved: 0,
            }
        })

        if(!currentPosts)
        {
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                "DeleteSavePost : Failed"
            ))
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "DeleteSavePost : Success",
                currentPosts,
            ))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetSavePost : Something went wrong")
    }
})









