import { database } from "@system/database";
import { SaveBuild } from "../src/system/routines/SaveBuild";
import { configDotenv } from "dotenv";

(async () => {
    await configDotenv({ path: "./.env" })
    console.log(process.env)
    await new SaveBuild().execute()
})()