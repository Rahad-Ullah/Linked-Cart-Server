import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ReviewController } from "./review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { reviewZodValidationSchema } from "./review.validation";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
const router = express.Router();

router.post("/",
    auth(USER_ROLES.CUSTOMER),

    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { rating, ...othersData } = req.body;

            req.body = { ...othersData, customer: req.user.id, rating: Number(rating) };
            next();

        } catch (error) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Review");
        }
    },
    validateRequest(reviewZodValidationSchema),
    ReviewController.createReview
);


export const ReviewRoutes = router;