const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const dynamoTableNames = {
  Events: "WeddingEvents",
  Guests: "WeddingGuests",
};

const config = {
  headers,
  dynamoTableNames,
};

module.exports = config;
