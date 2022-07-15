import winston from "winston";

const todayTime = new Date().getTime();
const LOGS_PATH = process.env.LOG_PATH;

const loggers = {
  infoLog: winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.File({
        filename: `${LOGS_PATH}/${todayTime}_info.log`,
      }),
    ],
  }),

  errorLog: winston.createLogger({
    level: "error",
    format: winston.format.json(),
    transports: [
      new winston.transports.File({
        filename: `${LOGS_PATH}/${todayTime}_error.log`,
      }),
    ],
  }),
};

const logger = (error, requestURL = "", requestIp, type = "errorLog") => {
  const logObj = {
    message: error,
    currentTime: new Date().toLocaleString(),
    requestURL,
    requestIp,
  };
  switch (type) {
    case "errorLog":
      loggers[type].error(logObj);
      break;
    case "infoLog":
      loggers[type].info(logObj);
      break;
    // case "warningLog":
    //   loggers[type].info(logObj);
    //   break;
    default:
      loggers[type].error(logObj);
      break;
  }
};

export default logger;
