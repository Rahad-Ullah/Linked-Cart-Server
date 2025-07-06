import { JwtPayload } from "jsonwebtoken";
import { IOrder } from "./order.interface";
import { REQUEST_URI_TOO_LONG, StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import mongoose from "mongoose";
import { Order, OrderItem, OrderSession } from "./order.model";

import { checkMongooseIDValidation } from "../../../shared/checkMongooseIDValidation";
import stripe from "../../../config/stripe";
import { Product } from "../product/product.model";
import { IProduct } from "../product/product.interface";
import { User } from "../user/user.model";
import { Cart } from "../cart/cart.model";
import QueryBuilder from "../../builder/queryBuilder";
import { ORDER_STATUS } from "../../../enums/order";
import {
  calculateDistance,
  calculateDistanceInKm,
  getLatLongFromAddress,
} from "../../../helpers/distanceCalculator";
import { sendLocation } from "../../../helpers/locationHelper";
import { Review } from "../review/review.model";
import { Wallet } from "../wallet/wallet.model";
import { WalletService } from "../wallet/wallet.service";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { USER_ROLES } from "../../../enums/user";

const createOrderToDB = async (payload: IOrder) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(payload.user).session(session);
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid User");
    }

    const cartData: any = await Cart.find({ user: payload.user })
      .populate("product")
      .session(session);

    if (!cartData || cartData.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");
    }
    payload.price = cartData.reduce((total: any, cartItem: any) => {
      const product: IProduct = cartItem.product;
      return (
        total +
        (product.price - (product.price * (product.discount || 0)) / 100) *
          cartItem.quantity
      );
    }, 0);

    let isFirst = true;
    const appFee = payload.price * (10 / 100);

    const mapCartData = cartData.map((cartItem: any) => {
      const product = cartItem.product;

      const obj = {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.images,
          },
          unit_amount: Math.round(
            (Number(product.price) -
              (product.discount && product.discount > 0
                ? (product.discount / 100) * product.price
                : 0)) *
              100
          ),
        },
        quantity: cartItem.quantity,
      };
      isFirst = false;

      return obj;
    });

    const finalArray = [
      ...mapCartData,

      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "App Fee",
            images: [],
          },
          unit_amount: Math.round(appFee * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Charge",
            images: [],
          },
          unit_amount: Math.round(payload.delivery_charge * 100),
        },
        quantity: 1,
      },
    ];

    // Create order within session
    const createdOrder = await Order.create(
      [
        {
          ...payload,
          quantity: cartData?.length,
          app_fee: appFee,
        },
      ],
      { session }
    );
    if (!createdOrder || createdOrder.length === 0) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Order creation failed"
      );
    }
    // Create Stripe checkout session (outside Mongo transaction)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: finalArray,

      mode: "payment",
      success_url: `http://10.0.80.75:5000/order/success`,
      cancel_url: `http://10.0.80.75:5000/order/cancel`,
      customer_email: user.email,
      metadata: {
        orderId: createdOrder[0]._id.toString(),
      },
    });
    // Commit DB transaction first
    await session.commitTransaction();
    session.endSession();

    return checkoutSession.url;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      error instanceof Error ? error.message : "Order creation failed"
    );
  }
};

const retrievedOrdersFromDB = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const OrderQuery = new QueryBuilder(
    Order.find({ user: user.id, paymentStatus: "paid" }),
    query
  )
    .paginate()
    .sort();

  const [orders, paginationInfo] = await Promise.all([
    OrderQuery.modelQuery.lean().exec(),
    OrderQuery.getPaginationInfo(),
  ]);

  return {
    paginationInfo,
    orders,
  };
};

