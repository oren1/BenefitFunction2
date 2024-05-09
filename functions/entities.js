class User {
    userId;
    benefitExpirationDate;
  
    constructor(userId, benefitExpirationDate) {
     this.userId = userId
     this.benefitExpirationDate = benefitExpirationDate
    }
    toString() {
      return `User ${this.userId} has benefit expiration date ${this.benefitExpirationDate}`;
    }
}
  
  // Firestore data converter
exports.userConverter = {
    toFirestore: (user) => {
      return {
        userId: user.userId,
        benefitExpirationDate: user.benefitExpirationDate,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new User(data.userId, data.benefitExpirationDate);
    },
  };

exports.BenefitStatus = {
	NotInvoked: "notInvoked",
	Entitled: "entitled",
	Expired: "expired",
}

exports.ResponseKeys = {
    Success: "success",
    Message: "message",
    Data: "data"
}