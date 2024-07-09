import { prisma } from "../client/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { questionAnswerValidator } from "../validator/object.schema.validator.js";
import _ from "lodash"
const { now } = _
// API : to Get Initial Questions Data
export const getInitial = asyncHandler(async (req, res)=>{
    try
    {
        const questions = await prisma.questionaire.count();
        if(questions <= 0)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetInitialQuestion : Questions not found"))
        }
        const payload = {
            min : 1,
            max : questions,
            current : 1
        }
        return res
        .status(200)
        .json(new ApiResponse(200, "GetInitialQuestion : Questions found", payload))
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetInitial : Something went wrong")
    }
})

// API : to Get New Question
export const getQuestion = asyncHandler(async (req, res)=>{
    try
    {
        const { current, type } = req.params;
        const { user_id } = req.user
       
       let content = "string";
       if(type === 'cbt')
       {
         content = 'cbt'
       }

      
        const question = await prisma.questionaire.findFirst({
            where : {
                questionaire_order : parseInt(current),
                questionaire_type: content
            },
            include: {
                option:true
            }
        })
        const options = question.option
        
        
        if(!question)
        {
            return res
            .status(404)
            .json(new ApiResponse(404, "GetQuestion : Questions not found"))
        }

        
        const eats = await prisma.user_answer.findFirst({
            where : {
                user_user_id : user_id,
                questionaire_questionaire_id : 11
            },
            orderBy:{
                user_answer_created_at: "desc"
            }
        })
        
        let filteredOptions = null
        
        // For Option Filteration Based on Previous Answer
        if(parseInt(question.questionaire_question_code) === 12 && ['Non Vegetarian' , 'Vegetarian' , 'Pescetarian'].includes(eats.Answer))
        {
            const plans = await prisma.plan.findMany({
                where:{
                    category : {
                        category_name: eats.user_answer_answer
                    }
                }
            })
            
            
           
            
           
            filteredOptions = options.filter(
            (e) => e.option_title === plans[i].category.category_name)
           
        }

     

        if(type === "string" && (question.Order > 26 || question.Order < 1))
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "GetQuestion : Question bound error (Initial Qusetionaire)"))
        }

        if(type === "cbt" && (question.Order <= 26))
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "GetQuestion : Question bound error (CBT Questionaire)"))
        }

        if(filteredOptions)
        {
            question.option = filteredOptions;
        }

        
        return res
        .status(200)
        .json(new ApiResponse(200,
             "GetQuestion : Question found", question))

    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "GetQuestion : Something went wrong")
    }
})

