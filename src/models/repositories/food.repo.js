const { BadRequestError } = require("../../core/error.response");
const {
  getSelectData,
  convertToObjectId,
  getUnselectData,
  removeUndefinedInObject,
} = require("../../utils");
const UploadFiles = require("../../utils/uploadFile");

const food = require("../food.model");

const findAllFoods = async ({
  unselect = [],
  filter = {},
  sort = "createdAt",
  search,
}) => {
  let sortBy = Object.fromEntries([sort].map((val) => [val, -1]));
  const category = filter.category
    ? convertToObjectId(filter.category)
    : undefined;
  const store = filter.store ? convertToObjectId(filter.store) : undefined;
  const agg = [
    {
      $match: removeUndefinedInObject({ ...filter, category, store }),
    },
    {
      $lookup: {
        from: "Stores",
        localField: "store",
        foreignField: "_id",
        as: "store",
      },
    },
    {
      $unwind: "$store",
    },
    {
      $lookup: {
        from: "Categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $sort: sortBy,
    },
    {
      $project: {
        "store.createdAt": 0,
        "store.updatedAt": 0,
        "store.__v": 0,
        "category.createdAt": 0,
        "category.updatedAt": 0,
        "category.__v": 0,
        ...getUnselectData(unselect),
      },
    },
  ];
  if (search) {
    agg.unshift({
      $search: {
        index: "default",
        autocomplete: {
          query: search || " ",
          path: "name",
          tokenOrder: "sequential",
          fuzzy: { maxEdits: 1, prefixLength: 0 },
        },
      },
    });
  }
  return await food.aggregate(agg);
};

const findFood = async ({ id, select = [] }) => {
  const checkFoodExists = await food.findById(id);
  if (!checkFoodExists) {
    throw new BadRequestError(`Food with id ${id} is not found!`);
  }
  return await food.findById(id).select(getSelectData(select));
};

const findAllFoodsByCategory = async (categoryId) => {
  return await food.find({ category: convertToObjectId(categoryId) });
};

const createFood = async ({ name, category, store, price, left }, file) => {
  const image = await new UploadFiles(
    "foods",
    "image",
    file
  ).uploadFileAndDownloadURL();
  return await food.create({ name, image, category, store, price, left });
};

const updateFood = async (id, { name, category, price, left }, file) => {
  const checkFoodExists = await food.findById(id);
  if (!checkFoodExists) {
    throw new BadRequestError(`Food with id ${id} is not found!`);
  }

  const image = await new UploadFiles(
    "foods",
    "image",
    file
  ).uploadFileAndDownloadURL();

  const updatedFood = await food.findByIdAndUpdate(
    id,
    removeUndefinedInObject({ name, category, price, left, image }),
    { new: true }
  );

  return updatedFood;
};

module.exports = {
  findAllFoods,
  findFood,
  createFood,
  findAllFoodsByCategory,
  updateFood,
};
