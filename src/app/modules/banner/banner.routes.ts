import express, { NextFunction, Response, Request } from 'express';
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { BannerController } from "./banner.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
const router = express.Router();

router.route('/')
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const image = getSingleFilePath(req.files, "image");
                req.body = {
                    image,
                    ...req.body
                }
                next();
            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Product Upload");
            }
        },
        BannerController.createBanner
    )
    .get(
         auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER, USER_ROLES.SHOP, USER_ROLES.SHOPPER),
        BannerController.getAllBanner
    );

router.route('/:id')
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const image = getSingleFilePath(req.files, "image");
                req.body = {
                    image,
                    ...req.body
                }
                next();
            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Product Upload");
            }
        },
        BannerController.updateBanner
    )
    .delete(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        BannerController.deleteBanner
    );


export const BannerRoutes = router;