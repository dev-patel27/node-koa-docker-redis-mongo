import Router from "koa-router";

import { userController } from "../controllers";
import { caching } from "../middlewares";
import auth from "../middlewares/authorization";

const router = new Router();
router.prefix("/api");
export default router
  .post("/register", userController.signup)
  .post("/login", caching, userController.login)
  .get("/users", auth, userController.getAllUsers)
  .post("/user-init-password-reset", userController.forgotPassword)
  .post("/user-complete-password-reset", userController.resetPassword);
