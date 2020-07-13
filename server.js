const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
// load routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(cors());

// bodyParser middleWare
// app.use(bodyParser.urlencoded({ extended: false }));

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// // connect to DB
// const db = require("./config/keys").MONGO_URI;
// mongoose
//   .connect(db, {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//   })
//   .then(() => console.log("mongoDB connected.."))
//   .catch((err) => console.log(err.message));

// passport  middleware
app.use(passport.initialize());

// require config
require("./config/passport")(passport);

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

// use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.port || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));
