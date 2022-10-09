require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const saucesRoutes = require("./routes/saucesRoutes.js");
const usersRoutes = require("./routes/usersRoutes.js");
const helmet = require("helmet");
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

mongoose
  .connect(process.env.DB_ACCESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth/", usersRoutes);

module.exports = app;
