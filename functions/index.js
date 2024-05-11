/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");


// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const express = require('express')
const bodyParser = require("body-parser");

const {ResponseKeys ,BenefitStatus, userConverter} = require('./entities')

const app = initializeApp();
const db = getFirestore();

const toTimestamp = date => Math.floor(date.getTime() / 1000);

const {Success, Message, Data} = ResponseKeys

const expressApp = express();
expressApp.use(bodyParser.json());

expressApp.post('/createUser', async (req, res) => {
    // Grab the text parameter.
    const userId = req.body.userId;
    const benefitExpirationDate = new Date();
    benefitExpirationDate.setMonth(benefitExpirationDate.getMonth() + 1);

    // Create a new user with id and expiration date for the benefit
    try {
        const userRef = await getFirestore()
        .collection("users")
        .withConverter(userConverter)
        .add({userId: userId,
            benefitExpirationDate: toTimestamp(benefitExpirationDate)});
        const user = await userRef.get() 
            
        
        res.json({
            [Success]: true,
            [Message]: "User Created Successfully",
            [Data]: {
                userId: user.data().userId,
                benefitExpirationDate: user.data().benefitExpirationDate
                }   
        })

    } catch (error) {
        res.json({
            [Success]: false,
            [Message]: error.message,
            [Data]: {}
        })
    }
});

expressApp.post('/benefitStatusForUser', async (req, res) => {
    const userId = req.body.userId;
    try {
         const querySnapshot = await getFirestore()
         .collection("users")
         .withConverter(userConverter)
         .where('userId', '==', userId)
         .get()
         
         let benefitStatus;
         let user;
 
         if (querySnapshot.docs.length == 0) { // User doesn't exist
             benefitStatus = BenefitStatus.NotInvoked
         }
         else {
             user = querySnapshot.docs[0]
             let now = toTimestamp(new Date()) 
             if (now > user.data().benefitExpirationDate) {
                 benefitStatus = BenefitStatus.Expired
             }
             else {
                 benefitStatus = BenefitStatus.Entitled
             }
             
         } 

         res.json({
             [Success]: true,
             [Message]: "Benefit Status Fetched Successfully",
             [Data]: {
                 userId: userId,
                 benefitStatus: benefitStatus
                 }   
         })
    } catch (error) {
     res.json({
         [Success]: false,
         [Message]: error.message,
         [Data]: {}
     })
    }
})

// Expose Express API as a single Cloud Function:
exports.spid = onRequest(expressApp);

