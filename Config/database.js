const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://dimvaji:dimvaji12345@cluster0.wmfkr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    )
    .then((data) => {
      console.log(`Database Connected To ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
