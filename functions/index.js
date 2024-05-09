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
const {ResponseKeys ,BenefitStatus, userConverter} = require('./entities')

const app = initializeApp();
const db = getFirestore();

const toTimestamp = date => Math.floor(date.getTime() / 1000);

const {Success, Message, Data} = ResponseKeys

exports.createUser = onRequest(async (req, res) => {
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
            
        // Send back a message that we've successfully written the message
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

exports.benefitStatusForUser = onRequest(async (req, res) => {
    // Grab the text parameter.
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
            console.log(benefitStatus)
        }
        else {
            user = querySnapshot.docs[0]
            let now = toTimestamp(new Date()) 
            console.log(now)
            if (now > user.data().benefitExpirationDate) {
                benefitStatus = BenefitStatus.Expired
                console.log(benefitStatus)
            }
            else {
                benefitStatus = BenefitStatus.Entitled
                console.log(benefitStatus)
            }
            
        } 
        // Send back a message that we've successfully written the message
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
    

});

