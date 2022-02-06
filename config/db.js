const mongoose = require('mongoose');

const connectDB = () => {
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log("DB Connected Successfully"))
  .catch(error=>{
    console.error("DB Connection failed");
    console.error(error);
    process.exit(1);
  })
}

module.exports = connectDB;