const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const storeModel = require("../models/store.model");
const { convertToObjectId, daysOfMonth } = require("../utils");

class StatisticService {
  static async getRevenueOfStore(user_id, store_id) {
    const store = await storeModel.findById(store_id);
    if (!store) {
      throw new BadRequestError(`Store with ${store_id} is not found!`);
    }

    // if (store.user_id !== user_id) {
    //   throw new BadRequestError("You are not authorized to view this data");
    // }

    const orders = await orderModel.aggregate([
      {
        $match: {
          store: convertToObjectId(store_id),
          status: { $in: ["delivered", "rated"] },
        },
      },
      {
        $group: {
          _id: "$store",
          numberOfSuccessfulOrders: { $sum: 1 },
          revenue: { $sum: "$checkout.total" },
        },
      },
      {
        $lookup: {
          from: "Stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $unwind: "$store",
      },
    ]);
    return orders;
  }

  static async getRevenueOfStoreByYear(user_id, store_id, year) {
    const store = await storeModel.findById(store_id);
    if (!store) {
      throw new BadRequestError(`Store with ${store_id} is not found!`);
    }

    // if (store.user_id !== user_id) {
    //   throw new BadRequestError("You are not authorized to view this data");
    // }
    const orders = await orderModel.aggregate([
      {
        $match: {
          deliveredDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
          store: convertToObjectId(store_id),
        },
      },
    ]);
    const statistic = await orderModel.aggregate([
      {
        $match: {
          deliveredDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
          store: convertToObjectId(store_id),
        },
      },
      {
        $group: {
          _id: "$store",
          numberOfSuccessfulOrders: { $sum: 1 },
          revenue: { $sum: "$checkout.total" },
        },
      },
      {
        $lookup: {
          from: "Stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
    ]);
    if (statistic.length === 0) {
      statistic[0] = {
        _id: store_id,
        numberOfSuccessfulOrders: 0,
        revenue: 0,
        store: await storeModel.findById(store_id),
      };
    }

    const months = {};
    for (let i = 1; i <= 12; i++) {
      months[i] = { numberOfSuccessfulOrders: 0, revenue: 0 };
    }

    orders.forEach((order) => {
      const month = order.deliveredDate.getMonth() + 1;
      months[month].numberOfSuccessfulOrders += 1;
      months[month].revenue += order.checkout.total;
    });
    statistic[0].months = months;
    return statistic;
  }

  static async getRevenueOfStoreByMonth(user_id, store_id, month, year) {
    const store = await storeModel.findById(store_id);
    if (!store) {
      throw new BadRequestError(`Store with ${store_id} is not found!`);
    }

    // if (store.user_id !== user_id) {
    //   throw new BadRequestError("You are not authorized to view this data");
    // }
    const orders = await orderModel.aggregate([
      {
        $match: {
          deliveredDate: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-${daysOfMonth(month, year)}`),
          },
          store: convertToObjectId(store_id),
        },
      },
    ]);
    const statistic = await orderModel.aggregate([
      {
        $match: {
          deliveredDate: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-${daysOfMonth(month, year)}`),
          },
          store: convertToObjectId(store_id),
        },
      },
      {
        $group: {
          _id: "$store",
          numberOfSuccessfulOrders: { $sum: 1 },
          revenue: { $sum: "$checkout.total" },
        },
      },
      {
        $lookup: {
          from: "Stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
    ]);
    if (statistic.length === 0) {
      statistic[0] = {
        _id: store_id,
        numberOfSuccessfulOrders: 0,
        revenue: 0,
        store: await storeModel.findById(store_id),
      };
    }
    const days = {};
    for (let i = 1; i <= daysOfMonth(month - "0", year - "0"); i++) {
      days[i] = { numberOfSuccessfulOrders: 0, revenue: 0 };
    }

    orders.forEach((order) => {
      const day = order.deliveredDate.getDate();
      days[day].numberOfSuccessfulOrders += 1;
      days[day].revenue += order.checkout.total;
    });
    statistic[0].days = days;
    // console.log(statistic[0].days);
    return statistic;
  }
}

module.exports = StatisticService;
