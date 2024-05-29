const { OK } = require("../core/success.response");
const FoodViewingHistoryService = require("../services/foodviewinghistory.service");

class FoodViewingHistoryController {
  addFoodToHistory = async (req, res, next) => {
    const history = await FoodViewingHistoryService.addFoodToHistory(
      req.user.userId,
      req.body.food
    );
    return new OK({
      message: "Add food to history successfully!",
      metadata: {
        history,
      },
    }).send(res);
  };

  getFoodsInHistory = async (req, res, next) => {
    const viewedFoods = await FoodViewingHistoryService.getFoodsInHistory(
      req.user.userId
    );
    return new OK({
      message: "Get foods in history successfully!",
      metadata: {
        viewedFoods,
      },
    }).send(res);
  };
}

module.exports = new FoodViewingHistoryController();
