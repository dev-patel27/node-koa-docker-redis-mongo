const Crypto = require("crypto");

const generateRandomString = (size = 10) => {
  return Crypto.randomBytes(size).toString("base64").slice(0, size);
};

export default generateRandomString;
