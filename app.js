const express = require("express");
const app = express();
const errorMiddleWare = require("./Middleware/error.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const path = require("path");
const connectDatabase = require("./Config/database.js");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
app.use(cors());

connectDatabase();

//env
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Config/config.env" });
}

//route imports
const product = require("./Routes/productroute.js");
const user = require("./Routes/userRoute.js");
const order = require("./Routes/orderRoutes.js");
const payment = require("./Routes/paymentRoute.js");

// use routes for API
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// Serve static files (build) from the 'client/build' directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Define a catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// middleware for error
app.use(errorMiddleWare);

module.exports = app;
