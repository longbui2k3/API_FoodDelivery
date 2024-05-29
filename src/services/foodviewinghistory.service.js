const {
  addFoodToHistory,
  getFoodsInHistory,
} = require("../models/repositories/foodviewinghistory.repo");

class FoodViewingHistoryService {
  static async addFoodToHistory(userId, foodId) {
    return await addFoodToHistory(userId, foodId);
  }
  static async getFoodsInHistory(userId) {
    return await getFoodsInHistory(userId, [
      "left",
      "sold",
      "createdAt",
      "updatedAt",
      "__v",
    ]);
  }
}

module.exports = FoodViewingHistoryService;
