const { dynamoTableNames, headers } = require("../config");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const sns = new AWS.SNS();
sns.setSMSAttributes({
  attributes: {
    DefaultSMSType: "Promotional",
  },
});

module.exports.handler = async (event) => {
  // Form data from client request
  const {
    firstName,
    lastName,
    eventAttendance,
    numberOfGuests,
    phoneNumber,
    guestCode,
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
    createdTs: new Date().toISOString(),
    updatedTs: new Date().toISOString(),
  };

  // Saving to DB
  try {
    const params = {
      TableName: dynamoTableNames.Guests,
      Item: Item,
      ReturnValuesOnConditionCheckFailure: "ALL_OLD",
    };

    await dynamoDB.put(params).promise();
    console.log(`Creating RSVP: ${JSON.stringify(Item)}`);
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

  // Sending the sms
  try {
    const destinationNumber = "+1" + phoneNumber;
    console.log("Sending sms to: ", destinationNumber);
    const message =
      "Thank you for submitting your RSVP for Omer's & Kayanat's wedding. Make sure to go to the events info page and save our events to your calendar. We look forward to seeing you there!";
    const params = {
      Message: message,
      MessageStructure: "String",
      PhoneNumber: destinationNumber,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "Rsvp-Bot",
        },
      },
    };

    await sns.publish(params).promise();
  } catch (error) {
    console.log("Error sending text message");
    console.log(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(Item),
    headers,
  };
};
