"use strict";

var fs        = require("fs");
var path      = require("path");
var logger    = require("../../web/middlewares/logger");
var Sequelize = require("sequelize");
require("sequelize-hierarchy")(Sequelize);
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || "development";
var config    = require("config");
var mysql     = config.get("mysql");

mysql["logging"] = function( sql) {
  logger.debug( sql );
};

var sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, mysql);
var db        = {};

let oldAggregate= sequelize.Model.prototype.aggregate;
sequelize.Model.prototype.aggregate = function(attribute, aggregateFunction, options){
    if(options.col){
        return oldAggregate.apply(this, [options.col, aggregateFunction, options]);
    }else{
        return oldAggregate.apply(this, [attribute, aggregateFunction, options]);
    }  
};

function initModel(filePath){
    var model = sequelize["import"](filePath);
    db[model.name] = model;
}

function readFile(fileName, dirname){
  var filePath = path.join(dirname, fileName);

  if(fileName.indexOf(".") === -1 && fs.statSync(filePath).isDirectory()){
    fs.readdirSync(filePath).forEach(function(file){
      readFile(file, filePath);
    });

  }
  else if( fileName.endsWith(".js") && (fileName !== basename)){
      initModel(filePath);
  }
}

readFile("", __dirname);

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
