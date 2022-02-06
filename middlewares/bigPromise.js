const CustomError = require("../utils/customError");

module.exports = func => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(error => {
    console.log("==================")
    console.error(error);
    if(error instanceof CustomError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      next(error);
    }
  });