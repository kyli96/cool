"use strict";
const express = require("express");
const router = express.Router();
const fs        = require("fs");
const path      = require("path");
const basename  = path.basename(module.filename);
const exec = require("child_process").exec;

router.get("/api/ping", function(req, res) {
    res.status(200).send("pong!");
});

module.exports = function (app) {

    app.use("/", router);

    function requireFile(filePath) {
        const routers = require(filePath);
        routers(app);
    }

    function readFile(fileName, dirname){
        const filePath = path.join(dirname, fileName);

        if(fileName.indexOf(".") === -1 && fs.statSync(filePath).isDirectory()) {
            fs.readdirSync(filePath)
                .forEach(function(file){
                    readFile(file, filePath);
                });
        }
        else if (fileName.endsWith(".js") && (fileName !== basename)) {
            requireFile(filePath);
        }
    }

    readFile("", __dirname);
};
