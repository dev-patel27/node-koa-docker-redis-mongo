import { userModel } from "../models";
import { userRepository } from "../repositories";
import {
  hashPassword,
  comparePassword,
  jwtToken,
  // sendMail,
  generateRandomString,
  logger,
} from "../utils";
import { passwordAlgorithm, saltRounds } from "../utils/hashPassword";

const signup = async (ctx, _next) => {
  try {
    let { body } = ctx.request;
    const { password } = body;
    const hashed = await hashPassword(password);
    const data = {
      ...body,
      password_hash: hashed,
      password_algo: passwordAlgorithm,
      password_salt: saltRounds,
    };

    const user = new userModel(data);
    const saveUser = await user.save();

    if (!saveUser) throw new Error("Error While Saving User");
    if (saveUser) {
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: "User created successfully...",
        data: saveUser,
      };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    };
  }
};

const login = async (ctx, _next) => {
  try {
    const { body } = ctx.request;
    const { email, password } = body;
    const checkUser = await userRepository.userQuery({ email });
    
    if (!checkUser) {
      throw new Error(
        `The email you've entered does not belong to an account. Please Register with Us.`
      );
    }

    if (checkUser) {
      const { _id, first_name, last_name } = checkUser;

      const verifyPassword = await comparePassword(
        password,
        checkUser.password_hash
      );

      if (!verifyPassword) throw new Error("Email or Password is incorrect");

      const token = jwtToken.generateJWTToken(_id);
      if (verifyPassword) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          data: { token },
          message: `${first_name} ${last_name} Login Successfully`,
        };
      }
    }
  } catch (error) {
    logger(
      "errorLog",
      error?.message,
      ctx.request?.originalUrl,
      ctx.request?.ip
    );
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error?.message,
      error: JSON.stringify(error),
    };
  }
};

const getAllUsers = async (ctx, _next) => {
  try {
    const { query } = ctx.request;
    const { totalCount, users } = await userRepository.findAllQuery(query);

    ctx.status = 200;
    ctx.body = {
      success: true,
      data: users,
      totalCount,
    };
  } catch (error) {
    logger(
      "errorLog",
      error?.message,
      ctx.request?.originalUrl,
      ctx.request?.ip
    );
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    };
  }
};

const changePassword = async (ctx, _next) => {
  try {
    const {
      body,
      currentUser: { _id, password: userPassword },
    } = ctx.request;
    const { password, newPassword } = body;

    const verifyPassword = await comparePassword(password, userPassword);
    if (!verifyPassword) throw new Error("Current Password is incorrect");

    const hashed = await hashPassword(newPassword);

    const filter = { _id };
    const update = { password_hash: hashed };

    await userRepository.updateOneQuery(filter, update);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Password Updated Successfully.",
    };
  } catch (error) {
    logger(
      "errorLog",
      error?.message,
      ctx.request?.originalUrl,
      ctx.request?.ip
    );
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    };
  }
};

const forgotPassword = async (ctx, _next) => {
  try {
    const { email } = ctx.request.body;
    const checkUser = await userRepository.userQuery({ email });

    if (!checkUser) throw new Error("User Not Found With That Email");

    if (checkUser) {
      const token = generateRandomString(21);
      const date = new Date();
      const password_reset_expiry = date.getTime() + 600000; // 10 Min

      const filter = { email };
      const update = { password_reset_token: token, password_reset_expiry };

      await userRepository.updateOneQuery(filter, update);

      const html = `Click here to Reset Password : ${
        process.env.HOST + ":" + process.env.PORT
      }/api/user-complete-password-reset?token=${token}&expiredAt=${password_reset_expiry} Link will expire in 10 min`;

      // const sendEmail = await sendMail(
      //   email,
      //   process.env.SENDGRID_EMAIL,
      //   "RESET PASSWORD",
      //   html
      // );
      // const sendGridErrors = sendEmail?.["errors"] ?? [];
      // if (sendGridErrors.length) {
      //   const error = sendGridErrors.map((err) => err.message);
      //   throw new Error(`SendGrid Error: ${error}`);
      // }
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: `Password Reset Link Sent Successfully at ${email}`,
        data: html,
      };
    }
  } catch (error) {
    logger(
      "errorLog",
      error?.message,
      ctx.request?.originalUrl,
      ctx.request?.ip
    );
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    };
  }
};

const resetPassword = async (ctx, _next) => {
  try {
    const { body, query } = ctx.request;
    const { password } = body;
    const { token, expiredAt } = query;

    if (!token) throw new Error("Invalid Token");

    // Check token expired or not
    const checkTokenExpiry = expiredAt < Date.now();
    if (checkTokenExpiry) throw new Error("Link Expired");

    // Check token exists or not && token belongs to that user
    const checkUserToken = await userRepository.userQuery({
      password_reset_token: token,
    });

    if (!checkUserToken) throw new Error("Invalid Token");

    if (checkUserToken && !checkTokenExpiry) {
      const hashed = await hashPassword(password);
      const filter = { password_reset_token: token };
      const update = {
        $set: {
          password_hash: hashed,
          password_reset_token: null,
          password_reset_expiry: null,
        },
      };

      const updateUser = await userRepository.userFindOneUpdateQuery(
        filter,
        update
      );
      if (updateUser) {
        ctx.status = 400;
        ctx.body = {
          success: true,
          message: "Password Reset Successfully...",
        };
      }
    }
  } catch (error) {
    logger(
      "errorLog",
      error?.message,
      ctx.request?.originalUrl,
      ctx.request?.ip
    );
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    };
  }
};

export default {
  signup,
  login,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
};
