const { BadRequestError } = require("../core/error.response");
const User = require("../models/user.model");
const Food = require("../models/food.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Voucher = require("../models/voucher.model");
const Store = require("../models/store.model");
const transaction = require("../helpers/transaction");
const Statistic = require("../models/statistic.model");
const { getDistanceFromLatLonInKm } = require("../utils/index");
const {
  updateStatusOrders,
  findAllOrdersForVendor,
  findAllOrdersForUser,
  findAllOrdersForShipper,
} = require("../models/repositories/order.repo");
class OrderService {
  static createOrder = async ({
    userId,
    checkout,
    shipping_address,
    payment,
    coin = 0,
    voucherId,
    foods,
    storeId,
    coordinate,
    note,
    phone,
  }) => {
    return await transaction(async (session) => {
      if (!coordinate) {
        throw new BadRequestError("Coordinate is not exist!");
      }
      const [latitude, longtitude] = coordinate.split(",");
      if (!longtitude || !latitude) {
        throw new BadRequestError("Longtitude or latitude is required!");
      }

      const statistic = (await Statistic.find())[0];

      //Kiểm tra người dùng hợp lệ
      const user = await User.findById(userId);
      if (!user) {
        throw new BadRequestError("You are not logged in!");
      }

      if (user.coin < coin) {
        throw new BadRequestError("Your coin is not enough to discount!");
      }

      // Kiểm tra store tồn tại
      const store = await Store.findById(storeId);
      if (!store) {
        throw new BadRequestError(
          `The store with id ${storeId} does not exist`
        );
      }

      const distance = getDistanceFromLatLonInKm(
        latitude,
        longtitude,
        store.latitude,
        store.longtitude
      );

      if (!foods.length) {
        throw new BadRequestError("Food is required!");
      }
      //Kiểm tra food tồn tại, food có thuộc store hay không

      const resultExistedFoods = await Promise.allSettled(
        foods.map(async (food) => {
          const existedFood = await Food.findById(food.food);
          if (!existedFood) {
            throw new BadRequestError(
              `The food with id ${food.food} does not exist`
            );
          }
          const existedFoodBelongToStore = await Food.findOne({
            store: storeId,
          });
          if (!existedFoodBelongToStore) {
            throw new BadRequestError(
              `Food is not belong to store! Please check again!`
            );
          }
          return existedFood;
        })
      );
      const existedFoods = await Promise.all(resultExistedFoods);

      // xóa đồ ăn trong giỏ hàng của user sau khi thêm đơn hàng và
      // cập nhật số lượng còn đồ ăn của cửa hàng

      const resultCheckQuantityFoods = await Promise.allSettled(
        foods.map(async (food, i) => {
          // Kiểm tra số lượng còn của đồ ăn có đủ cho số lượng được đặt hay không?
          if (food.quantity > existedFoods[i].left) {
            throw new BadRequestError(
              "The quantity of food in store is not enough to order!"
            );
          }
          await Cart.findOneAndDelete(
            { user: userId, food: food.food },
            { session }
          );

          await Food.findByIdAndUpdate(
            food.food,
            {
              $inc: {
                left: -food.quantity,
              },
            },
            { session }
          );
        })
      );
      await Promise.all(resultCheckQuantityFoods);
      // Cập nhật thống kê số lượng đơn hàng
      await Statistic.findByIdAndUpdate(
        statistic._id,
        {
          $inc: {
            number_of_orders: 1,
          },
        },
        { session }
      );

      // kiểm tra tổng giá và số lượng đồ ăn có bằng với totalPrice không
      const totalPrice = (
        await Promise.all(
          foods.map(async (food, i) => {
            const existedFood = await Food.findById(food.food);
            return existedFood.price * food.quantity;
          })
        )
      ).reduce((a, b) => a + b, 0);

      if (totalPrice !== checkout.totalPrice) {
        throw new BadRequestError("Total price is not correct!");
      }

      // const voucher = await Voucher.findById(voucherId);
      // // if (!voucher) {
      // //   throw new BadRequestError(`Voucher with id ${voucherId} is not found`);
      // // }
      // if (voucher) {
      //   if (
      //     voucher.value + coin * (process.env.COINTOVND - "0") !==
      //     checkout.totalApplyDiscount
      //   ) {
      //     throw new BadRequestError("Total applied discount is incorrect");
      //   }
      // }

      // tạo đơn hàng
      const order = new Order({
        user: userId,
        checkout,
        shipping_address,
        payment,
        coin,
        voucher: voucherId,
        foods,
        trackingNumber: `#${statistic.number_of_orders + 1}`,
        status: "pending",
        store: storeId,
        distance,
        note,
        phone,
      });
      order.save();
      if (!order) {
        throw new BadRequestError("Create order failed!");
      }

      return order;
    });
  };
  static findAllOrdersForVendor = async ({ vendor, filter, sort, search }) => {
    return await findAllOrdersForVendor({ vendor, filter, sort, search });
  };
  static findAllOrdersForUser = async ({ user, filter, sort, search }) => {
    return await findAllOrdersForUser({ user, filter, sort, search });
  };
  static findAllOrdersForShipper = async ({ coordinate, sort, search, status }) => {
    return await findAllOrdersForShipper({ coordinate, sort, search, status });
  };
  static updateStatusOrders = async ({ orderId, status, userId }) => {
    return await updateStatusOrders({ orderId, status, userId });
  };
}

module.exports = OrderService;
