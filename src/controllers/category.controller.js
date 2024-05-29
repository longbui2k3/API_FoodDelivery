const { CREATED, OK } = require("../core/success.response");
const CategoryService = require("../services/category.service");

class CategoryController {
  findAllCategories = async (req, res, next) => {
    const result = await CategoryService.findAllCategories();
    return new OK({
      message: "Find all categories successfully!",
      metadata: result,
    }).send(res);
  };
  findCategory = async (req, res, next) => {
    const result = await CategoryService.findCategory(req.params.id);
    return new OK({
      message: "Find category successfully!",
      metadata: result,
    }).send(res);
  };
  createCategory = async (req, res, next) => {
    const result = await CategoryService.createCategory(req.body, req.file);
    return new CREATED({
      message: "Create Category successfully!",
      metadata: result,
    }).send(res);
  };
  updateCategory = async (req, res, next) => {
    const result = await CategoryService.updateCategory(
      req.params.id,
      req.body,
      req.file
    );
    return new OK({
      message: "Update category successfully!",
      metadata: result,
    }).send(res);
  };
}

module.exports = new CategoryController();
