import { database } from "@system/database";

(async () => {
    console.log("Trying to mong the goose..")
    await database.startMongoose()
    console.log("Fixing the wonky dates")
    await database.fixBrokenDates()
})()
