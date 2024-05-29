const {
  findAllFoods,
  createFood,
  findFood,
  updateFood,
} = require("../models/repositories/food.repo");

class FoodService {
  static async findAllFoods({ filter, sort, search }) {
    return await findAllFoods({
      unselect: ["createdAt", "updatedAt", "__v"],
      filter,
      sort,
      search,
    });
  }
  static async findFood(id) {
    return await findFood({
      id,
      unselect: ["createdAt", "updatedAt", "__v"],
    });
  }
  static async createFood({ name, category, store, price, left }, file) {
    return await createFood({ name, category, store, price, left }, file);
  }

  static async updateFood(id, { name, category, price, left }, file) {
    return await updateFood(id, { name, category, price, left }, file);
  }
}

module.exports = FoodService;
