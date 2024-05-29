const { OK, CREATED } = require("../core/success.response");
const OrderService = require("../services/order.service");

class OrderController {
  createOrder = async (req, res, next) => {
    const order = await OrderService.createOrder({
      userId: req.user.userId,
      coordinate: req.query.coordinate,
      ...req.body,
    });
    new CREATED({
      message: "Create order successfully!",
      metadata: {
        order,
      },
    }).send(res);
  };
  findAllOrdersForVendor = async (req, res, next) => {
    const { status, sort, search } = req.query;
    const orders = await OrderService.findAllOrdersForVendor({
      filter: { status },
      sort,
      search,
      vendor: req.user.userId,
    });
    new OK({
      message: "Find all orders successfully!",
      metadata: {
        orders,
      },
    }).send(res);
  };
  findAllOrdersForUser = async (req, res, next) => {
    const { status, sort, search } = req.query;
    const orders = await OrderService.findAllOrdersForUser({
      filter: { status },
      sort,
      search,
      user: req.user.userId,
    });
    new OK({
      message: "Find all orders successfully!",
      metadata: {
        orders,
      },
    }).send(res);
  };
  findAllOrdersForShipper = async (req, res, next) => {
    const { coordinate, sort, search, status } = req.query;
    const orders = await OrderService.findAllOrdersForShipper({
      coordinate,
      sort,
      search,
      status
    });
    new OK({
      message: "Find all orders successfully!",
      metadata: {
        orders,
      },
    }).send(res);
  };
  updateStatusOrders = async (req, res, next) => {
    const order = await OrderService.updateStatusOrders({
      orderId: req.params.id,
      status: req.body.status,
      userId: req.user.userId,
    });
    new OK({
      message: "Update order successfully!",
      metadata: {
        order,
      },
    }).send(res);
  };
}

module.exports = new OrderController();
