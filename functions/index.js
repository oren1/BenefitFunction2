/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const { usersRouter } = require('./Routes/users.route')

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const express = require('express')
const bodyParser = require("body-parser");

const app = initializeApp();
// const db = getFirestore();


const expressApp = express();

/**
 * @param {boolean} isSuccess
 * @param {string} message
 * @param {object} data
 * @param {number} [statusCode]
 */

expressApp.response.success = function (message, data, statusCode) {
  return this.json({
    success: true,
    message: message,
    data: data,
  });
};

expressApp.response.failure = function (message, data) {
  return this.json({
    success: false,
    message: message,
    data: data,
  });
};

expressApp.use(bodyParser.json());
expressApp.use(usersRouter)


// Expose Express API as a single Cloud Function:
exports.spid = onRequest(expressApp);

