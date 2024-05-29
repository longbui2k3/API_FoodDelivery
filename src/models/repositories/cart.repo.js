const { BadRequestError, NotFoundError } = require("../../core/error.response");
const {
  getSelectData,
  convertToObjectId,
  getDistanceFromLatLonInKm,
  removeUndefinedInObject,
} = require("../../utils");
const cartModel = require("../cart.model");
const foodModel = require("../food.model");

const addToCart = async ({ userId, foodId, storeId, number }) => {
  const cart = await cartModel.findOne({ user: userId, food: foodId });
  if (cart) {
    throw new BadRequestError("Food has added to cart already!");
  }
  const food = await foodModel.findById(foodId);
  if (food.store != storeId) {
    throw new BadRequestError("Food is not belong to store!");
  }
  if (food.left < number) {
    throw new BadRequestError(`Only ${food.left} left for this food!`);
  }
  return await cartModel.create({
    user: userId,
    food: foodId,
    store: storeId,
    number,
  });
};

const updateNumberCart = async ({ userId, foodId, mode }) => {
  if (!["increment", "decrement"].includes(mode)) {
    throw new NotFoundError("Not Found!");
  }
  const cart = await cartModel.findOne({ user: userId, food: foodId });
  if (!cart) {
    throw new BadRequestError("Food is not existed in cart!");
  }
  const result = await cartModel.findOneAndUpdate(
    { user: userId, food: foodId },
    {
      $inc: { number: mode === "increment" ? 1 : -1 },
    },
    { new: true }
  );
  if (result.number === 0) {
    await cartModel.findByIdAndDelete(result._id);
  }
  return result;
};

const getCart = async ({ user, select = [], coordinate = "" }) => {
  const [lat, long] = coordinate.split(",");
  if (!long || !lat) {
    throw new BadRequestError("Longtitude or latitude must be provided!");
  }
  let carts = await cartModel.aggregate([
    { $match: { user: convertToObjectId(user) } },
    {
      $lookup: {
        from: "Foods", // COLLECTION NAME REFERENCES TO
        localField: "food", //attr of cart
        foreignField: "_id", // attr of Foods
        as: "food", // set name
      },
    },
    { $unwind: "$food" }, // get first element of array food
    { $project: getSelectData(select) },
    {
      $group: {
        _id: "$food.store",
        foods: { $push: "$$ROOT" },
        numberOfFoods: { $sum: "$number" },
        totalOfPrices: { $sum: { $multiply: ["$number", "$food.price"] } },
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
    {
      $project: { _id: 0 },
    },
  ]);
  carts = carts.map((cart) => {
    cart.store["distance"] = getDistanceFromLatLonInKm(
      lat,
      long,
      cart.store["latitude"],
      cart.store["longtitude"]
    );
    return cart;
  });
  return carts;
};

const deleteAllCarts = async ({ user, food, store }) => {
  await cartModel.deleteMany(removeUndefinedInObject({ user, food, store }));
};

module.exports = {
  addToCart,
  getCart,
  updateNumberCart,
  deleteAllCarts,
};
