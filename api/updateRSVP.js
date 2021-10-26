const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { headers, dynamoTableNames } = require("../config");

const getGuestRSVP = require("./getGuestRSVP").handler;

module.exports.handler = async (event) => {
  const { guestId } = event.pathParameters;

  console.log(`Updating RSVP entry for ${guestId}`);

  const getEntryRes = await getGuestRSVP(event);

  if (getEntryRes.statusCode !== 200) {
    return getEntryRes;
  }

  const Item = JSON.parse(getEntryRes.body);
  console.log("Before Update: ", Item);

  // Update fields in place
  try {
    updateFieldsInPlace(JSON.parse(event.body), Item);
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        ...headers,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        message: `Error updating RSVP entry for ${guestId}`,
        error: error,
      }),
    };
  }

  console.log("After Update: ", Item);

  const params = {
    TableName: dynamoTableNames.Guests,
    Item,
  };

  // Update in Dynamo
  try {
    await dynamoDb.put(params).promise();
    console.log("Updating now...");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Successfully update RSVP entry",
        item: Item,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 501,
      headers: {
        ...headers,
        "Content-Type": "text/plain",
      },
      body: `Error updating RSVP entry for ${guestId}`,
    };
  }
};

const updateFieldsInPlace = (body, Item) => {
  const fieldsToUpdate = Object.keys(body);
  fieldsToUpdate.map((field) => {
    Item[field] = body[field];
  });

  Item.updatedTs = new Date().toISOString();
};
