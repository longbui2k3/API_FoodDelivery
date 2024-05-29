const { Types } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const foodModel = require("../models/food.model");
const {
  createComment,
  removeComment,
  getAllComments,
  likeComment,
  unlikeComment,
} = require("../models/repositories/comment.repo");
const storeModel = require("../models/store.model");
const userModel = require("../models/user.model");
const UploadFiles = require("../utils/uploadFile");
const orderModel = require("../models/order.model");
class CommentService {
  static async createComment(
    { userId, storeId, foodId, comment, rating },
    files
  ) {
    const order = await orderModel.findOne({
      user: userId,
      foods: { $elemMatch: { food: foodId } },
      status: "delivered",
    });

    if (!order) {
      throw new BadRequestError(
        "You can't comment because your order with this food is not delivered!"
      );
    }
    const user = await userModel.findById(userId);
    if (!user) {
      throw new BadRequestError("You are not logged in!");
    }

    const store = await storeModel.findById(storeId);
    if (!store) {
      throw new BadRequestError(`Store with ${storeId} is not found!`);
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
      throw new BadRequestError(`Store with ${foodId} is not found!`);
    }

    const existedComment = await commentModel.findOne({
      user: userId,
      food: foodId,
    });
    if (existedComment) {
      throw new BadRequestError("You have already commented this food!");
    }

    const imagesURL = await Promise.all(
      files.map(async (file) => {
        const image = await new UploadFiles(
          "comments",
          "image",
          file
        ).uploadFileAndDownloadURL();
        return image;
      })
    );

    const newComment = await createComment({
      userId,
      storeId,
      foodId,
      comment,
      rating,
      imagesURL,
    });

    return newComment;
  }

  static async removeComment(id) {
    await removeComment(id);
    return;
  }

  static async getAllComments({ foodId, filter, select, sort }) {
    const food = await foodModel.findById(foodId);
    if (!food) {
      throw new BadRequestError(`Food with id ${food} is not found!`);
    }

    return await getAllComments({ foodId, filter, select, sort });
  }

  static async checkUserLiked({ commentId, userId }) {
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestError(`Comment with id ${commentId} is not found!`);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new BadRequestError(`User with id ${userId} is not found!`);
    }

    const existedLikeComment = await commentModel.findOne({
      _id: commentId,
      usersLiked: { $elemMatch: { $eq: new Types.ObjectId(userId) } },
    });

    return existedLikeComment ? true : false;
  }

  static async likeComment({ commentId, userId }) {
    const existedLikeComment = await this.checkUserLiked({ commentId, userId });
    if (existedLikeComment) {
      throw new BadRequestError("User already liked comment!");
    }

    const updatedComment = await likeComment({ commentId, userId });

    return updatedComment;
  }

  static async unlikeComment({ commentId, userId }) {
    const existedLikeComment = await this.checkUserLiked({ commentId, userId });
    if (!existedLikeComment) {
      throw new BadRequestError("User doesn't like comment!");
    }

    const updatedComment = await unlikeComment({ commentId, userId });

    return updatedComment;
  }
}

module.exports = CommentService;
