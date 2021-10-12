const { dynamoTableNames, headers } = require("../config");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  // Form data from client request
  const {
    firstName,
    lastName,
    eventAttendance,
    numberOfGuests,
    phoneNumber,
    guestCode
  } = JSON.parse(event.body);

  // Setting guestId and SK
  let guestId, SK;

  // Add form validation for first name and last name to UI
  guestId = firstName.charAt(0).toLowerCase() + lastName;
  SK = firstName;

  // New RSVP entry item
  const Item = {
    guestId,
    SK,
    firstName,
    lastName,
    eventAttendance,
    numberOfGuests,
    phoneNumber,
    guestCode,
    allowedEvents,
    createdTs: new Date().toISOString(),
    updatedTs: new Date().toISOString(),
  };

  const params = {
    TableName: dynamoTableNames.Guests,
    Item: Item,
    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
  };

  try {
    await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(Item),
      headers,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers: {
        ...headers,
        "Content-type": "text/plain",
      },
      body: JSON.stringify({
        message: `Couldn't create new RSVP entry for ${firstName} ${lastName}.`,
      }),
    };
  }
};
