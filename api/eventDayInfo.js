const { headers } = require("../config");
const AWS = require("aws-sdk");

const sns = new AWS.SNS();
sns.setSMSAttributes({
  attributes: {
    DefaultSMSType: "Promotional",
  },
});

module.exports.handler = async (event) => {
  const { message, guests } = JSON.parse(event.body);
  try {
    guests.forEach(async (guest) => {
      const { name, phone } = guest;
      const destinationNumber = "+1" + phone;
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
      console.log(`Sending event day info to ${name}...`);
      await sns.publish(params).promise();
    });
  } catch (error) {
    console.log(`Error sending event day info text...`);
    console.log(error);
  }

  return {
    statusCode: 200,
    body: "Messages successfully sent!",
    headers,
  };
};
