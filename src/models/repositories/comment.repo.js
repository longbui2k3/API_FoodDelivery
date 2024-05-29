const { Types } = require("mongoose");
const commentModel = require("../comment.model");
const storeModel = require("../store.model");
const foodModel = require("../food.model");
const { BadRequestError } = require("../../core/error.response");
const transaction = require("../../helpers/transaction");
const { removeUndefinedInObject, getSelectData } = require("../../utils");
const { updateCoin } = require("./user.repo");

const updateRating = async ({ foodId, storeId, session }) => {
  const [avgByFood, avgByStore] = await Promise.all([
    await commentModel
      .aggregate([
        {
          $match: { food: new Types.ObjectId(foodId) },
        },
        {
          $group: {
            _id: "$food",
            avgRating: { $avg: "$rating" },
          },
        },
      ])
      .option({ session }),
    await commentModel
      .aggregate([
        {
          $match: { store: new Types.ObjectId(storeId) },
        },
        {
          $group: {
            _id: "$store",
            avgRating: { $avg: "$rating" },
          },
        },
      ])
      .option({ session }),
  ]);

  await Promise.all([
    storeModel.findByIdAndUpdate(
      storeId,
      {
        rating: Math.round(avgByStore[0].avgRating * 10) / 10,
      },
      { session }
    ),
    foodModel.findByIdAndUpdate(
      foodId,
      {
        rating: Math.round(avgByFood[0].avgRating * 10) / 10,
      },
      { session }
    ),
  ]);
};

const createComment = async ({ userId, storeId, foodId, comment, rating, imagesURL }) => {
  return await transaction(async (session) => {
    const newComment = await new commentModel({
      user: userId,
      store: storeId,
      food: foodId,
      comment,
      rating,
      imagesURL
    }).save({ session });

    if (!newComment) {
      throw new BadRequestError("Create comment unsuccessfully!");
    }

    await updateCoin({ userId });

    await updateRating({ foodId, storeId, session });

    return newComment;
  });
};

const removeComment = async (id) => {
  return await transaction(async (session) => {
    const comment = await commentModel.findById(id).session(session);
    if (!comment) {
      throw new BadRequestError(`Comment with id ${id} is not found!`);
    }
    await commentModel.findByIdAndDelete(id, { session });

    await updateRating({
      foodId: comment.food,
      storeId: comment.store,
      session,
    });
    return;
  });
};

const getAllComments = async ({
  foodId,
  filter = {},
  select = [],
  sort = "ctime",
}) => {
  let sortBy = Object.fromEntries([sort].map((val) => [val, -1]));
  return await commentModel
    .find(removeUndefinedInObject({ ...filter, food: foodId }))
    .select(getSelectData(select))
    .sort(sortBy)
    .populate({ path: "user", select: { name: 1, avatar: 1 } })
    .lean();
};

const likeComment = async ({ commentId, userId }) => {
  return await commentModel.findByIdAndUpdate(
    commentId,
    {
      $inc: { numberOfLikes: 1 },
      $addToSet: {
        usersLiked: userId,
      },
    },
    { new: true }
  );
};

const unlikeComment = async ({ commentId, userId }) => {
  return await commentModel.findByIdAndUpdate(
    commentId,
    {
      $inc: { numberOfLikes: -1 },
      $pull: {
        usersLiked: userId,
      },
    },
    { new: true }
  );
};

module.exports = {
  createComment,
  removeComment,
  getAllComments,
  likeComment,
  unlikeComment,
};