// API : to POST user Answer to specific question
export const userAnswer = asyncHandler(async (req, res)=>{
    try
    {
        const { user_id } = req.user
        const value = await questionAnswerValidator(req.body, res, "UserAnswer");
        const { QId, Answer, QOrder, QCode, PageName } = value;
      
        const question = await prisma.questionaire.findFirst({
            where:{
                questionaire_question_code: QCode
            },
            include: {
                option: true
            }

        })

        // AnswerCBT Question 
        if(question.Type === "cbt")
        {
            let status = "false"
            let options = question.option;
            const answer = question.questionaire_right_answer
            
            if(answer === Answer)
            {
                status = "right";
            }

            const currentAnswer = await prisma.user_answer.create({
                data:{
                    user_user_id : user_id,
                    questionaire_questionaire_id : QId,
                    user_answer_answer : Answer,
                    user_answer_question_code : QCode,
                    user_answer_created_at : new Date(now())
                },
            })

            if(!currentAnswer)
            {
                return res
                .status(401)
                .json(new ApiResponse(401, "UserAnswer : Answer not submitted"))
            }

            return res
            .status(200)
            .json(new ApiResponse(
                200,
                "UserAnswer : Answer Submitted",
                {
                    correctOption : question.questionaire_right_answer,
                    explanation : question.questionaire_explanation,
                    status,
                }
            ))


        }
        const currentAnswer = await prisma.user_answer.create({
            data:{
                user_user_id : user_id,
                questionaire_questionaire_id : QId,
                user_answer_answer : Answer,
                user_answer_question_code: QCode,
                user_answer_created_at : new Date(now())
            },
        })

        if(!currentAnswer)
        {
            return res
            .status(401)
            .json(new ApiResponse(401, "UserAnswer : Answer not submitted"))
        }

        // For Food Plan Activation
        const eats = await prisma.user_answer.findFirst({
            where : {
                user_user_id : user_id,
                user_answer_question_code : 11
            }
        })

        if(parseInt(QCode) === 12 && (!eats.user_answer_answer.includes("I eat all")))
        {
           
            
            const plan = await prisma.plan.findFirst({
                where : {
                   
                plan_title : JSON.parse(currentAnswer.user_answer_answer)[0]
                    
                    

                }
            })
            
            const currentActivePlan = await prisma.activeplan.create({
                data: {
                    user_user_id : currentAnswer.user_user_id,
                    plan_plan_id : plan.plan_id,
                    activeplan_type : 'diet',
                    activeplan_is_active : 1,
                    activeplan_days : parseInt(plan.plan_duration),
                    activeplan_created_at: new Date(now())
                }
            })
        }
       
        // For Exercise Plan Activation
        if(parseInt(QCode) === 18 && currentAnswer.user_answer_answer.includes('[' && ']') )
        {
            const parsedExercise = JSON.parse(currentAnswer.user_answer_answer)
    
            const isBackPainValid = ["Bending", "Lower Body", "Back Muscles"]
            .every(e => {
                for(let i = 0; i < parsedExercise.length; i++)
                {
                    if(e === parsedExercise[i])
                    {
                        return true
                    }
                }
            })
            
            if(isBackPainValid)
            {
                const backPlan = await prisma.plan.findFirst({
                    where:{
                        plan_title : "BackPain"
                    }
                })

                await prisma.history.create({
                    data:{
                        user_user_id : user_id,
                        history_type: 'exercise',
                        plan_plan_id: backPlan.plan_id,
                        history_created_at : new Date(now())
                    }
                })
                await prisma.activeplan.create({
                    data:{
                        user_user_id : user_id,
                        activeplan_type : 'exercise',
                        plan_plan_id: backPlan.plan_id,
                        activeplan_is_active: 1,
                        activeplan_days : parseInt(backPlan.plan_duration),
                        activeplan_created_at:  new Date(now())
                    }
                })
            }
            else
            {
                const beginnerPlan = await prisma.plan.findFirst({
                    where:{
                        plan_title : "Beginners"
                    }
                })

                await prisma.history.create({
                    data:{
                        user_user_id : user_id,
                        history_type : 'exercise',
                        plan_plan_id: beginnerPlan.plan_id,
                    }
                })

                await prisma.activeplan.create({
                    data:{
                        user_user_id : user_id,
                        activeplan_type : 'exercise',
                        plan_plan_id: beginnerPlan.plan_id,
                        activeplan_is_active: 1,
                        activeplan_days : parseInt(beginnerPlan.plan_duration)
                    }
                })
            }
        }

        let answer = await prisma.user_answer.findFirst({
            where:{
                user_answer_id: currentAnswer?.user_answer_id
            }
        })

        const recentHistory = await prisma.user_page_history.findFirst({
            where:{
                user_user_Id : user_id
            }
        })

        await prisma.user_page_history.update({
            data:{
                page_history_question_order : `${QOrder}`,
                page_history_name : PageName,
                page_history_modified_at: new Date(now())
            },
             where:{
                user_user_Id: user_id,
                page_history_id: recentHistory.page_history_id
             }
        })
       
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
           `UserAnswer : Answer submitted`,
             answer)) 
    }
    catch(error)
    {
        throw new ApiError(403, error?.message || "UserAnswer : Something went wrong")
    }
})
