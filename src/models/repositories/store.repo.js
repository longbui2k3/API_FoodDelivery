const { BadRequestError } = require("../../core/error.response");
const {
  getSelectData,
  getUnselectData,
  convertToObjectId,
  getDistanceFromLatLonInKm,
  removeUndefinedInObject,
} = require("../../utils");
const UploadFiles = require("../../utils/uploadFile");
const storeModel = require("../store.model");

const findAllStores = async ({
  sort = "createdAt",
  categoriesId,
  search,
  unselect = [],
  coordinate, // long,lat
}) => {
  if (!["createdAt", "rating", "distance"].includes(sort)) {
    throw new BadRequestError("Sort is invalid!");
  }
  if (!coordinate) {
    throw new BadRequestError("Please provide your current position!");
  }
  const [lat, long] = coordinate.split(",");
  if (!long || !lat) {
    throw new BadRequestError("Longtitude or latitude must be provided!");
  }
  let sortBy = Object.fromEntries([sort].map((val) => [val, -1]));
  const agg = [
    {
      $lookup: {
        from: "Foods",
        localField: "_id",
        foreignField: "store",
        as: "foods",
      },
    },
    {
      $lookup: {
        from: "Categories",
        localField: "foods.category",
        foreignField: "_id",
        as: "categories",
      },
    },
    {
      $sort: sortBy,
    },
    {
      $project: { foods: 0, ...getUnselectData(unselect) },
    },
  ];
  if (search !== undefined) {
    agg.unshift({
      $search: {
        index: "name_1",
        autocomplete: {
          query: search || " ",
          path: "name",
          tokenOrder: "sequential",
          fuzzy: { maxEdits: 1, prefixLength: 0 },
        },
      },
    });
  }
  let stores = await storeModel.aggregate(agg);
  if (categoriesId) {
    stores = stores.filter((store) => {
      const categoriesStore = store.categories.map((category) =>
        category._id.toString()
      );
      return categoriesId
        .split(",")
        .every((category) => categoriesStore.includes(category));
    });
  }
  stores.forEach((store) => {
    store["distance"] = getDistanceFromLatLonInKm(
      lat,
      long,
      store["latitude"],
      store["longtitude"]
    );
  });
  if (sort === "distance") {
    stores.sort((a, b) => a.distance - b.distance);
  }
  return stores;
};

const findAllStoresByVendor = async ({
  vendor,
  sort = "createdAt",
  categoriesId,
  search,
  unselect = [],
}) => {
  if (!["createdAt", "rating", "distance"].includes(sort)) {
    throw new BadRequestError("Sort is invalid!");
  }
  let sortBy = Object.fromEntries([sort].map((val) => [val, -1]));
  const agg = [
    {
      $match: {
        vendor: convertToObjectId(vendor),
      },
    },
    {
      $lookup: {
        from: "Foods",
        localField: "_id",
        foreignField: "store",
        as: "foods",
      },
    },
    {
      $lookup: {
        from: "Categories",
        localField: "foods.category",
        foreignField: "_id",
        as: "categories",
      },
    },
    {
      $sort: sortBy,
    },
    {
      $project: { foods: 0, ...getUnselectData(unselect) },
    },
  ];
  if (search !== undefined) {
    agg.unshift({
      $search: {
        index: "name_1",
        autocomplete: {
          query: search || " ",
          path: "name",
          tokenOrder: "sequential",
          fuzzy: { maxEdits: 1, prefixLength: 0 },
        },
      },
    });
  }
  let stores = await storeModel.aggregate(agg);
  if (categoriesId) {
    stores = stores.filter((store) => {
      const categoriesStore = store.categories.map((category) =>
        category._id.toString()
      );
      return categoriesId
        .split(",")
        .every((category) => categoriesStore.includes(category));
    });
  }
  return stores;
};

const findTop10RatingStores = async ({ unselect = [], coordinate }) => {
  const [lat, long] = coordinate.split(",");
  if (!long || !lat) {
    throw new BadRequestError("Longtitude or latitude must be provided!");
  }
  const stores = await storeModel
    .find({ rating: { $gt: 4.5 } })
    .limit(10)
    .select(getUnselectData(unselect))
    .lean();
  stores.forEach((store) => {
    store["distance"] = getDistanceFromLatLonInKm(
      lat,
      long,
      store["latitude"],
      store["longtitude"]
    );
  });
  return stores;
};

const findStore = async ({
  id,
  unselect = [],
  coordinate, // long,lat
}) => {
  const [lat, long] = coordinate.split(",");
  if (!long || !lat) {
    throw new BadRequestError("Longtitude or latitude must be provided!");
  }
  const store = await storeModel
    .findById(id)
    .select(getUnselectData(unselect))
    .lean();
  if (!store) {
    throw new BadRequestError(`Store with id ${id} is not exist!`);
  }
  store["distance"] = getDistanceFromLatLonInKm(
    lat,
    long,
    store["latitude"],
    store["longtitude"]
  );
  return store;
};
const createStore = async (
  { name, address, time_open, time_close, rating, longtitude, latitude, vendor },
  file
) => {
  const image = await new UploadFiles(
    "stores",
    "image",
    file
  ).uploadFileAndDownloadURL();
  return await storeModel.create({
    name,
    image,
    address,
    time_open,
    time_close,
    rating,
    longtitude,
    latitude,
    vendor
  });
};

const updateStore = async (
  id,
  { name, address, time_open, time_close, rating, longtitude, latitude },
  file
) => {
  const checkStoreExists = await storeModel.findById(id);
  if (!checkStoreExists) {
    throw new BadRequestError(`Food with id ${id} is not found!`);
  }

  const image = await new UploadFiles(
    "stores",
    "image",
    file
  ).uploadFileAndDownloadURL();

  const updatedStore = await storeModel.findByIdAndUpdate(
    id,
    removeUndefinedInObject({
      name,
      address,
      time_open,
      time_close,
      rating,
      longtitude,
      latitude,
      image,
    }),
    { new: true }
  );

  return updatedStore;
};

module.exports = {
  findAllStores,
  findStore,
  createStore,
  findTop10RatingStores,
  findAllStoresByVendor,
  updateStore,
};
