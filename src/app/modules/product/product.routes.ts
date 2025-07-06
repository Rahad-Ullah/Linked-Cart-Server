import express, { NextFunction, Response, Request } from 'express';
import { ProductController } from './product.controller';
import { ProductZodValidationSchema } from './product.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.route("/")
    .post(
        auth(USER_ROLES.SHOP),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { price, discount, quantity, ...othersPayload } = req.body;
                const image = getSingleFilePath(req.files, "image");
                req.body = {
                    shop: req.user.id,
                    price: Number(price),
                    discount: discount ? Number(discount) : undefined,
                    quantity: quantity ? Number(quantity) : 0,
                    image,
                    ...othersPayload
                }
                next();
            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Product Upload");
            }
        },
        validateRequest(ProductZodValidationSchema),
        ProductController.createProduct
    )
    .get(
        auth(USER_ROLES.CUSTOMER),
        ProductController.retrievedProducts
    );

router.get("/shop",
    auth(USER_ROLES.SHOP),
    ProductController.retrievedShopProducts
)

router.route("/:id")
    .get(
        ProductController.retrievedProductDetails
    )
    .patch(
        auth(USER_ROLES.SHOP),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { price, discount, quantity, ...othersPayload } = req.body;
                const image = getSingleFilePath(req.files, "image");

                req.body = {
                    price: Number(price),
                    discount: discount ? Number(discount) : undefined,
                    quantity: quantity ? Number(quantity) : 0,
                    image,
                    ...othersPayload
                }

                next();
            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Product Update");
            }
        },
        ProductController.updateProduct
    )
    .delete(
        auth(USER_ROLES.SHOP),
        ProductController.deleteProduct
    );


export const ProductRoutes = router;