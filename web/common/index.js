"use strict";

const _ = require("underscore");
const constant = require("./constant");
const logger = require("../middlewares/logger");
const moment = require("moment");
const Promise = require("bluebird");

const success = function (data) {
    const result = {type: "success"};
    if (data || data === 0) {
        result.data = data;
    }
    return result;
};

const error = function (str, state) {
    if (!str) {
        str = "Not Found";
    }
    const err = new Error(str);
    err.statusCode = state || 500;
    return err;
};

exports._ = _;
exports.constant = constant;
exports.error = error;
exports.logger = logger;
exports.moment = moment;
exports.success = success;