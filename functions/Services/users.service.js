const { getFirestore } = require("firebase-admin/firestore");
const { userConverter } = require("../entities");
const toTimestamp = date => Math.floor(date.getTime() / 1000);

const createUser = async (userId, benefitExpirationDate) => {
  benefitExpirationDate.setMonth(benefitExpirationDate.getMonth() + 1);

  // Create a new user with id and expiration date for the benefit
  const userRef = await getFirestore()
    .collection("users")
    .withConverter(userConverter)
    .add({
      userId: userId,
      benefitExpirationDate: toTimestamp(benefitExpirationDate),
    });
  const user = await userRef.get();

  return user.data();
};

const getUser = async (userId) => {
    const querySnapshot = await getFirestore()
    .collection("users")
    .withConverter(userConverter)
    .where('userId', '==', userId)
    .get()

    if (querySnapshot.docs.length == 0) { // User doesn't exist
        return null
    }
    return querySnapshot.docs[0]
}

module.exports = {
  createUser,
  getUser
};
