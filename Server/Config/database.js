const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.connect(process.env.DB_URI).then((data) => {
    console.log(`Database Connected To ${data.connection.host}`);
  });
};

module.exports = connectDatabase;
