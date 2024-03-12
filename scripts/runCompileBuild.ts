import { database } from "@system/database";
import { BuildData } from "@util/Tracker/Types/BuildData";
import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch";
import { compileBuildData } from "@util/Tracker/Util/CompileBuildData";

async function saveBuild(branch: DiscordBranch) {
    try {
        console.log(`Compiling current ${branch} build..`)
        const build = await compileBuildData(branch) as BuildData

        console.log(`Saving build ${build.BuildNumber}`)
        await database.createBuildData(build)
        console.log(`Build ${build.BuildNumber} has been saved`)
    } catch (err) {
        console.log(`Compile failed: ${err}`)
    }
}

(async () => {
    await database.startMongoose()
    await saveBuild("stable")

})()