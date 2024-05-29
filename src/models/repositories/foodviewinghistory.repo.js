const { BadRequestError } = require("../../core/error.response");
const { getUnselectData } = require("../../utils");
const foodModel = require("../food.model");
const foodviewinghistoryModel = require("../foodviewinghistory.model");
const userModel = require("../user.model");

const addFoodToHistory = async (user_id, food_id) => {
  const user = await userModel.findById(user_id);
  if (!user) {
    throw new BadRequestError(`User with id ${user_id} does not existed!`);
  }
  const checkFoodExists = await foodModel.findById(food_id);
  if (!checkFoodExists) {
    throw new BadRequestError(`Food with id ${food_id} is not found!`);
  }
  return await foodviewinghistoryModel.findOneAndUpdate(
    {
      user: user_id,
    },
    {
      $addToSet: {
        viewedFoods: {
          food: food_id,
          viewedAt: Date.now(),
        },
      },
    },
    { new: true, upsert: true }
  );
};

const getFoodsInHistory = async (userId, unselect = []) => {
  let history = await foodviewinghistoryModel
    .findOne({
      user: userId,
    })
    .populate({
      path: "viewedFoods.food",
      select: getUnselectData(unselect),
    });
  if (!history) {
    history = await foodviewinghistoryModel.create({ user: userId });
  }
  return history.viewedFoods;
};

module.exports = {
  addFoodToHistory,
  getFoodsInHistory,
};
