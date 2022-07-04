import { hash, genSalt } from "bcrypt";

export const saltRounds = 10;
export const passwordAlgorithm = 'SHA256';
const hashPassword = async (password) => {
  // Generate a salt at level 10 strength
  const salt = await genSalt(saltRounds);
  return hash(password, salt);
};

export default hashPassword;
