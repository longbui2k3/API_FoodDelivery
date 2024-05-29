const { CREATED, OK } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    const { store, food, comment, rating } = req.body;
    const newComment = await CommentService.createComment({
      userId: req.user.userId,
      storeId: store,
      foodId: food,
      comment,
      rating,
    }, req.files);
    new CREATED({
      message: "Create comment successfully!",
      metadata: {
        comment: newComment,
      },
    }).send(res);
  };

  removeComment = async (req, res, next) => {
    await CommentService.removeComment(req.params.id);
    new OK({
      message: "Remove comment successfully!",
    }).send(res);
  };

  getAllComments = async (req, res, next) => {
    const comments = await CommentService.getAllComments({
      foodId: req.query.food,
    });
    new OK({
      message: "Get all comments successfully!",
      metadata: {
        comments,
      },
    }).send(res);
  };
  likeComment = async (req, res, next) => {
    const comment = await CommentService.likeComment({
      commentId: req.params.comment,
      userId: req.user.userId,
    });
    new OK({
      message: "Like comment successfully!",
      metadata: {
        comment,
      },
    }).send(res);
  };
  unlikeComment = async (req, res, next) => {
    const comment = await CommentService.unlikeComment({
      commentId: req.params.comment,
      userId: req.user.userId,
    });
    new OK({
      message: "Unlike comment successfully!",
      metadata: {
        comment,
      },
    }).send(res);
  };
  checkUserLiked = async (req, res, next) => {
    const result = await CommentService.checkUserLiked({
      commentId: req.params.comment,
      userId: req.user.userId,
    });
    new OK({
      message: "Check user liked successfully!",
      metadata: {
        result,
      },
    }).send(res);
  };
}

module.exports = new CommentController();
