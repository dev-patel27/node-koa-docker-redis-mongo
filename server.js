import express, { json } from "express";
import userRoute from "./routes/user.route";

const server = express();

server.use(json());

server.use("/api/users", userRoute);

server.listen(PORT, () => {
  console.log(`Server runing on ${PORT}`);
});
