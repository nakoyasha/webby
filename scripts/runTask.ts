import ScrapeBuild from "../src/server/tasks/scrapeBuild"
import { DatabaseSystem } from "../src/server/DatabaseSystem"
import { DiscordBranch } from "@mizuki-bot/Tracker/Types/DiscordBranch"

import { configDotenv } from "dotenv"

((async () => {
    await configDotenv()
    await DatabaseSystem.startMongoose()
    await new ScrapeBuild().run([DiscordBranch.Canary], true)
}))()