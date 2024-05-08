const expensesQuery = require("../../databaseConnection/dbConnection");
exports.addExpenseQuery = async (
  payeeId,
  groupId,
  amount,
  description,
  splitType,
  date = null
) => {
  const values = [payeeId, groupId, amount, description, splitType];
  let query = `INSERT INTO "expenses" ("payeeId", "groupId", "amount", "description", "splitType"`;

  if (date) {
    date = new Date(date);
    query += `, "date") VALUES ($1, $2, $3, $4, $5, $6)`;
    values.push(date);
  } else {
    query += `) VALUES ($1, $2, $3, $4, $5)`;
  }

  query += ` RETURNING "expenseId";`;
  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};

exports.settleUpExpenseQuery = async (
  payeeId,
  groupId,
  amount,
  date = null
) => {
  let values = [payeeId, groupId, amount, "record"];
  let query = `INSERT INTO "expenses" ("payeeId", "groupId", "amount", "expenseType"`;

  if (date) {
    query += `, "date") VALUES ($1, $2, $3, $4, $5)`;
    values.push(date);
  } else {
    query += `) VALUES ($1, $2, $3, $4)`;
  }

  query += ` RETURNING "expenseId";`;

  const result = await expensesQuery.PoolResult(query, values);
  return result.rows;
};

exports.addSubExpenseQuery = async (expenseId, sharedBy) => {
  const deleteValue = [expenseId];
  const deleteQuery = `DELETE FROM "subExpenses" WHERE "expenseId" = $1;`;
  await expensesQuery.PoolResult(deleteQuery, deleteValue);
  const values = [expenseId];
  const placeholders = [];

  sharedBy.forEach((item, index) => {
    const userId = item.userId;
    const amount = item.amount;

    const base = index * 2 + 2;
    placeholders.push(`($1, $${base}, $${base + 1})`);

    values.push(userId, amount);
  });

  const query = `
      INSERT INTO "subExpenses" ("expenseId", "userId", "amount")
      VALUES ${placeholders.join(", ")}
      RETURNING "subExpenseId", "userId", "amount", "expenseId";
    `;

  const result = await expensesQuery.PoolResult(query, values);
  return result.rows;
};

exports.addExpenseHistoryQuery = async (subExpenses) => {
  const values = [];
  const placeholders = [];

  subExpenses.forEach((item, index) => {
    const { subExpenseId, userId, amount, expenseId } = item;
    const start = index * 4;

    placeholders.push(
      `($${start + 1}, $${start + 2}, $${start + 3}, $${start + 4})`
    );

    values.push(subExpenseId, userId, amount, expenseId);
  });

  const query = `
      INSERT INTO "history" ("subExpenseId", "userId", "amount", "expenseId")
      VALUES ${placeholders.join(", ")}
      RETURNING "historyId";
    `;

  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};

exports.getExpenseListQuery = async (groupId) => {
  const values = [groupId];
  const query = `
  SELECT
  e."expenseId",
  e."description",
  e."splitType",
  e."expenseType",
  e."date" AS "expenseDate",
  json_build_object(
    'payeeId', e."payeeId",
    'firstName', pu."firstName",
    'lastName', pu."lastName",
    'totalAmount', e."amount"
  ) AS "payee",
  json_agg(
    json_build_object(
      'subExpenseId', se."subExpenseId",
      'userId', se."userId",
      'firstName', u."firstName",
      'lastName', u."lastName",
      'amount', se."amount"
    )
  ) AS "subExpenses"
FROM
  "expenses" AS e
INNER JOIN
  "subExpenses" AS se ON se."expenseId" = e."expenseId"
INNER JOIN 
  "users" as u ON u."userId" = se."userId"
INNER JOIN 
  "users" as pu ON pu."userId" = e."payeeId"
WHERE
  e."groupId" = $1
  AND se."isActive" = true
GROUP BY
  e."expenseId",
  e."description",
  e."splitType",
  e."expenseType",
  pu."firstName",
  pu."lastName",
  e."date"
ORDER BY
  e."date" DESC;
  `;
  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};
