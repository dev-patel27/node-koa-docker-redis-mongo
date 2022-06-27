import { sign, verify } from "jsonwebtoken";
require("dotenv").config({ path: "src/config/.env" });

const secret = process.env.SECRETKEY;

const generateJWTToken = (id) => {
  return sign({ sub: id }, secret);
};

const verifyJWTToken = (token) => {
  return verify(token, secret);
};

export default { verifyJWTToken, generateJWTToken };
