import type { BuildData } from "@util/Tracker/Types/BuildData";
import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch";
import type { Routine } from "../../types/Routine";
import { compileBuildData } from "@util/Tracker/Util/CompileBuildData";

import Logger from "@system/logger";
import { database } from "@system/database";

const logger = new Logger("Routines/SaveBuild");

async function saveBuild(branch: DiscordBranch, lastBuild?: BuildData) {
  try {
    logger.log(`Compiling current ${branch} build..`);
    const build = (await compileBuildData(branch)) as BuildData;

    logger.log(`Saving build ${build.build_number}`);
    await database.createBuildData(build, branch, lastBuild);
    logger.log(`Build ${build.build_number} has been saved`);
    return build;
  } catch (err) {
    logger.error(`Compile failed: ${err}`);
    console.log(err)
  }
}
async function getAndSaveBuild(branch: DiscordBranch) {
  const lastBuild = await database.getLastBuild(branch);
  const newBuild = await saveBuild(branch, lastBuild);
}

export class SaveBuild implements Routine {
  name = "Save latest discord builds";
  run_every = 900000;
  async execute(saveCanary?: boolean) {
    await database.startMongoose();
    logger.log("Saving canary..");
    try {
      // await getAndSaveBuild("stable", channel)
      if (saveCanary === true || saveCanary === undefined) {
        await getAndSaveBuild(DiscordBranch.Canary);
      }
    } catch (err) {
      logger.error(`Routine failed: ${err}`);
      console.log(err)
    }
  }
}
