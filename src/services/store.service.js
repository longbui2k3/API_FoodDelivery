const {
  createStore,
  findAllStores,
  findStore,
  findTop10RatingStores,
  findAllStoresByVendor,
  updateStore,
} = require("../models/repositories/store.repo");

class StoreService {
  static async findAllStores({ sort, categories, search, coordinate }) {
    return await findAllStores({
      unselect: ["createdAt", "updatedAt", "__v"],
      categoriesId: categories,
      search,
      sort,
      coordinate,
    });
  }

  static async findAllStoresByVendor({ vendor, sort, categories, search }) {
    return await findAllStoresByVendor({
      vendor,
      sort,
      categoriesId: categories,
      search,
      unselect: ["createdAt", "updatedAt", "__v"],
    });
  }

  static async findTop10RatingStores(coordinate) {
    return await findTop10RatingStores({
      unselect: ["createdAt", "updatedAt", "__v"],
      coordinate,
    });
  }
  static async findStore(id, coordinate) {
    return await findStore({
      id,
      unselect: ["createdAt", "updatedAt", "__v"],
      coordinate,
    });
  }
  static async createStore(
    {
      name,
      address,
      time_open,
      time_close,
      rating,
      longtitude,
      latitude,
      vendor,
    },
    file
  ) {
    return await createStore(
      {
        name,
        address,
        time_open,
        time_close,
        rating,
        longtitude,
        latitude,
        vendor,
      },
      file
    );
  }
  static async updateStore(
    id,
    { name, address, time_open, time_close, rating, longtitude, latitude },
    file
  ) {
    return await updateStore(
      id,
      { name, address, time_open, time_close, rating, longtitude, latitude },
      file
    );
  }
}

module.exports = StoreService;
