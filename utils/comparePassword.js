import { compare } from 'bcrypt';

const comparePassword = (passwordAttempt, hashedPassword) => {
	return compare(passwordAttempt, hashedPassword);
};

export default comparePassword;
