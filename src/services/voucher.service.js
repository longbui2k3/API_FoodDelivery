const {
  getAllVouchers,
  createVoucher,
} = require("../models/repositories/voucher.repo");

class VoucherService {
  static async getAllVouchers({ filter, sort, search }) {
    return await getAllVouchers({ filter, sort, search });
  }

  static async createVoucher({ body, file }) {
    return await createVoucher(body, file);
  }
}
module.exports = VoucherService;
