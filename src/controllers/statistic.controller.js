const { OK } = require("../core/success.response");
const StatisticService = require("../services/statistic.service");

class StatisticController {
  getRevenueOfStore = async (req, res, next) => {
    const result = await StatisticService.getRevenueOfStore(
      req.user.userId,
      req.query.store
    );

    return new OK({
      message: "Get revenue of store successfully!",
      metadata: {
        statistic: result,
      },
    }).send(res);
  };

  getRevenueOfStoreByYear = async (req, res, next) => {
    const result = await StatisticService.getRevenueOfStoreByYear(
      req.user.user_id,
      req.query.store,
      req.query.year
    );
    return new OK({
      message: "Get revenue of store by year successfully!",
      metadata: {
        statistic: result,
      },
    }).send(res);
  };

  getRevenueOfStoreByMonth = async (req, res, next) => {
    const result = await StatisticService.getRevenueOfStoreByMonth(
      req.user.userId,
      req.query.store,
      req.query.month,
      req.query.year
    );
    return new OK({
      message: "Get revenue of store by month successfully!",
      metadata: {
        statistic: result,
      },
    }).send(res);
  };
}

module.exports = new StatisticController();
