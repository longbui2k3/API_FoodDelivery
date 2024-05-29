const {
  BadRequestError,
  AuthFailureError,
} = require("../../core/error.response");
const {
  removeUndefinedInObject,
  getDistanceFromLatLonInKm,
} = require("../../utils");
const Order = require("../order.model");
const Food = require("../food.model");
const User = require("../user.model");
const Comment = require("../comment.model");
const findAllOrdersForVendor = async ({ vendor, filter, sort, search }) => {
  const sortBy = Object.fromEntries([sort].map((val) => [val, 1]));
  let orders = await Order.find(
    removeUndefinedInObject({
      ...filter,
    })
  )
    .sort(sortBy)
    .populate({ path: "user", select: { _id: 1, name: 1, avatar: 1 } })
    .populate({ path: "store", match: { vendor } })
    .populate({ path: "foods.food", select: { name: 1, rating: 1, price: 1 } })
    .lean();
  orders = orders.map((order) => {
    order.checkout.priceOfFoods = order.foods.map((food) => food.food.price);
    return order;
  });

  return orders.filter((order) => order.store !== null);
};

const findAllOrdersForUser = async ({ user, filter, sort, search }) => {
  const sortBy = Object.fromEntries([sort].map((val) => [val, 1]));
  let orders = await Order.find(
    removeUndefinedInObject({
      user,
      ...filter,
    })
  )
    .sort(sortBy)
    .populate({ path: "user", select: { _id: 1, name: 1, avatar: 1 } })
    .populate({ path: "store" })
    .populate({ path: "foods.food", select: { name: 1, rating: 1 } })
    .lean();
  orders = orders.map((order) => {
    order.checkout.priceOfFoods = order.foods.map((food) => food.food.price);
    return order;
  });
  return orders;
};

const findAllOrdersForShipper = async ({
  coordinate,
  sort,
  search,
  status,
}) => {
  if (!["confirmed", "outgoing"].includes(status)) {
    throw new BadRequestError("Status must be confirmed or outgoing!");
  }
  const [lat, long] = coordinate.split(",");
  if (!long || !lat) {
    throw new BadRequestError("Longtitude or latitude must be provided!");
  }
  const sortBy = Object.fromEntries([sort].map((val) => [val, 1]));
  const orders = await Order.find(
    removeUndefinedInObject({
      status,
    })
  )
    .sort(sortBy)
    .populate({ path: "user", select: { _id: 1, name: 1, avatar: 1 } })
    .populate({ path: "store" })
    .populate({ path: "foods.food", select: { name: 1, rating: 1 } })
    .lean();
  return orders.filter((order) => {
    const distance = getDistanceFromLatLonInKm(
      lat,
      long,
      order.store.latitude,
      order.store.longtitude
    );
    return distance < 5;
  });
};

const updateStatusOrders = async ({ orderId, status, userId }) => {
  const statuses = [
    "pending",
    "confirmed",
    "new",
    "outgoing",
    "delivered",
    "rated",
    "cancelled",
  ];
  const index = statuses.indexOf(status);
  if (index < 0) {
    throw new BadRequestError("Status is not valid!");
  }
  const order = await Order.findById(orderId);
  if (
    statuses.indexOf(order.status) + 1 !== index &&
    index !== statuses.length - 1
  ) {
    throw new BadRequestError(
      `Update status failed! Order must be in ${statuses[index - 1]} status`
    );
  }

  const user = await User.findById(userId).lean();
  switch (user.role) {
    case "user":
      if (status !== "cancelled" && status !== "rated") {
        throw new AuthFailureError(
          `User doesn't have permission to change order status to ${status}`
        );
      }
      break;
    case "vendor":
      if (status !== "confirmed" && status !== "outgoing") {
        throw new AuthFailureError(
          `Vendor doesn't have permission to change order status to ${status}`
        );
      }
      break;
    case "shipper":
      if (status !== "new" && status !== "delivered") {
        throw new AuthFailureError(
          `Shipper doesn't have permission to change order status to ${status}`
        );
      }
      break;
  }

  if (status === "cancelled") {
    if (Date.now() - new Date(order.createdAt).getTime() > 1000 * 60 * 30) {
      throw new BadRequestError("Order can not be cancelled after 30 minutes");
    }
  }
  if (status === "new") {
    await Order.findByIdAndUpdate(orderId, {
      shipper: userId,
    });
  }

  if (status === "rated") {
    for (const food of order.foods) {
      const comment = Comment.findOne({ food });
      if (!comment) {
        throw new BadRequestError("Some foods has not been rated yet!");
      }
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  )
    .populate({ path: "foods.food", select: { name: 1, rating: 1 } })
    .lean();

  if (status === "delivered") {
    await Promise.all(
      updatedOrder.foods.map(async (food) => {
        await Food.findByIdAndUpdate(food.food, {
          $inc: {
            sold: food.quantity,
          },
          deliveredDate: Date.now(),
        });
      })
    );
  }
  return updatedOrder;
};
module.exports = {
  findAllOrdersForVendor,
  updateStatusOrders,
  findAllOrdersForUser,
  findAllOrdersForShipper,
};
