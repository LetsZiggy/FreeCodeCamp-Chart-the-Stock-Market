const https = require('https');
const qs = require('querystring');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

// Add here

module.exports = router;
