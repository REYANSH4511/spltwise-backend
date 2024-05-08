const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};

async function getUserData(userId, expenses) {
  let totalYouOwe = 0;
  let totalDueToYou = 0;

  let friendsYouOwe = [];
  let friendsWhoOweYou = [];

  const friendsOweMap = new Map();
  const friendsDueMap = new Map();

  // Loop through each expense
  for (const expense of expenses) {
    const { expenseType, payee, subExpenses } = expense;

    if (expenseType === "expense") {
      if (payee.payeeId === userId) {
        subExpenses.forEach((sub) => {
          if (sub.userId !== userId) {
            totalDueToYou += sub.amount;
            const friendName = `${sub.firstName} ${sub.lastName}`;

            friendsDueMap.set(
              friendName,
              (friendsDueMap.get(friendName) || 0) + sub.amount
            );
          }
        });
      } else {
        subExpenses.forEach((sub) => {
          if (sub.userId === userId) {
            totalYouOwe += sub.amount;
            const friendName = `${payee.firstName} ${payee.lastName}`;

            friendsOweMap.set(
              friendName,
              (friendsOweMap.get(friendName) || 0) + sub.amount
            );
          }
        });
      }
    } else if (expenseType === "record") {
      if (payee.payeeId === userId) {
        subExpenses.forEach((sub) => {
          if (sub.userId !== userId) {
            totalDueToYou += sub.amount;
            const friendName = `${sub.firstName} ${sub.lastName}`;

            friendsDueMap.set(
              friendName,
              (friendsDueMap.get(friendName) || 0) + sub.amount
            );
          }
        });
      }
    }
  }

  friendsYouOwe = Array.from(friendsOweMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  friendsWhoOweYou = Array.from(friendsDueMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  const totalBalance = totalDueToYou - totalYouOwe;
  return {
    totalBalance,
    totalYouOwe,
    totalDueToYou,
    friendsYouOwe,
    friendsWhoOweYou,
  };
}


// let totalBalance = 0;
// result.forEach((expense) => {
//   if (expense.expenseType === "expense") {
//     expense.subExpenses.forEach((sub) => {
//       if (expense.payee.payeeId == userId) {
//         if (sub.userId == userId) {
//           totalBalance -= sub.amount;
//         }
//         totalBalance += sub.amount;
//       } else {
//         if (sub.userId == userId) {
//           totalBalance += sub.amount;
//         }
//       }
//     });
//   } else if (expense.expenseType === "record") {
//     expense.subExpenses.forEach((sub) => {
//       if (sub.userId == userId) {
//         totalBalance -= sub.amount;
//       }
//     });
//   }
// });
