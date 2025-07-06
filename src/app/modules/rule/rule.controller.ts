import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RuleService } from './rule.service';


//privacy policy
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const { ...privacyData } = req.body
    const result = await RuleService.createPrivacyPolicyToDB(privacyData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy created successfully',
        data: result
    })
})

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.getPrivacyPolicyFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy retrieved successfully',
        data: result
    })
})


//terms and conditions
const createTermsAndCondition = catchAsync( async (req: Request, res: Response) => {
    const { ...termsData } = req.body
    const result = await RuleService.createTermsAndConditionToDB(termsData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions created successfully',
        data: result
    })
})
  
const getTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.getTermsAndConditionFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions retrieved successfully',
        data: result
    })
})

//about
const createAbout = catchAsync(async (req: Request, res: Response) => {
    const { ...aboutData } = req.body
    const result = await RuleService.createAboutToDB(aboutData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About created successfully',
        data: result
    })
})
  
const getAbout = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.getAboutFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About retrieved successfully',
        data: result
    })
});


const createCookie = catchAsync(async (req: Request, res: Response) => {
    const { ...aboutData } = req.body
    const result = await RuleService.createCookiesToDB(aboutData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cookie Policy created successfully',
        data: result
    })
})
  
const retrievedCookie = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.getCookieFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cookie Policy retrieved successfully',
        data: result
    })
})


const createRefundPolicy = catchAsync(async (req: Request, res: Response) => {
    const { ...aboutData } = req.body
    const result = await RuleService.createRefundPolicyToDB(aboutData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Refund Policy created successfully',
        data: result
    })
})
  
const retrievedRefundPolicy = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.getRefundPolicyFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Refund Policy retrieved successfully',
        data: result
    })
})

export const RuleController = {
    createPrivacyPolicy,
    getPrivacyPolicy,
    createTermsAndCondition,
    getTermsAndCondition,
    createAbout,
    getAbout,
    createCookie,
    retrievedCookie,
    createRefundPolicy,
    retrievedRefundPolicy
}  