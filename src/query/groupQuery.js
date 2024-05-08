const groupQuery = require("../../databaseConnection/dbConnection");

exports.createGroupQuery = async (groupName) => {
  const values = [groupName];

  const query = `
        INSERT INTO "group" ("groupName")
        VALUES ($1)
        RETURNING "groupId";
        `;
  const result = await groupQuery.PoolResult(query, values);
  return result.rows;
};
exports.updateGroupQuery = async (groupId, groupName) => {
  const values = [groupName, groupId];

  const query = `
        UPDATE "group"
        SET "groupName" = $1
        WHERE "groupId" = $2
        RETURNING "groupId";
        `;
  const result = await groupQuery.PoolResult(query, values);

  return result.rows;
};
exports.deleteGroupQuery = async (groupId) => {
  const values = [groupId];

  const query = `
        DELETE from "group"
        WHERE "groupId" = $1;
        `;
  const result = await groupQuery.PoolResult(query, values);

  return result.rows;
};

exports.checkGroupExistsQuery = async (groupId) => {
  const values = [groupId];
  const query = `   SELECT *
                    FROM "group"
                    WHERE "groupId" = $1;`;
  const result = await groupQuery.PoolResult(query, values);
  return result.rows;
};
exports.groupListQuery = async (userId) => {
  const values = [userId];
  const query = `  
                    WITH groups_with_member AS (
                        SELECT "groupId"
                        FROM "groupMembers"
                        WHERE "memberId" = $1
                    )
                    SELECT
                    g."groupId",
                    g."groupName",
                    json_agg(
                    json_build_object(
                        'memberId', gm."memberId",
                        'firstName', u."firstName",
                        'lastName', u."lastName"
                        )
                        ) AS members
                        FROM
                          "groupMembers" AS gm
                    INNER JOIN
                        "groups_with_member" AS gwm ON gm."groupId" = gwm."groupId"
                    INNER JOIN
                        "users" AS u ON u."userId" = gm."memberId"
                    INNER JOIN
                        "group" AS g ON g."groupId" = gm."groupId"
                    GROUP BY
                        g."groupId",
                        g."groupName"
                    ORDER BY
                        g."groupName",
                        g."groupId";
                    `;
  const result = await groupQuery.PoolResult(query, values);
  return result.rows;
};

exports.membersQuery = async (groupId, groupMembers) => {
  const deleteQuery = `
      DELETE FROM "groupMembers"
      WHERE "groupId" = $1;
    `;
  const deleteValues = [groupId];
  await groupQuery.PoolResult(deleteQuery, deleteValues);

  if (groupMembers.length > 0) {
    const insertValues = [groupId];
    const placeholders = [];
    groupMembers.forEach((userId, index) => {
      const base = index + 2;
      placeholders.push(`($1, $${base})`);
      insertValues.push(userId);
    });

    const insertQuery = `
        INSERT INTO "groupMembers" ("groupId", "memberId")
        VALUES ${placeholders.join(", ")}
        RETURNING "groupId", "memberId";
      `;
    const result = await groupQuery.PoolResult(insertQuery, insertValues);
    return result.rows;
  }

  return [];
};
