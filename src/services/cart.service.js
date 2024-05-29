const {
  addToCart,
  getCart,
  updateNumberCart,
  deleteAllCarts,
  deleteOne,
  deleteCartsByStore,
} = require("../models/repositories/cart.repo");

class CartService {
  static async addToCart({ user, food, store, number }) {
    return await addToCart({
      userId: user,
      foodId: food,
      storeId: store,
      number,
    });
  }
  static async updateNumberCart({ user, food, mode }) {
    return await updateNumberCart({ userId: user, foodId: food, mode });
  }
  static async getCart({ user, coordinate }) {
    return await getCart({
      user,
      select: [
        "_id",
        "number",
        "food._id",
        "food.name",
        "food.price",
        "food.store",
        "food.image",
      ],
      coordinate,
    });
  }
  static async deleteAllCarts({ user, food, store }) {
    return await deleteAllCarts({ user, food, store });
  }
}

module.exports = CartService;
