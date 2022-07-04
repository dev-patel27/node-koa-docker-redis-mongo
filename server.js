import Koa from "koa";
import koaBody from "koa-body";

import userRoute from "./routes/user.route";
import "./config/dbConnection";

const server = new Koa();

server.use(koaBody());

server.use(userRoute.routes());
server.use(userRoute.allowedMethods());

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server runing on ${PORT}`);
});
