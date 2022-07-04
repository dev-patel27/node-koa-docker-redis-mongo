import { userRepository } from "../repositories";
import { jwtToken } from "../utils";

const auth = async (ctx, next) => {
  try {
    const { authorization } = ctx.headers;
    if (!authorization) throw new Error("Access denied. No token provided");
    const token =
      authorization && authorization.startsWith("Bearer ")
        ? authorization.slice(7, authorization.length)
        : null;
    const verifyToken = jwtToken.verifyJWTToken(token);

    if (!verifyToken) throw new Error("Invalid Token");

    const user = await userRepository.userQuery({ _id: verifyToken.sub });
    if (!user) throw new Error("No User Found With That Token");

    ctx.currentUser = user;
    await next();
  } catch (error) {
    ctx.status = 403;
    ctx.body = { success: false, message: error.message };
  }
};

export default auth;