const orderDetailsToDB = async (id: string) => {
  checkMongooseIDValidation(id, "Order");
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  const orderItems = await OrderItem.aggregate([
    {
      $match: {
        order: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 0,
        product: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          quantity: 1,
        },
        price: 1,
        quantity: 1,
        shop: 1,
      },
    },
    {
      $addFields: {
        totalPrice: {
          $multiply: ["$quantity", "$price"],
        },
      },
    },
    {
      $addFields: {
        "product.price": "$price",
      },
    },
    {
      $addFields: {
        totalPrice: "$totalPrice",
      },
    },
    {
      $group: {
        _id: "$shop",
        orderItems: { $push: "$$ROOT" },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              contact: 1,
              address: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        shop: {
          $arrayElemAt: ["$_id", 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        shop: 1,
        orderItems: 1,
        totalPrice: 1,
      },
    },
  ]);

  const price = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const orderDetails = {
    status: order.status,
    price: price,
    address: order.address,
    deliveryCharge: order.delivery_charge,
    total: price + order.delivery_charge,
  };

  return {
    orderDetails,
    orderItems,
  };
};

const verifyOrderPayment = async (id: string, paymentIntent: string) => {
  try {
    const order = await Order.findById(id);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }

    if (order.paymentStatus === "paid") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Payment already verified");
    }

    const cartData: any = await Cart.find({ user: order.user })
      .populate("product")
      .lean()
      .exec();

    if (!cartData || cartData.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty");
    }
    const userData = await User.findById(order.user).lean().exec();

    for (const cartItem of cartData) {
      const product = cartItem.product;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -cartItem.quantity },
      });

      console.log(product);

      await OrderItem.create({
        order: order._id,
        product: product._id,
        quantity: cartItem.quantity,
        shop: product.shop,
        user: order.user,
        price: product.price - product.price * (product.discount / 100),
        discountPrice: product.discount,
      });

      await sendNotifications({
        text: `You get a order from ${userData?.name}`,
        receiver: product.shop,
        read: false,
        referenceId: order._id.toString(),
        screen: "RESERVATION",
      });
    }

    await Cart.deleteMany({ user: order.user });

    await Order.findByIdAndUpdate(id, {
      paymentStatus: "paid",
      paymentIntent: paymentIntent,
    });

    await sendNotifications({
      text: `Your order has been placed successfully.`,
      receiver: order.user,
      read: false,
      referenceId: order._id.toString(),
      screen: "RESERVATION",
    });

    const shppers = await User.find({ role: USER_ROLES.SHOPPER }).select("_id");
    for (const shopper of shppers) {
      const distance = await calculateDistance(
        shopper.latitude || 0,
        shopper.longitude || 0,
        order.address
      );
      if (distance! <= 100) {
        await sendNotifications({
          text: `You get a order from ${userData?.name}`,
          receiver: shopper._id,
          read: false,
          referenceId: order._id.toString(),
          screen: "RESERVATION",
        });
      }
      await sendLocation(
        shopper._id.toString(),
        await shopperFormatTask(order._id.toString())
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const retriveShopOrders = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const duration = query.durationType || "new";

  const fiveDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const dbQuery =
    duration === "new" ? { $gte: fiveDaysAgo } : { $lte: fiveDaysAgo };
  const limit = query.limit ? parseInt(query.limit as string) : 10;
  const page = query.page ? parseInt(query.page as string) : 1;
  const skip = (page - 1) * limit;
  const result = await OrderItem.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(user.id),
        createdAt: dbQuery,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              shop: 1,
              image: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$product",
    },
    {
      $group: {
        _id: "$order",
        items: { $push: "$$ROOT" },
      },
    },

    {
      $project: {
        _id: 0,
        orderId: "$_id",
        totalAmount: 1,
        order: 1,
        items: 1,
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "orderId",
        pipeline: [
          {
            $project: {
              _id: 1,
              user: 1,
              paymentStatus: 1,
              paymentIntent: 1,
              createdAt: 1,
              quantity: 1,
              price: 1,
              orderId: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        orderId: { $first: "$orderId" },
      },
    },
    {
      $sort: {
        "orderId.createdAt": -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return {
    orders: result,
    paginationInfo: {
      limit,
      page,
      totalPage: result.length,
      total: result.length,
    },
  };
};

const shopOverViewFromDb = async (user: JwtPayload) => {
  const onWayOrder = await Order.countDocuments({
    shop: user.id,
    status: {
      $in: ["OnWay", "processing"],
    },
  });

  const totaEarnings = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(user.id),
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$price" },
      },
    },
  ]);
  const totalEarnings = totaEarnings.length > 0 ? totaEarnings[0].total : 0;

  const totalProducts = await Product.countDocuments({
    shop: user.id,
    status: "active",
  });

  return {
    onWayOrder,
    totalEarnings,
    totalProducts,
  };
};

const shopOrderDetails = async (orderId: string, user: JwtPayload) => {
  const order: any = await Order.findById(orderId)
    .populate("user", "name contact address")
    .lean()
    .exec();
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  const products = await OrderItem.find(
    {
      order: orderId,
      shop: user.id,
    },
    { product: 1, createdAt: 1, quantity: 1 }
  ).populate(["product"], ["name", "productId"]);

  const userDetails = order.user;

  const paymentStatus = {
    price: order.price,
    delivery_charge: order.delivery_charge,
    tips: 0,
    status: order.status,
    quantity: order.quantity,
  };
  return {
    products,
    userDetails,
    paymentStatus,
    date: order.createdAt,
  };
};

const orderHistoryStatusFromDb = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  return order;
};

