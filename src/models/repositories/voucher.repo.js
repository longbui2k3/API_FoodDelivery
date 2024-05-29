const {
  BadRequestError,
  AuthFailureError,
} = require("../../core/error.response");
const { removeUndefinedInObject } = require("../../utils");
const UploadFiles = require("../../utils/uploadFile");
const storeModel = require("../store.model");
const userModel = require("../user.model");
const voucherModel = require("../voucher.model");

const getAllVouchers = async ({ filter = {}, sort = "ctime", search = "" }) => {
  let sortBy = Object.fromEntries([sort].map((val) => [val, -1]));
  return await voucherModel
    .find(
      removeUndefinedInObject({
        ...filter,
        code: { $regex: search ? search : "", $options: "i" },
        expiresAt: { $gte: new Date().toISOString() },
      })
    )
    .sort(sortBy);
};

const createVoucher = async (
  {
    name,
    value,
    type, // percentage
    code,
    minimumPayment,
    expiresAt,
    //   image,
    description,
    storeId,
    userId,
    left,
    applies_to,
    applied_foods = [],
    applied_stores = [],
  },
  file
) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new BadRequestError(`User with id ${userId} is not found!`);
  }

  const store = await storeModel.findById(storeId);
  if (store) {
    throw new BadRequestError(`Store with id ${storeId} is not found!`);
  }

  if (type === "fixed_amount") {
    if (value < 1000) {
      throw new BadRequestError(
        "Voucher must be greater than or equal to 1000 dong"
      );
    }
  } else if (type === "percentage") {
    if (value <= 0 || value > 100) {
      throw new BadRequestError("Voucher must be between 1 and 100 percent!");
    }
  }

  if (minimumPayment < 0) {
    throw new BadRequestError(
      "Minimum payment must be greater than or equal to 0 "
    );
  }

  const date = new Date(expiresAt);
  if (date === "Invalid Date") throw new BadRequestError("Invalid Date");
  if (date.getTime() <= Date.now()) {
    throw new BadRequestError("Expiration date must be greater than now.");
  }

  if (left <= 0) {
    throw new BadRequestError("Left must be greater than or equal to 0.");
  }

  if (["all", "specificShops"].includes(applies_to) && user.role === "vendor") {
    throw new AuthFailureError(
      "Vendor can't create voucher for all or specific shops"
    );
  }

  if (
    ["allFoodsInShop", "specificFoods"].includes(applies_to) &&
    user.role === "admin"
  ) {
    throw new AuthFailureError(
      "Admin can't create voucher for all foods in shop or specific foods"
    );
  }

  if (applies_to === "specificShops") {
    if (applied_stores.length === 0) {
      throw new BadRequestError("There must be at least one applied store.");
    }
  }

  if (applies_to === "specificFoods") {
    if (applied_foods.length === 0) {
      throw new BadRequestError("There must be at least one applied food.");
    }
  }

  const image = await new UploadFiles(
    "vouchers",
    "image",
    file
  ).uploadFileAndDownloadURL();

  return await voucherModel.create({
    name,
    value,
    type,
    code,
    minimumPayment,
    expiresAt,
    image,
    description,
    storeId,
    userId,
    left,
    applies_to,
    applied_foods,
    applied_stores,
  });
};
module.exports = {
  getAllVouchers,
  createVoucher,
};
