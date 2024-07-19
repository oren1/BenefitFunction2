const { getFirestore } = require("firebase-admin/firestore");
const { userConverter } = require("../entities");
const { logger } = require("firebase-functions/v2");
const toTimestamp = date => Math.floor(date.getTime() / 1000);

const createUser = async (userId, benefitExpirationDate) => {
  const startTime = Date.now()

  benefitExpirationDate.setMonth(benefitExpirationDate.getMonth() + 1);

  let user = {
    userId: userId,
    benefitExpirationDate: toTimestamp(benefitExpirationDate),
  }
  // Create a new user with id and expiration date for the benefit
  const userRef = await getFirestore()
    .collection("users")
    .withConverter(userConverter)
    .add(user);
  // const user = await userRef.get();
  const requestTime = Date.now() - startTime
  logger.info("getUser - Request Time", requestTime)
  return user.data();
};

const getUser = async (userId) => {
  const startTime = Date.now()
  const querySnapshot = await getFirestore()
    .collection("users")
    .withConverter(userConverter)
    .where('userId', '==', userId)
    .get()

  const requestTime = Date.now() - startTime
  logger.info("getUser - Request Time", requestTime)
  if (querySnapshot.docs.length == 0) { // User doesn't exist
    return null
  }
  return querySnapshot.docs[0]
}

module.exports = {
  createUser,
  getUser
};
