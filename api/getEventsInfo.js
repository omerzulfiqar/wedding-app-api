const { dynamoTableNames, headers } = require("../config");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const { guestCode } = event.pathParameters;

  const params = {
    TableName: dynamoTableNames.Events,
    KeyConditionExpression: "guestCode = :guestCode",
    ExpressionAttributeValues: {
      ":guestCode": guestCode,
    },
  };

  try {
    let result = await dynamoDB.query(params).promise();
    const { Items } = result;

    if (Items.length) {
      return {
        statusCode: 200,
        body: JSON.stringify(Items),
        headers,
      };
    } else {
      throw "Couldn't find info for guest code.";
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 404,
      headers: {
        ...headers,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        message: `Couldn't find events for guestCode ${guestCode}. Please check the code again.`,
      }),
    };
  }
};
