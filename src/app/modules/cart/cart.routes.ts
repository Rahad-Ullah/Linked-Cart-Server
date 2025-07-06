import express from 'express';
import { CartController } from './cart.controller';
import { CartValidation } from './cart.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.route('/')
    .post(
        auth(USER_ROLES.CUSTOMER),
        validateRequest(CartValidation.createCartZidValidation),
        CartController.makeCart
    )
    .get(
        auth(USER_ROLES.CUSTOMER),
        CartController.getCart
    )
    .patch(
        auth(USER_ROLES.CUSTOMER),
        validateRequest(CartValidation.decreaseCartQuantityZidValidation),
        CartController.decreaseCartQuantity
    )
    .put(
        auth(USER_ROLES.CUSTOMER),
        validateRequest(CartValidation.increaseCartQuantityZidValidation),
        CartController.increaseCartQuantity
    )

router.route('/:id')
    .delete(
        auth(USER_ROLES.CUSTOMER),
        CartController.deleteCart
    )
    


export const CartRoutes = router;
