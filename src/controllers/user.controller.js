const { CREATED, OK } = require("../core/success.response");
const UserService = require("../services/user.service");

class UserController {
  getUserInfo = async (req, res, next) => {
    const result = await UserService.getUserInfo({ userId: req.user.userId });
    return new OK({
      message: "Get user information successfully!",
      metadata: {
        user: result
      }
    }).send(res);
  }
  addFoodToFavorite = async (req, res, next) => {
    const result = await UserService.addFoodToFavorite({
      userId: req.user.userId,
      food: req.body.food,
    });
    return new CREATED({
      message: "Add to favorite successfully!",
      metadata: result,
    }).send(res);
  };
  getFavoriteFoods = async (req, res, next) => {
    const result = await UserService.getFavoriteFoods({
      userId: req.user.userId,
    });
    return new OK({
      message: "Get favorite foods successfully!",
      metadata: result,
    }).send(res);
  };
  deleteFavoriteFood = async (req, res, next) => {
    await UserService.deleteFavoriteFood({
      userId: req.user.userId,
      food: req.params.food,
    });
    return new OK({
      message: "Delete favorite foods successfully!",
    }).send(res);
  };
  checkFoodIsFavorite = async (req, res, next) => {
    const result = await UserService.checkFoodIsFavorite({
      userId: req.user.userId,
      food: req.params.food,
    });
    return new OK({
      message: "Check food is favorite successfully!",
      metadata: { result },
    }).send(res);
  };

  addStoreToFavorite = async (req, res, next) => {
    const result = await UserService.addStoreToFavorite({
      userId: req.user.userId,
      store: req.body.store,
    });
    return new CREATED({
      message: "Add to favorite successfully!",
      metadata: result,
    }).send(res);
  };
  getFavoriteStores = async (req, res, next) => {
    const result = await UserService.getFavoriteStores({
      userId: req.user.userId,
    });
    return new OK({
      message: "Get favorite foods successfully!",
      metadata: result,
    }).send(res);
  };
  deleteFavoriteStore = async (req, res, next) => {
    await UserService.deleteFavoriteStore({
      userId: req.user.userId,
      store: req.params.store,
    });
    return new OK({
      message: "Delete favorite stores successfully!",
    }).send(res);
  };
  checkStoreIsFavorite = async (req, res, next) => {
    const result = await UserService.checkStoreIsFavorite({
      userId: req.user.userId,
      store: req.params.store,
    });
    return new OK({
      message: "Check store is favorite successfully!",
      metadata: { result },
    }).send(res);
  };
  getAllPendingVendors = async (req, res, next) => {
    const users = await UserService.getAllPendingVendors();
    return new OK({
      message: "Get all pending vendors successfully!",
      metadata: {
        users,
      },
    }).send(res);
  };
  changeStatusOfUser = async (req, res, next) => {
    const { user, status } = req.body;
    const updatedUser = await UserService.changeStatusOfUser({
      userId: user,
      status,
    });
    return new OK({
      message: "Change status of user successfully!",
      metadata: {
        user: updatedUser,
      },
    }).send(res);
  };
  getCoin = async (req, res, next) => {
    const coin = await UserService.getCoin({
      userId: req.user.userId,
    });
    return new OK({
      message: "Get coin successfully!",
      metadata: {
        coin,
      },
    }).send(res);
  };
  updateUserInfo = async (req, res, next) => {
    const user = await UserService.updateUserInfo({
      userId: req.user.userId,
      bodyUpdate: req.body,
      file: req.file,
    });
    return new OK({
      message: "Update user successfully!",
      metadata: {
        user,
      },
    }).send(res);
  };
  updatePassword = async (req, res, next) => {
    await UserService.updatePassword({
      userId: req.user.userId,
      currentPassword: req.body.password,
      newPassword: req.body.newPassword,
      newPasswordConfirm: req.body.newPasswordConfirm,
    });
    return new OK({
      message: "Update user password successfully!",
    }).send(res);
  };
}

module.exports = new UserController();
