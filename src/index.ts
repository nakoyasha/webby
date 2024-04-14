import { database } from "@system/database";
import { server } from "./server";
import { configDotenv } from "dotenv";
configDotenv()

database.startMongoose()
server.init()
server.start()