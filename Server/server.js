const app = require("./app.js");
const connectDatabase = require("./Config/database.js");


{/**   added this line  from stackoverflow 

var cors = require('cors')
app.use(cors())

 */}



/**
 * *Database Connection
 */
connectDatabase()

const server = app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT)
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Server/Config/config.env" });
}
/**
 * !uncaught error
 */
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`)
  console.log(`shutting down the server due to uncaught error......`)
  server.close(() => {
    process.exit(1)
  })
})

/**
 * !unhandled promise rejection error
 */
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`)
  console.log("shutting down the server due to unhandled promise Rejection.............")
  server.close(() => {
    process.exit(1)
  })
})