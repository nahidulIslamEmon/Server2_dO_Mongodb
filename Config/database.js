const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
          "mongodb+srv://dimvaji1234:WP6jMYYOyYrLAzEr@dimvaji.wrasz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

    )
    .then((data) => {
      console.log(`Database Connected To ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