const analaticsFromDBForShop = async (user: JwtPayload) => {
  const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
  const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 0);

  const totalEarnings = await OrderItem.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(user.id),
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
  ]);

  const months = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  const totalOrders = await OrderItem.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(user.id),
        createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: 1 },
      },
    },
  ]);

  const totalRevinue = await OrderItem.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(user.id),
        createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
  ]);

  let totalRevinueData = [];
  let totalOrdersData = [];

  for (let i = 1; i <= 12; i++) {
    const month = months[i as keyof typeof months];
    const totalOrder = totalOrders.find((order) => order._id === i);
    const totalRevinues = totalRevinue.find((order: any) => order._id === i);
    totalOrdersData.push({
      month: month,
      total: totalOrder?.total || 0,
    });
    totalRevinueData.push({
      month: month,
      total: totalRevinues?.total || 0,
    });
  }
  return {
    totalEarnings: totalEarnings[0]?.total || 0,
    totalOrders: totalOrdersData,
    totalRevinue: totalRevinueData,
  };
};

const acceptOrderFromDb = async (
  orderId: string,
  user: JwtPayload,
  status: ORDER_STATUS
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  if (order.isBooked && status == ORDER_STATUS.CONFIRM) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is already booked");
  }

  if (order.status == status) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Order is already in this status"
    );
  }

  if (
    order.status == ORDER_STATUS.DELIVERED &&
    status != ORDER_STATUS.DELIVERED
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is already completed");
  }
  if (status == ORDER_STATUS.CONFIRM) {
    const shoper = await User.findById(user?.id);
    if (!shoper) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Shop not found");
    }

    const updateData = await Order.findByIdAndUpdate(orderId, {
      isBooked: true,
      shopper: shoper._id,
      status,
      history: [
        ...(order.history || []),
        {
          status,
          date: new Date(),
        },
      ],
    });

    const userData = await User.findById(order.user);

    const shoppers = await User.find({
      role: USER_ROLES.SHOPPER,
      latitude: { $ne: null },
    });
    const nearbyShoppers = shoppers.filter((shopper) => {
      const distance = calculateDistanceInKm(
        shopper.latitude!,
        shopper.longitude!,
        userData?.latitude!,
        userData?.longitude!
      );
      return distance <= 50;
    });
    for (const shopper of nearbyShoppers) {
      await sendLocation(
        shopper._id.toString(),
        await shopperFormatTask(order._id.toString())
      );
    }

    return updateData;
  }

  const updateData = await Order.findByIdAndUpdate(orderId, {
    status,
    history: [
      ...(order.history || []),
      {
        status,
        date: new Date(),
        user: user.id,
      },
    ],
  });
  return updateData;
};

