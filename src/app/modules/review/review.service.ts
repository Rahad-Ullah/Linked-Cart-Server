import mongoose from "mongoose";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Order, OrderItem, OrderSession } from "../order/order.model";
import { ORDER_STATUS } from "../../../enums/order";
import { WalletService } from "../wallet/wallet.service";
import crypto from "crypto";
import stripe from "../../../config/stripe";
import { IShop } from "../user/user.interface";
import { Wallet } from "../wallet/wallet.model";

const createReviewToDB = async (
  payload: IReview
): Promise<IReview | boolean> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await Order.findById(payload.order);
    if (!order) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
    }

    if (
      [
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.PEAKED,
        ORDER_STATUS.CONFIRM,
      ].includes(order.status)
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Order is already completed or cancelled"
      );
    }
    const trxId = "TRX" + crypto.randomBytes(5).toString("hex").toUpperCase();
    await Order.findByIdAndUpdate(payload.order, {
      status: ORDER_STATUS.DELIVERED,
      trxId: trxId,
      history: [
        ...(order.history || []),
        {
          status: ORDER_STATUS.DELIVERED,
          date: new Date(),
        },
      ],
    }).session(session);
    const review = await Review.create({
      ...payload,
      customer: order.user,
      order: order._id,
      shopper: order.shopper,
    });
    await Wallet.updateOne(
      { user: order.shopper },
      { $inc: { balance: order.delivery_charge + (review.tips || 10) } },
      { session: session }
    );
    const products: {
      _id: mongoose.Types.ObjectId;
      totalQuantity: number;
      totalPrice: number;
      shop: IShop;
    }[] = await OrderItem.aggregate([
      {
        $match: {
          order: order._id,
        },
      },
      {
        $group: {
          _id: "$shop",
          totalQuantity: { $sum: "$quantity" },
          totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      {
        $unwind: "$_id",
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "shop",
        },
      },
      {
        $addFields: {
          shop: { $arrayElemAt: ["$shop", 0] },
        },
      },
    ]);

    for (const product of products) {
      if (product.shop.accountInformation?.stripeAccountId) {
        await stripe.transfers.create({
          amount: product.totalPrice * 100,
          currency: "usd",
          destination: product.shop.accountInformation?.stripeAccountId!,
          transfer_group: trxId,
        });
      }
    }

    await OrderSession.deleteOne({ order: order._id });

    await session.commitTransaction();
    await session.endSession();
    return review;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
  }
};

export const ReviewService = { createReviewToDB };
