const { OK, CREATED } = require("../core/success.response");
const VoucherService = require("../services/voucher.service");

class VoucherController {
  getAllVouchers = async (req, res, next) => {
    const { type, store, user, sort, search } = req.query;
    const vouchers = await VoucherService.getAllVouchers({
      filter: { type, store, user },
      sort,
      search,
    });

    return new OK({
      message: "Get all vouchers successfully!",
      metadata: {
        vouchers,
      },
    }).send(res);
  };

  createVoucher = async (req, res, next) => {
    const voucher = await VoucherService.createVoucher({
      body: {
        ...req.body,
        storeId: req.body.store,
        userId: req.user.userId,
      },
      file: req.file,
    });
    return new CREATED({
      message: "Create voucher successfully!",
      metadata: { voucher },
    }).send(res);
  };
}

module.exports = new VoucherController();
