import { USER_ROLES } from "../../../enums/user";
import { Order, OrderItem } from "../order/order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";

const getAdminDashboardData = async (query: Record<string, any>) => {
  const totalProducts = await Product.countDocuments({ status: "Active" });
  const totalUsers = await User.countDocuments({ verified: true });
  const totalEarnings = (
    await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$app_fee" },
        },
      },
    ])
  ).reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = await Order.countDocuments({ paymentStatus: "paid" });
  const totalSolds = await Order.countDocuments({
    paymentStatus: "paid",
    status: "Delivered",
  });
  const yearStart = new Date(
    query.userYear || new Date().getFullYear().toString()
  );
  const yearEnd = new Date((yearStart.getFullYear() + 1).toString());

  const sellerStartYear = new Date(
    query.sellerYear || new Date().getFullYear().toString()
  );
  const sellerEndYear = new Date(
    (sellerStartYear.getFullYear() + 1).toString()
  );

  const totalUsersAndShops = await User.aggregate([
    {
      $match: {
        verified: true,
        createdAt: {
          $gte: yearStart,
          $lt: yearEnd,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        data: {
          $push: {
            role: "$role",
          },
        },
      },
    },
    {
      $unwind: "$data",
    },
    {
      $group: {
        _id: "$_id",
        total: {
          $sum: 1,
        },
        customers: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$data.role", USER_ROLES.CUSTOMER],
              },
              then: 1,
              else: 0,
            },
          },
        },
        shops: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$data.role", USER_ROLES.SHOP],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  const totalSell = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: {
          $gte: sellerStartYear,
          $lt: sellerEndYear,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: "$price" },
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

  const totalUsersAndShopsDay = [];
  const totalSellbyMonth = [];

  for (let i = 1; i <= 12; i++) {
    const totalUsersAndShopsMonth = totalUsersAndShops.find(
      (item) => item._id === i
    );
    const totalSellMonth = totalSell.find((item) => item._id === i);
    totalUsersAndShopsDay.push({
      month: months[i as keyof typeof months],
      total: totalUsersAndShopsMonth?.total || 0,
      customers: totalUsersAndShopsMonth?.customers || 0,
      shops: totalUsersAndShopsMonth?.shops || 0,
    });
    totalSellbyMonth.push({
      month: months[i as keyof typeof months],
      total: totalSellMonth?.total || 0,
    });
  }

  return {
    summury: {
      totalProducts,
      totalUsers,
      totalEarnings,
      totalOrders,
      totalSolds,
    },
    totalUsersAndShopsDay,
    totalSellbyMonth,
  };
};

const shopperAnalytics = async (query: Record<string, any>) => {
  const yearStart = new Date(
    query.userYear || new Date().getFullYear().toString()
  );
  const yearEnd = new Date((yearStart.getFullYear() + 1).toString());
  const totalUsersAndShops = await User.aggregate([
    {
      $match: {
        verified: true,
        createdAt: {
          $gte: yearStart,
          $lt: yearEnd,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        data: {
          $push: {
            role: "$role",
          },
        },
      },
    },
    {
      $unwind: "$data",
    },
    {
      $group: {
        _id: "$_id",
        total: {
          $sum: 1,
        },
        customers: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$data.role", USER_ROLES.CUSTOMER],
              },
              then: 1,
              else: 0,
            },
          },
        },
        shops: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$data.role", USER_ROLES.SHOP],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  const currentMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const currentMonthEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  );

  const shopOrdersItem = await OrderItem.aggregate([
    {
        $match:{
            createdAt:{
                $gte:currentMonthStart,
                $lte:currentMonthEnd
            }
        }
    },
    {
        $group:{
            _id:"$shop",
            totalPrice:{
                $sum:{
                    $multiply:[
                        "$quantity",
                        "$price"
                    ]
                }
            }
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"_id",
            foreignField:"_id",
            as:"shop",
            pipeline:[
                {
                    $project:{
                        _id:1,
                        name:1,
                        role:1,
                        email:1,
                        profile:1
                    }
                }
            ]
        }
    },
    {
        $addFields:{
            shop:{$arrayElemAt:["$shop",0]}
        }
    },
    {
        $sort:{
            totalPrice:-1
        }
    }
  ])
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

  const totalUsersAndShopsDay = [];

  for (let i = 1; i <= 12; i++) {
    const totalUsersAndShopsMonth = totalUsersAndShops.find(
      (item) => item._id === i
    );
    totalUsersAndShopsDay.push({
      month: months[i as keyof typeof months],
      total: totalUsersAndShopsMonth?.total || 0,
      customers: totalUsersAndShopsMonth?.customers || 0,
      shops: totalUsersAndShopsMonth?.shops || 0,
    });
  }

  const perSentage = shopOrdersItem.map((item)=>{
    return {
        shop:item.shop,
        totalEarnings:item.totalPrice,
        percentage:(item.totalPrice/10000)*100
    }
  })


  const weekStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 7
  );
  const weekEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const totalSells = await OrderItem.aggregate([
    {
        $match:{
            createdAt:{
                $gte:weekStart,
                $lte:weekEnd
            }
        }
    },
    {
        $group:{
            _id:"$shop",
            totalPrice:{
                $sum:{
                    $multiply:[
                        "$quantity",
                        "$price"
                    ]
                }
            }
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"_id",
            foreignField:"_id",
            as:"shop",
            pipeline:[
                {
                    $project:{
                        _id:1,
                        name:1,
                        role:1,
                        email:1,
                        profile:1
                    }
                }
            ]
        }
    },
    {
        $addFields:{
            shop:{$arrayElemAt:["$shop",0]}
        }
    },
    {
        $sort:{
            totalPrice:-1
        }
    }
  ])

  const totaEarnings = totalSells.reduce((acc,item)=>acc+item.totalPrice,0)
  const totalOrders = totalSells.length
  const revenuePercentage = (totaEarnings/(10000*totalOrders))*100
  const pendingReveneue = 100-revenuePercentage

  return {
    totalUsersAndShops:totalUsersAndShopsDay,
    topResellers:perSentage,
    totalEarnings:{
        revenuePercentage,
        pendingReveneue,
    }
  };
};

export const DashboardService = {
  getAdminDashboardData,
  shopperAnalytics,
};
