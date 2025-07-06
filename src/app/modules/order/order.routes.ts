import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { OrderController } from "./order.controller";
import validateRequest from "../../middlewares/validateRequest";
import { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { changeOrderStatusZodSchema, orderZodValidationSchema } from "./order.validation";
const router = express.Router();

router.route("/")
    .post(
        auth(USER_ROLES.CUSTOMER),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { quantity, delivery_charge, ...otherPayload } = req.body;
                const txid = 'TRX' + crypto.randomBytes(6).toString('hex');
                req.body = {
                    ...otherPayload,
                    user: (req.user as JwtPayload).id,
                    txid,
                    quantity: Number(quantity),
                    delivery_charge: Number(delivery_charge),
                };
                next();

            } catch (error) {
                res.status(500).json({ message: "Failed to Make Order" });
            }
        },
        validateRequest(orderZodValidationSchema),
        OrderController.createOrder
    )
    .get(
        auth(USER_ROLES.CUSTOMER),
        OrderController.retrievedOrders
    );
router.get('/admin-orders',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),OrderController.getAllOrderForAdmin);
router.get("/shop-orders",auth(),OrderController.retriveShopOrders);

router.get('/shop-overview',auth(),OrderController.shopOrdersOverView);

router.get("/shop-order-details/:id",auth(USER_ROLES.SHOP),OrderController.shopOrderDetails);

router.get("/order-history-status/:id",auth(),OrderController.orderStatusHistory);

router.get('/shop-order-analtics',auth(USER_ROLES.SHOP),OrderController.shopOrderAnalaysis);

router.get("/orders-for-shopper",auth(USER_ROLES.SHOPPER),OrderController.getOrdersForShopper);
router.get('/live-session/:id',auth(USER_ROLES.SHOPPER),OrderController.liveSessionForShopper);
router.patch("/order-status/:id",validateRequest(changeOrderStatusZodSchema),auth(USER_ROLES.SHOPPER),OrderController.changeOrderStatus);
router.get('/task-order',auth(USER_ROLES.SHOPPER),OrderController.getOrdersOfDriver);
router.get('/shopper-dashboard',auth(USER_ROLES.SHOPPER),OrderController.shopperDashboardDetails);
router.get("/task-order/:id",auth(USER_ROLES.SHOPPER),OrderController.getSingleTaskDetails);
router.route("/:id")
    .get(
        auth(USER_ROLES.CUSTOMER),
        OrderController.retrievedOrderDetails
    );

export const OrderRoutes = router;