const usersQuery = require("../../databaseConnection/dbConnection");
const { hashPassword } = require("../utils/helpers");
exports.userAlreadyExistQuery = async (email = "", mobileNo = "") => {
  let values = [email, mobileNo, true];
  let query = ` SELECT "userId", "firstName", "lastName", "email", "mobileNo","password"
                FROM users
                WHERE ("email" = $1 OR "mobileNo" = $2) AND "isActive" = $3;
   `;
  const result = await usersQuery.PoolResult(query, values);
  return result.rows;
};
exports.singnUpUserQuery = async (
  firstName,
  lastName,
  email,
  mobileNo,
  password
) => {
  password = hashPassword(password);
  let values = [firstName, lastName, email, mobileNo, password];
  let query = ` INSERT INTO users ("firstName", "lastName", "email", "mobileNo", "password") 
                VALUES ($1, $2, $3, $4, $5) RETURNING "userId", "firstName", "lastName", "email", "mobileNo";
                `;
  const result = await usersQuery.PoolResult(query, values);
  return result.rows;
};

exports.updateUserQuery = async (
  firstName,
  lastName,
  email,
  mobileNo,
  password,
  isActive,
  userId
) => {
  let fieldsToUpdate = [];
  let values = [];
  let placeholderIndex = 1;

  if (firstName) {
    fieldsToUpdate.push(`"firstName" = $${placeholderIndex++}`);
    values.push(firstName);
  }

  if (lastName) {
    fieldsToUpdate.push(`"lastName" = $${placeholderIndex++}`);
    values.push(lastName);
  }

  if (email) {
    fieldsToUpdate.push(`"email" = $${placeholderIndex++}`);
    values.push(email);
  }

  if (mobileNo) {
    fieldsToUpdate.push(`"mobileNo" = $${placeholderIndex++}`);
    values.push(mobileNo);
  }
  if (isActive) {
    fieldsToUpdate.push(`"isActive" = $${placeholderIndex++}`);
    values.push(false);
  }

  if (password) {
    const hashedPassword = hashPassword(password, 10);
    fieldsToUpdate.push(`"password" = $${placeholderIndex++}`);
    values.push(hashedPassword);
  }
  fieldsToUpdate.push(`"updatedAt" = $${placeholderIndex++}`);
  values.push(`'NOW()'`);
  values.push(userId);

  let query = `UPDATE users SET ${fieldsToUpdate.join(
    ", "
  )} WHERE "userId" = $${placeholderIndex} AND "isActive" = 'true' RETURNING "firstName", "lastName", "email", "mobileNo";`;
  const result = await usersQuery.PoolResult(query, values);

  return result.rows;
};
exports.usersListQuery = async (
  firstName = null,
  email = null,
  mobileNo = null
) => {
  let values = [true];
  let conditions = [`"isActive" = $1`];
  let placeholders = 2;

  if (firstName) {
    conditions.push(`"firstName" ILIKE $${placeholders++}`);
    values.push(`%${firstName}%`);
  }

  if (email) {
    conditions.push(`"email" ILIKE $${placeholders++}`);
    values.push(`%${email}%`);
  }

  if (mobileNo) {
    conditions.push(`"mobileNo" ILIKE $${placeholders++}`);
    values.push(`%${mobileNo}%`);
  }

  let query = `
        SELECT "userId", "firstName", "lastName", "email", "mobileNo"
        FROM "users"
        WHERE ${conditions.join(" AND ")};
    `;
  const result = await usersQuery.PoolResult(query, values);
  return result.rows;
};
