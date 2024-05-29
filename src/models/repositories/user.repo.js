const {
  BadRequestError,
  AuthFailureError,
} = require("../../core/error.response");
const { convertToObjectId, getSelectData } = require("../../utils");
const UploadFiles = require("../../utils/uploadFile");
const userModel = require("../user.model");

const getUserInfo = async ({ userId, select }) => {
  const user = await userModel.findById(userId).select(getSelectData(select));
  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not exit!`);
  }
  return user;
};

const addFoodToFavorite = async ({ userId, food }) => {
  const user = await userModel.findById(userId);
  if (user.favoriteFoods.includes(food)) {
    throw new BadRequestError("This food is already in your favorite list.");
  }
  return await userModel.findByIdAndUpdate(
    userId,
    {
      $addToSet: { favoriteFoods: convertToObjectId(food) },
    },
    { new: true }
  );
};

const getFavoriteFoods = async ({ userId }) => {
  const user = await userModel
    .findById(userId)
    .populate("favoriteFoods")
    .lean();
  return user.favoriteFoods;
};

const deleteFavoriteFood = async ({ userId, food }) => {
  const user = await userModel.findById(userId);
  if (!user.favoriteFoods.includes(food)) {
    throw new BadRequestError("This food is not in your favorite list!");
  }
  return await userModel.findByIdAndUpdate(userId, {
    $pull: { favoriteFoods: convertToObjectId(food) },
  });
};

const checkFoodIsFavorite = async ({ userId, food }) => {
  const user = await userModel.findById(userId);
  return user.favoriteFoods.includes(food);
};

const addStoreToFavorite = async ({ userId, store }) => {
  const user = await userModel.findById(userId);
  if (user.favoriteStores.includes(store)) {
    throw new BadRequestError("This food is already in your favorite list.");
  }
  return await userModel.findByIdAndUpdate(
    userId,
    {
      $addToSet: { favoriteStores: convertToObjectId(store) },
    },
    { new: true }
  );
};

const getFavoriteStores = async ({ userId }) => {
  const user = await userModel
    .findById(userId)
    .populate("favoriteStores")
    .lean();
  return user.favoriteStores;
};

const deleteFavoriteStore = async ({ userId, store }) => {
  const user = await userModel.findById(userId);
  if (!user.favoriteStores.includes(store)) {
    throw new BadRequestError("This food is not in your favorite list!");
  }
  return await userModel.findByIdAndUpdate(userId, {
    $pull: { favoriteStores: convertToObjectId(store) },
  });
};

const checkStoreIsFavorite = async ({ userId, store }) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not existed!`);
  }
  return user.favoriteStores.includes(store);
};

const getAllPendingVendors = async () => {
  return await userModel.find({
    role: "vendor",
    status: "pending",
  });
};

const changeStatusOfUser = async ({ userId, status }) => {
  const changedStatuses = ["inactive", "active"];
  if (!changedStatuses.includes(status)) {
    throw new BadRequestError(
      "Admin just change status to inactive or active!"
    );
  }
  const user = await userModel.findById(userId);
  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not exist!`);
  }
  if (user.status === status) {
    throw new BadRequestError(`Account has already been ${status}`);
  }
  if (status === "inactive") {
    if (user.status !== "active") {
      throw new BadRequestError(
        "Can't inactive the account because it is not active!"
      );
    }
    return await userModel.findByIdAndUpdate(userId, { status: "inactive" });
  } else if (status === "active") {
    if (user.role === "vendor") {
      if (user.status !== "pending") {
        throw new BadRequestError(
          "Can't inactive the account because it is unverified!"
        );
      }
      return await userModel.findByIdAndUpdate(
        userId,
        { status: "active" },
        { new: true }
      );
    } else
      throw new AuthFailureError(
        "Admin does not have permission to active user account!"
      );
  }
};

const updateCoin = async ({ userId }) => {
  await userModel.findByIdAndUpdate(userId, {
    $inc: {
      coin: 10,
    },
  });
};

const getCoin = async ({ userId }) => {
  return (await userModel.findById(userId)).coin;
};

const updateUserInfo = async ({ userId, bodyUpdate, file, filter = [] }) => {
  const { name, gender, dateOfBirth, address, mobile } = bodyUpdate;
  const avatar = await new UploadFiles(
    "users",
    "image",
    file
  ).uploadFileAndDownloadURL();
  return await userModel
    .findByIdAndUpdate(
      userId,
      { name, gender, dateOfBirth, avatar, address, mobile },
      { new: true }
    )
    .select(getSelectData(filter));
};

const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
  newPasswordConfirm,
}) => {
  const user = await userModel.findById(userId).select("+password");
  if (!user.matchPassword(currentPassword)) {
    throw new AuthFailureError("Incorrect password!");
  }

  if (newPassword !== newPasswordConfirm) {
    throw new BadRequestError("New passwords do not match! Please try again!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
};

module.exports = {
  getUserInfo,
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
  updateCoin,
  getCoin,
  updateUserInfo,
  updatePassword,
};
