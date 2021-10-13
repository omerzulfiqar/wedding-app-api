const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { headers, dynamoTableNames } = require("../config");

module.exports.handler = async (event) => {
  const { firstName, lastName } = event.queryStringParameters;
  const { guestId } = event.pathParameters;
  console.log(`Getting RSVP record for ${guestId}`);

  //   Check to see if first and last name are not empty
  // Add this validation to UI
  if (!firstName.length || !lastName.length) {
    return {
      statusCode: 400,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Missing entries for firstName or lastName or both",
      }),
    };
  }

  const params = {
    TableName: dynamoTableNames.Guests,
    Key: {
      guestId,
      SK: firstName,
    },
  };

  try {
    let result = await dynamoDb.get(params).promise();
    const { Item } = result;

    // If the user enters a incorrect first and lastname combination but the guestId matches an entry, error should be thrown
    if (!Object.keys(Item).length) {
      throw new Error();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 404,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Couldn't find RSVP record for ${firstName} ${lastName}`,
      }),
    };
  }
};
