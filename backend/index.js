const express = require("express");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");

const {handleSubscription, sendPushNotification} = require('./subscription')

const app = express();

app.use(cors())
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post("/subscription", handleSubscription);
app.get("/subscription/:id", sendPushNotification);

const port = process.env.PORT || 3001;
const host = process.env.HOSTNAME || "0.0.0.0";

// Launch Node.js server
const server = app.listen(port, host, () => {
  console.log(`Node.js API server is listening on http://${host}:${port}/`);
});