const retriveShopOrdersForShopper = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const shopper = await User.findById(user.id);
  if (!shopper || !shopper.latitude) {
    return [];
  }

  const OrderQuery = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.PLACED,
      },
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "order",
        as: "items",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.order",
        total: { $sum: "$items.price" },
        orderId: { $first: "$items.order" },
        dropOffAddress: { $first: "$address" },
        user: { $first: "$user" },
        createdAt: { $first: "$createdAt" },
        shops: { $push: "$items.shop" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              address: 1,
              name: 1,
              profile: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
      },
    },
    {
      $unwind: "$shops",
    },
    {
      $lookup: {
        from: "users",
        localField: "shops",
        foreignField: "_id",
        as: "shops",
        pipeline: [
          {
            $project: {
              address: 1,
              name: 1,
              profile: 1,
            },
          },
        ],
      },
    },
    {
        $sort: {
            createdAt: -1,
        }
    }
  ]);

  // console.log(OrderQuery);
  const userData = await User.findById(user.id);

  const modifiedData = await Promise.all(
    OrderQuery.map(async (order: any) => {
      const userLatLang = await getLatLongFromAddress(order.dropOffAddress);
      const distance = calculateDistanceInKm(
        userData?.latitude!,
        userData?.longitude!,
        userLatLang.lat,
        userLatLang.long
      );
      const DbShops:any[] = [...new Set((await OrderItem.find({order: order.orderId}).populate('shop','name address profile').lean().exec()).map(item=>item.shop))]
    //   console.log(DbShops);
      
      let shops = [];
      for (let i = 0; i < DbShops.length; i++) {
        const shop = DbShops[i];
        const shopLatLang = await getLatLongFromAddress(shop?.address);
        shops.push({
          ...shop,
          latitude: shopLatLang.lat,
          longitude: shopLatLang.long,
        });
      }
      return {
        ...order,
        userLatLang,
        shop: shops,
        shops: [],
        distance: distance.toFixed(2)+"km",
      };
    })
  );

  // console.log(modifiedData);

  const closesetOrder = modifiedData.filter((order: any) => {
    const distance = calculateDistanceInKm(
      shopper.latitude!,
      shopper.longitude!,
      order.userLatLang.lat,
      order.userLatLang.long
    );
    return distance <= 200;
  });

  await sendLocation(shopper._id.toString(), closesetOrder);

  return modifiedData;
};

const shopperFormatTask = async (orderId: string) => {
  const OrderQuery = await Order.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(orderId),
      },
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "order",
        as: "items",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.order",
        total: { $sum: "$items.price" },
        orderId: { $first: "$items.order" },
        dropOffAddress: { $first: "$address" },
        user: { $first: "$user" },
        shops: { $push: "$items.shop" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              address: 1,
              name: 1,
              profile: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
      },
    },
    {
      $unwind: "$shops",
    },
    {
      $lookup: {
        from: "users",
        localField: "shops",
        foreignField: "_id",
        as: "shops",
        pipeline: [
          {
            $project: {
              address: 1,
              name: 1,
              profile: 1,
            },
          },
        ],
      },
    },
  ]);

  const order = OrderQuery[0];
  return {
    ...order,
    userLatLang: await getLatLongFromAddress(order.dropOffAddress),
    shop: await Promise.all(
      order.shops.map(async (shop: any) => {
        return {
          ...shop,
          latitude: await getLatLongFromAddress(shop.address).then(
            (res) => res.lat
          ),
          longitude: await getLatLongFromAddress(shop.address).then(
            (res) => res.long
          ),
        };
      })
    ),
  };
};

const ordersForShopper = async (user: JwtPayload) => {
  const OrderQuery = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.PLACED,
      },
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "order",
        as: "items",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.order",
        total: { $sum: "$items.price" },
        orderId: { $first: "$items.order" },
        dropOffAddress: { $first: "$address" },
        user: { $first: "$user" },
        shop: { $first: "$items.shop" },
      },
    },
  ]);
};