exports.getAmountQuery = async (groupId) => {
  const values = [groupId];
  const query = `
  SELECT
  e."expenseId",
  e."description",
  e."splitType",
  e."expenseType",
  e."date" AS "expenseDate",
  json_build_object(
    'payeeId', e."payeeId",
    'firstName', pu."firstName",
    'lastName', pu."lastName",
    'totalAmount', e."amount"
  ),
  json_agg(
    json_build_object(
      'subExpenseId', se."subExpenseId",
      'userId', se."userId",
      'firstName', u."firstName",
      'lastName', u."lastName",
      'amount', se."amount"
    )
  ) AS "subExpenses"
FROM
  "expenses" AS e
INNER JOIN
  "subExpenses" AS se ON se."expenseId" = e."expenseId"
INNER JOIN 
  "users" as u ON u."userId" = se."userId"
INNER JOIN 
  "users" as pu ON pu."userId" = e."payeeId"
WHERE
  e."groupId" = $1
  AND se."isActive" = true
GROUP BY
  e."expenseId",
  e."description",
  e."splitType",
  e."expenseType",
  pu."firstName",
  pu."lastName",
  e."date"
ORDER BY
  e."date" DESC;
  `;
  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};
exports.checkIsExpenseExistsQuery = async (expenseId) => {
  const values = [expenseId];
  const query = `
    SELECT * from expenses 
    where "expenseId" = $1;
  `;
  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};
exports.deleteExpenseQuery = async (expenseId) => {
  const values = [expenseId];
  const query = `
    DELETE from expenses 
    where "expenseId" = $1;
  `;
  const result = await expensesQuery.PoolResult(query, values);

  return result.rows;
};
exports.updateExpenseQuery = async (
  payeeId,
  groupId,
  amount,
  description,
  splitType,
  date,
  expenseId
) => {
  let query = `UPDATE "expenses" SET`;
  const values = [];
  let valueIndex = 1;

  const updateClauses = [];

  const updateFields = {
    payeeId,
    groupId,
    amount,
    description,
    splitType,
    date,
  };

  for (const [key, value] of Object.entries(updateFields)) {
    if (value !== undefined) {
      updateClauses.push(`"${key}" = $${valueIndex}`);
      values.push(value);
      valueIndex++;
    }
  }

  query += ` ${updateClauses.join(", ")}`;

  query += ` WHERE "expenseId" = $${valueIndex} RETURNING "expenseId";`;
  values.push(expenseId);

  const result = await expensesQuery.PoolResult(query, values);
  return result.rows;
};
exports.dashboardExpenseQuery = async (userId) => {
  const query = `
  WITH user_expense_ids AS (
    SELECT DISTINCT "expenseId"
    FROM "subExpenses"
    WHERE "userId" = $1
),
user_payee_expense_ids AS (
    SELECT "expenseId"
    FROM "expenses"
    WHERE "payeeId" = $1
),
all_related_expense_ids AS (
    SELECT "expenseId" FROM user_expense_ids
    UNION
    SELECT "expenseId" FROM user_payee_expense_ids
)

SELECT 
    e."expenseId",
    e."amount" AS "expenseAmount",
    e."expenseType",
    json_build_object(
        'payeeId', e."payeeId",
        'firstName', pu."firstName",
        'lastName', pu."lastName"
    ) AS "payee",
    json_agg(
        json_build_object(
            'userId', se."userId",
            'firstName', u."firstName",
            'lastName', u."lastName",
            'subExpenseId', se."subExpenseId",
            'amount', se."amount"
        )
    ) AS "subExpenses"
FROM 
    "expenses" e
INNER JOIN 
    "subExpenses" se
ON 
    e."expenseId" = se."expenseId"
INNER JOIN 
    "users" u
ON 
    u."userId" = se."userId"
INNER JOIN 
    "users" pu
ON 
    e."payeeId" = pu."userId"
WHERE 
    e."expenseId" IN (
        SELECT "expenseId" 
        FROM "expenses"
    )
GROUP BY 
    e."expenseId", 
    e."amount", 
    e."expenseType", 
    pu."firstName", 
    pu."lastName", 
    e."payeeId"
  `;

  const result = await expensesQuery.PoolResult(query, [userId]);
  return result.rows;

 
  return data;
};

