const {
  createCategory,
  findAllCategories,
  findCategory,
  updateCategory,
} = require("../models/repositories/category.repo");

class CategoryService {
  static async findAllCategories() {
    return await findAllCategories({ select: ["_id", "name", "image"] });
  }
  static async findCategory(id) {
    return await findCategory({ id, select: ["_id", "name", "image"] });
  }
  static async createCategory({ name }, file) {
    return await createCategory(
      {
        name,
      },
      file
    );
  }
  static async updateCategory(id, { name }, file) {
    return await updateCategory(id, { name }, file);
  }
}

module.exports = CategoryService;
