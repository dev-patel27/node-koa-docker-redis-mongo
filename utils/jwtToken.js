import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "config/.env" });

const secret = process.env.SECRETKEY;

const generateJWTToken = (id) => {
  return sign({ sub: id }, secret);
};

const verifyJWTToken = (token) => {
  return verify(token, secret);
};

export default { verifyJWTToken, generateJWTToken };
