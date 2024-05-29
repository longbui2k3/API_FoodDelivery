const { BadRequestError } = require("../../core/error.response");
const { getSelectData, getUnselectData } = require("../../utils");
const UploadFiles = require("../../utils/uploadFile");
const categoryModel = require("../category.model");

const createCategory = async ({ name }, file) => {
  const image = await new UploadFiles(
    "categories",
    "image",
    file
  ).uploadFileAndDownloadURL();
  return await categoryModel.create({ name, image });
};

const updateCategory = async (id, { name }, file) => {
  const checkCategoryExists = categoryModel.findById(id);
  if (!checkCategoryExists) {
    throw new BadRequestError(`Category with ${id} is not found!`);
  }
  const image = await new UploadFiles(
    "categories",
    "image",
    file
  ).uploadFileAndDownloadURL();
  return await categoryModel.findByIdAndUpdate(id, { name, image }, { new: true });
};

const findCategory = async ({ id, select = [] }) => {
  return await categoryModel.findById(id).select(getSelectData(select));
};
const findAllCategories = async ({ select = [] }) => {
  return await categoryModel.find().select(getSelectData(select));
};

module.exports = {
  createCategory,
  findAllCategories,
  findCategory,
  updateCategory,
};
