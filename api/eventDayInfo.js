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
    guests.forEach(async (guest, i) => {
      const { firstName, lastName, phoneNumber } = guest;
      const name = firstName + " " + lastName;
      const destinationNumber = "+1" + phoneNumber;

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

      console.log(i, `Sending info to ${name} ${destinationNumber}...`);
      const res = await sns.publish(params).promise();
      console.log(res);
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
