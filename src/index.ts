import { DatabaseSystem } from "@server/DatabaseSystem";
import { server } from "./server";
import { configDotenv } from "dotenv";
configDotenv()

DatabaseSystem.startMongoose()
server.init()
server.start()