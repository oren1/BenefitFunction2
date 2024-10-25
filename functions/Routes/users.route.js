const { Router } = require("express");
const { BenefitStatus, userConverter } = require('../entities')
const { getUser } = require("../Services/users.service");
const { getBenefitStatusByUserId } = require("../Services/benefits.service");
const { toTimestamp } = require('../utils')
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions/v2");

const usersRouter = Router();


usersRouter.post('/users', async (req, res, next) => {
    // Grab the userId parameter.
    const userId = req.body.userId;
    const benefitExpirationDate = new Date();
    benefitExpirationDate.setMonth(benefitExpirationDate.getMonth() + 3);
    // benefitExpirationDate.setMinutes(benefitExpirationDate.getMinutes() + 3)

    // Create a new user with id and expiration date for the benefit
    try {
        // check to see if the user already exists
        const user = await getUser(userId)

        if (user == null) { // User doesn't exist
            let startTime = Date.now()
            const userRef = await getFirestore()
                .collection("users")
                .withConverter(userConverter)
                .add({
                    userId: userId,
                    benefitExpirationDate: toTimestamp(benefitExpirationDate)
                });

            let requestTime = Date.now() - startTime
            logger.info("Create User  - Request Time", requestTime)

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
        logger.info("Create User  - Error", error.message)
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
        logger.info("Get User  - Error", error.message)
        res.failure(error.message, {})
    }
})

module.exports = {
    usersRouter
}