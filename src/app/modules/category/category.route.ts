import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { CategoryController } from './category.controller'
import { CategoryValidation } from './category.validation'
import fileUploadHandler from '../../middlewares/fileUploaderHandler'
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
const router = express.Router()

router.route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
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
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Category Upload");
      }
    },
    validateRequest(CategoryValidation.createCategoryZodSchema),
    CategoryController.createCategory,
  )
  .get(
    auth(),
    CategoryController.getCategories,
  )

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
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
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Category Update");
      }
    },
    CategoryController.updateCategory,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    CategoryController.deleteCategory,
  )

router.get('/',
  auth(),
  CategoryController.getCategories,
)

export const CategoryRoutes = router