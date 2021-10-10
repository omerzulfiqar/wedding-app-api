const { dynamoTableNames, headers } = require("../config");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  // Add validation for this in UI
  const { guestCode } = event.pathParameters;

  const params = {
    TableName: dynamoTableNames.Events,
    Key: { guestCode },
    // KeyConditionExpression: "guestCode = :guestCode",
    // ExpressionAttributeValues: {
    //   ":guestCode": guestCode,
    // },
  };

  try {
    let result = await dynamoDB.get(params).promise()
    const { Item } = result;
    console.log(Item);

    // Add validation for this in UI
    if (Object.keys(Item).length) {
      return {
        statusCode: 200,
        body: JSON.stringify(Item),
        headers,
      };
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 404,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Couldn't find events for guestCode ${guestCode}. Please check the code again.`,
      }),
    };
  }
};
