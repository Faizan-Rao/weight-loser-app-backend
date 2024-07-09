import { prisma } from "../client/client.js";
import redisClient from "../client/redis-client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { todoValidator } from '../validator/object.schema.validator.js';
import _ from "lodash";
const { now } = _

// API : FOR ADDING SELFIE
export const addTodo = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = await todoValidator(req.body, res, "AddTodo")
        const { todoId , completed } = value

        const todo = await prisma.taskdairy.create({
            data : {
                user_user_id : user_id,
                todo_todo_id : parseInt(todoId),
                task_diary_is_completed : parseInt(completed),
                task_diary_created_at: new Date(now())
            }
        })

        const currentTask = await prisma.taskdairy.findFirst({
            where :{
                task_diary_id : todo.task_diary_id
            }
        })

        if(!currentTask)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "AddTodo : Todo Not Added"))
        }

        return res
        .status(200)
        .json(new ApiResponse(200, "AddTodo : Todo Added", currentTask))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "AddTodo : Something went wrong")
    }
})

//API : FOR FETCHING Seilfies
export const getTodos = asyncHandler(async (req, res)=>{
    try
    {
        const cachedValue = await redisClient.get(`wl:get-todos`)

        if(cachedValue)
        {
            return res
        .status(200)
        .json(new ApiResponse(200, "GetTodos : Success", JSON.parse(cachedValue)))
        }

        const currentTodos = await prisma.todo.findMany()

        if(!currentTodos)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetTodos : Not Found"))
        }

        await redisClient.set(`wl:get-todos`, JSON.stringify(currentTodos), "KEEPTTL"),
        await redisClient.expire(`wl:get-todos`, process.env.PROJECT_STATE === "production" ? 180 : 60)

        return res
        .status(200)
        .json(new ApiResponse(200, "GetTodos : Success", currentTodos))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetTodos : Something went wrong")
    }
})

// API : For Active Todos
export const activeTodos = asyncHandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
       
        
        const allTasks = await prisma.taskdairy.findMany({
            where : {
                user_user_id : user_id
            },
            orderBy:{
                task_diary_created_at: "desc"
            },
            include:{
                todo: true,
            }
        })
        console.log(allTasks)
        const diffDates = new Date(now()).toISOString().split("T")[0]

           
            let arr = allTasks.map (item => {
                
                    if(diffDates?.includes(item.task_diary_created_at.toISOString().split("T")[0]))
                    {
                        return  item 
                    }
                
                
            })
           
           
          
   
      
      
       if(arr.length <= 0)
       {
         return res
         .status(404)
         .json(new ApiResponse(
            404,
            "ActiveTodosReport : Not Found"
         ))
       }
        
       return res
         .status(200)
         .json(new ApiResponse(
            200,
            "ActiveTodosReport : Success",
            arr
         ))
        
    } catch (error) {
        throw new ApiError(500, "ActiveTodosReport: Error in Response");
    }
});

// API : For Updating Task Diary Status
export const updateTaskDiaryStatus = asyncHandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
       
        
        const allTasks = await prisma.taskdairy.findMany({
            where : {
                user_user_id : user_id
            },
            orderBy:{
                task_diary_created_at: "desc"
            },
            include:{
                todo: true,
            }
        })
        
        const diffDates = new Date(now()).toISOString().split("T")[0]

           
            let arr = allTasks.map (item => {
                
                    if(diffDates?.includes(item.task_diary_created_at.toISOString().split("T")[0]))
                    {
                        return  item 
                    }
                
                
            })
           
           
          
   
      
      
       if(arr.length <= 0)
       {
         return res
         .status(404)
         .json(new ApiResponse(
            404,
            "ActiveTodosReport : Not Found"
         ))
       }
        
       return res
         .status(200)
         .json(new ApiResponse(
            200,
            "ActiveTodosReport : Success",
            arr
         ))
        
    } catch (error) {
        throw new ApiError(500, "ActiveTodosReport: Error in Response");
    }
});