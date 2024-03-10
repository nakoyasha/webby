import { database } from "@system/database";
import { server } from "./server";

database.startMongoose()

server.init()
server.start()