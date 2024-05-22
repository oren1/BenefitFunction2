const { Router } = require("express");
const {BenefitStatus, userConverter} = require('../entities')
const { getUser } = require("../Services/users.service");
const { getBenefitStatusByUserId } = require("../Services/benefits.service");
const { toTimestamp } = require('../utils')
const {getFirestore} = require("firebase-admin/firestore");

const usersRouter = Router();


usersRouter.post('/users', async (req, res, next) => {
    // Grab the userId parameter.
    const userId = req.body.userId;
    const benefitExpirationDate = new Date();
    benefitExpirationDate.setMonth(benefitExpirationDate.getMonth() + 1);

    // Create a new user with id and expiration date for the benefit
    try {
        // check to see if the user already exists
        const user = await getUser(userId)

        if (user == null) { // User doesn't exist
            const userRef = await getFirestore()
            .collection("users")
            .withConverter(userConverter)
            .add({userId: userId,
                benefitExpirationDate: toTimestamp(benefitExpirationDate)});
                
            res.success("User Created Successfully", 
            {
                userId: userId,
                benefitStatus: BenefitStatus.Entitled
            })
        }
        else {
            res.failure("User Alreafy Exists", {})
        }


    } catch (error) {
        res.failure(error.message, {})
    }
});

usersRouter.get('/users/:userId/benefitstatus', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const status = await getBenefitStatusByUserId(userId)

        res.success("Benefit Status Fetched Successfully",
        {
            userId: userId,
            benefitStatus: status   
        })
    } catch (error) {
        res.failure(error.message,{})
    }
})

module.exports = {
    usersRouter
}