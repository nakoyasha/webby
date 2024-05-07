import { DatabaseSystem } from "@server/DatabaseSystem";
import TaskSystem from "@server/tasks";
import ScrapeBuild from "@server/tasks/scrapeBuild";

(async () => {
    const system = new TaskSystem([
        new ScrapeBuild()
    ])

    await DatabaseSystem.startMongoose()
    await system.start()
})()