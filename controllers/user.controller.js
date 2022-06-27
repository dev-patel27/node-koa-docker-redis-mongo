import { userModel } from "../models";
import { userRepository } from "../repositories";
import { hashPassword, comparePassword, jwtToken, sendMail } from "../utils";

const signup = async (req, res) => {
  try {
    let { body } = req;
    const { password, name, email } = body;
    let message;
    const query = { orQuery: true, name, email };

    const checkExistingUser = await userRepository.userQuery(query);

    if (checkExistingUser) throw new Error("User Credentials Already In Use");

    const hashed = await hashPassword(password);

    const data = {
      ...body,
      password: hashed,
    };

    const user = new userModel(data);
    const saveUser = await user.save();

    if (!saveUser) throw new Error("Error While Saving User");
    saveUser &&
      res.status(200).send({
        success: true,
        message,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { body } = req;
    const { email, password } = body;

    const checkUser = await userRepository.userQuery({ email });

    if (!checkUser)
      throw new Error(
        `The email you've entered does not belong to an account. Please Register with Us.`
      );

    if (checkUser) {
      const { _id, first_name, last_name } = checkUser;

      const verifyPassword = await comparePassword(
        password,
        checkUser.password
      );

      if (!verifyPassword) throw new Error("Email or Password is incorrect");

      const token = jwtToken.generateJWTToken(_id);
      verifyPassword &&
        res.status(200).send({
          success: true,
          data: { token },
          message: `${first_name} ${last_name} Login Successfully`,
        });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { query } = req;
    const { totalCount, users } = await userRepository.findAllQuery(query);

    res.status(200).send({
      success: true,
      data: users,
      totalCount,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const updateUsers = async (req, res) => {
  try {
    const { body } = req;
    const { _id } = body;

    const filter = { _id };
    const update = { ...req.body };

    const updateUser = await userRepository.userFindOneUpdateQuery(
      filter,
      update
    );

    res.status(200).send({
      success: true,
      data: updateUser,
      message: "User Updated Successfully.",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const {
      body,
      currentUser: { _id, password: userPassword },
    } = req;
    const { password, newPassword } = body;

    const verifyPassword = await comparePassword(password, userPassword);
    if (!verifyPassword) throw new Error("Current Password is incorrect");

    const hashed = await hashPassword(newPassword);

    const filter = { _id };
    const update = { password: hashed };

    await userRepository.updateOneQuery(filter, update);

    res.status(200).send({
      success: true,
      message: "Password Updated Successfully.",
    });
  } catch (error) {
    errorLogger(error.message, req.originalUrl);
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUser = await userRepository.userQuery({ email });

    if (!checkUser) throw new Error("User Not Found With That Email");

    if (checkUser) {
      const token = generateRandomString(10, "url-safe");

      const date = new Date();
      const expTime = date.getTime() + 60000; // 10 Min

      const filter = { email };
      const update = { token, expTime };

      await userRepository.updateOneQuery(filter, update);

      const html = `Click here to Reset Password :
				${process.env.HOST}?token=${token}
				Link will expire in 10 min`;

      const sendEmail = await sendMail(
        email,
        process.env.SENDGRID_EMAIL,
        "RESET PASSWORD",
        html
      );
      const sendGridErrors = get(sendEmail, ["errors"], []);
      if (sendGridErrors.length) {
        const error = sendGridErrors.map((err) => err.message);
        throw new Error(`SendGrid Error: ${error}`);
      }
      res.status(200).send({
        success: true,
        message: `Password Reset Link Sent Successfully at ${email}`,
      });
    }
  } catch (error) {
    errorLogger(error.message, req.originalUrl);
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const {
      body,
      currentUser: { _id, token: userToken, expTime },
      query,
    } = req;
    const { password } = body;
    const { token } = query;

    if (!token) throw new Error("Invalid Token");

    // Check token expired or not
    const checkTokenExpiry = expTime < Date.now();

    if (checkTokenExpiry) throw new Error("Link Expired");

    // Check token exists or not && token belongs to that user
    const checkUserToken = token === userToken;

    if (!checkUserToken) throw new Error("Invalid Token");

    if (checkUserToken && !checkTokenExpiry) {
      const hashed = await hashPassword(password);

      const filter = { _id };
      const update = { $set: { password: hashed, token: null, expTime: null } };

      const updateUser = await userRepository.userFindOneUpdateQuery(
        filter,
        update
      );

      updateUser &&
        res.status(400).send({
          success: true,
          message: "Password Reset Succesfully.",
        });
    }
  } catch (error) {
    errorLogger(error.message, req.originalUrl);
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

export default {
  signup,
  login,
  getAllUsers,
  updateUsers,
  changePassword,
  forgotPassword,
  resetPassword,
};
