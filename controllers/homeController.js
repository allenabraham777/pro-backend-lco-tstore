const BigPromise = require("../middlewares/bigPromise")


module.exports.home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from API"
  })
})