const shoperOrdersFromDb = async (
  user: JwtPayload,
  query: Record<string, any>
): Promise<any> => {
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const queryObj: Record<string, any> =
    query.status !== ORDER_STATUS.DELIVERED
      ? {
          shopper: new mongoose.Types.ObjectId(user.id),
          status: {
            $ne: ORDER_STATUS.DELIVERED,
          },
        }
      : {
          shopper: new mongoose.Types.ObjectId(user.id),
          status: ORDER_STATUS.DELIVERED,
        };

  const shopper = await User.findById(user.id);

  if (!shopper || !shopper.latitude) {
    return [];
  }

  const OrderQuery = await Order.aggregate([
    {
      $match: queryObj,
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "order",
        as: "items",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.shop",
        total: {
          $sum: {
            $multiply: ["$items.price", "$items.quantity"],
          },
        },
        orderId: { $first: "$_id" },
        dropOffAddress: { $first: "$address" },
        deliveryCharge: { $first: "$delivery_charge" },
        createdAt: { $first: "$createdAt" },
        user: { $first: "$user" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              address: 1,
              name: 1,
              profile: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "shop",
        pipeline: [
          {
            $project: {
              address: 1,
            },
          },
        ],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return {
    data: OrderQuery,
    meta: {
      page,
      limit,
      total: OrderQuery.length,
      totalPage: Math.ceil(OrderQuery.length / limit),
    },
  };
};

const getSingleTaskDetails = async (id: string): Promise<any> => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  const orderItems = await OrderItem.find({ order: id })
    .populate("shop")
    .lean();

  const shopAddress = orderItems.map((item: any) => item.shop.address);

  const review = await Review.findOne({ order: id })
    .populate("customer")
    .lean();

  return {
    pichupAddress: shopAddress || [],
    dropOffAddress: order.address || "",
    review: review?.rating || 0,
    priceDetails: {
      price: order.price,
      deliveryCharge: order.delivery_charge,
      total: order.price + order.delivery_charge,
      tips: review?.tips || 0,
    },
  };
};

const shopperDashboardFromDb = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const wallet = await Wallet.findOne({ user: user.id }).lean();
  const OrderQuery = new QueryBuilder(
    Order.find({ shopper: user.id, status: ORDER_STATUS.DELIVERED }),
    query
  )
    .paginate()
    .sort();
  const [orders, paginationInfo] = await Promise.all([
    OrderQuery.modelQuery.populate("user", "name").lean().exec(),
    OrderQuery.getPaginationInfo(),
  ]);

  return {
    wallet: wallet?.balance || 0,
    orders,
    paginationInfo,
  };
};

const getAllOrdersFromDb = async (query: Record<string, any>) => {
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const status = query.status ? { status: query.status } : {};

  const OrderQuery = await Order.aggregate([
    {
      $match: status,
    },
    {
      $facet: {
        data: [
          {
            $lookup: {
              from: "orderitems",
              localField: "_id",
              foreignField: "order",
              as: "items",
              pipeline: [
                {
                  $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                    pipeline: [
                      {
                        $project: {
                          image: 1,
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: {
                    product: {
                      $first: "$product",
                    },
                  },
                },
                {
                  $project: {
                    product: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    email: 1,
                    profile: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              user: { $first: "$user" },
            },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              price: 1,
              delivery_charge: 1,
              address: 1,
              createdAt: 1,
              items: 1,
              user: 1,
              quantity: 1,
              trxId: 1,
              app_fee: 1,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const data = OrderQuery[0].data;
  const totalCount = OrderQuery[0].totalCount[0]?.count || 0;

  const totalEarnings = (
    await Order.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$app_fee" },
        },
      },
    ])
  ).reduce((acc, item) => acc + item.totalEarnings, 0);

  const todayStartTime = new Date();
  todayStartTime.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayEarnings = (
    await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: todayStartTime,
            $lte: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$app_fee" },
        },
      },
    ])
  ).reduce((acc, item) => acc + item.totalEarnings, 0);

  return {
    earnings: {
      total: totalEarnings?.toFixed(2),
      today: todayEarnings,
    },
    data,
    meta: {
      page,
      limit,
      total: totalCount,
      totalPage: Math.ceil(totalCount / limit),
    },
  };
};

const liveSessionForShopper = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  const ExistorderSession = await OrderSession.findOne({ order: orderId });
  if (ExistorderSession) {
    return ExistorderSession;
  }
  const orderItems = await OrderItem.find({ order: orderId })
    .populate("shop")
    .lean();
  const shopAddress = orderItems.map((item: any) => ({
    name: item.shop.name,
    address: item.shop.address,
    shopId: item.shop._id,
  }));
  const langLatAddress = await Promise.all(
    shopAddress.map(async (address: any) => {
      const addressDetails = await getLatLongFromAddress(address.address);
      return {
        name: address.name,
        address: address.address,
        latitude: addressDetails.lat,
        longitude: addressDetails.long,
        shopId: address.shopId,
      };
    })
  );

  const latlongDropOff = await getLatLongFromAddress(order.address);

  const orderSession = await OrderSession.create({
    order: orderId,
    shops: langLatAddress,
    dropOffAddress: {
      latitude: latlongDropOff.lat,
      longitude: latlongDropOff.long,
      address: order.address,
    },
  });

  return orderSession;
};

export const OrderService = {
  createOrderToDB,
  retrievedOrdersFromDB,
  orderDetailsToDB,
  verifyOrderPayment,
  retriveShopOrders,
  shopOverViewFromDb,
  shopOrderDetails,
  orderHistoryStatusFromDb,
  analaticsFromDBForShop,
  acceptOrderFromDb,
  retriveShopOrdersForShopper,
  shoperOrdersFromDb,
  getSingleTaskDetails,
  shopperDashboardFromDb,
  getAllOrdersFromDb,
  liveSessionForShopper,
};
