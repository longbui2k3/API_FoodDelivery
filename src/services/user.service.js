const {
  addFoodToFavorite,
  getFavoriteFoods,
  deleteFavoriteFood,
  checkFoodIsFavorite,
  addStoreToFavorite,
  getFavoriteStores,
  deleteFavoriteStore,
  checkStoreIsFavorite,
  getAllPendingVendors,
  changeStatusOfUser,
  getCoin,
  updateUserInfo,
  updatePassword,
  getUserInfo,
} = require("../models/repositories/user.repo");

class UserService {
  static async getUserInfo({ userId }) {
    return await getUserInfo({
      userId,
      select: [
        "_id",
        "name",
        "avatar",
        "email",
        "role",
        "address",
        "dateOfBirth",
        "mobile",
        "gender",
      ],
    });
  }
  static async addFoodToFavorite({ userId, food }) {
    return await addFoodToFavorite({ userId, food });
  }
  static async getFavoriteFoods({ userId }) {
    return await getFavoriteFoods({
      userId,
    });
  }
  static async deleteFavoriteFood({ userId, food }) {
    return await deleteFavoriteFood({ userId, food });
  }
  static async checkFoodIsFavorite({ userId, food }) {
    return await checkFoodIsFavorite({ userId, food });
  }

  static async addStoreToFavorite({ userId, store }) {
    return await addStoreToFavorite({ userId, store });
  }
  static async getFavoriteStores({ userId }) {
    return await getFavoriteStores({
      userId,
    });
  }
  static async deleteFavoriteStore({ userId, store }) {
    return await deleteFavoriteStore({ userId, store });
  }
  static async checkStoreIsFavorite({ userId, store }) {
    return await checkStoreIsFavorite({ userId, store });
  }
  static async getAllPendingVendors() {
    return await getAllPendingVendors();
  }
  static async changeStatusOfUser({ userId, status }) {
    return await changeStatusOfUser({ userId, status });
  }
  static async getCoin({ userId }) {
    return await getCoin({ userId });
  }
  static async updateUserInfo({ userId, bodyUpdate, file }) {
    return await updateUserInfo({
      userId,
      bodyUpdate,
      file,
      filter: [
        "name",
        "email",
        "avatar",
        "address",
        "dateOfBirth",
        "gender",
        "mobile",
      ],
    });
  }
  static async updatePassword({
    userId,
    currentPassword,
    newPassword,
    newPasswordConfirm,
  }) {
    return await updatePassword({
      userId,
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
  }
}

module.exports = UserService;
