const { getUser } = require("./users.service")
const { BenefitStatus } = require('../constants')
const {toTimestamp} = require('../utils')

const getBenefitStatusByUserId = async (userId) => {
    const user = await getUser(userId)
    if (user == null) {
        return BenefitStatus.NotInvoked
    }
    else {
        let now = toTimestamp(new Date()) 
         if (now > user.data().benefitExpirationDate) {
             return BenefitStatus.Expired
         }
         else {
             return BenefitStatus.Entitled
         }
    }
}

module.exports = {
    getBenefitStatusByUserId
}