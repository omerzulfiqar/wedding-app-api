const { dynamoTableNames, headers } = require("../config");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const params = {
    TableName: dynamoTableNames.Guests,
  };

  try {
    let result = await dynamoDB.scan(params).promise();
    const { Items } = result;
    if (Items.length) {
      return {
        statusCode: 200,
        body: JSON.stringify(Items),
        headers,
      };
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Couldn't retrieve guests.`,
      }),
    };
  }
};
