"use strict";
const mongoose = require("mongoose");
const uri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.DBCLUSTER}/${process.env.DBNAME}`;

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(uri, {
        maxPoolSize: 50,
      })
      .then((res) => {
        console.log("Connect database successfully!");
      })
      .catch((err) => {
        console.log("Error Connect!");
      });
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const DBInstance = Database.getInstance();
module.exports = DBInstance;
