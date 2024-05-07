import type { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";
import { DiscordBranch } from "@mizuki-bot/Tracker/Types/DiscordBranch";
import { DatabaseSystem } from "@server/DatabaseSystem";
import Logger from "@shared/logger";
import { compileBuildData } from "@mizuki-bot/Tracker/Util/CompileBuildData";

import config from "../../../config.json";
import getBranchName from "@mizuki-bot/Tracker/Util/GetBranchName";

import { TaskManifest } from "../classes/task"
const logger = new Logger("Tasks/ScrapeBuild");

async function saveBuild(branch: DiscordBranch, lastBuild?: BuildData) {
    try {
        logger.log(`Compiling current ${branch} build..`);
        const build = (await compileBuildData(branch, undefined, lastBuild)) as BuildData;

        logger.log(`Saving build ${build.build_number}`);
        try {
            const model = DatabaseSystem.createBuildData(build);
        } catch (err) {
            logger.log(`Build ${build.build_number} has failed to save because ${err}`);
        } finally {
            logger.log(`Build ${build.build_number} has been saved`);
        }
        return build;
    } catch (err) {
        logger.error(`Compile failed: ${err}`);
    }
}

async function postBuild(
    newBuild: BuildData,
    webhookUrl: string,
) {
    const builtOn = Math.round(newBuild.built_on.getTime() / 1000)
    const embed = {
        title: `New ${getBranchName(newBuild.branches[0])} build`,
        description: `Build number: \`${newBuild.build_number}\`\n` +
            `Build hash: \`${newBuild.build_hash}\`\n` +
            `Build date: <t:${builtOn}:R> | <t:${builtOn}:f>\n` +
            `# Stats\n` +
            ` 🧪 **Experiments**: ${newBuild.counts.experiments}\n` +
            ` 🧵 **Strings**: ${newBuild.counts.strings}\n` +
            `# Changes\n` +
            ` 🧪 **Experiments**:  ${newBuild.diffs.experiments.length} changed\n` +
            ` 🧵 **Strings**: ${newBuild.diffs.strings.length} changed\n\n` +
            `🔗 [\`here's the neller\`](https://nelly.tools/builds/${newBuild.build_hash})\n` +
            `🔗 [\`here's the webber\`](https://shiroko.me/trackers/discord/${newBuild.build_hash})`,
        // discord blurple
        color: "#5865f2"
    };

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            embeds: [embed]
        })
    })

    if (!response.ok) {
        logger.error(`Failed to announce build via webhook: ${response.status} - ${response.statusText}`)
        logger.error(JSON.stringify(await response.json()))
        return;
    }
}

/**
 * @summary Scrapes the current build and saves it to the databaase, so shrimple
 * @param {DiscordBranch} branch - the branch to scrape the current build from
 * @param {boolean} skipCheck - skips checking for if the build has already been saved
 */
async function getAndSaveBuild(branch: DiscordBranch, skipCheck?: boolean) {
    const response = await fetch(DiscordBranch.Canary + "/app")
    const currentHash = response.headers.get("X-Build-Id") as string

    if (!skipCheck) {
        logger.log("Checking if we already saved the current build..")

        if (!response.ok) {
            logger.error(`Fatal error trying to fetch current hash: ${response.status} - ${response.statusText}`)
            return;
        }

        const isSaved = await DatabaseSystem.getBuildData(currentHash) !== null;

        if (isSaved == true) {
            // we don't need to save it again silly
            logger.log(`Skipping scrape!!`)
            return;
        }
    }

    logger.log(`Scraping build ${currentHash}`);

    const lastBuild = await DatabaseSystem.getLastBuild();
    const newBuild = await saveBuild(branch, lastBuild);

    if (lastBuild !== undefined && newBuild !== undefined) {
        if (lastBuild.build_hash !== newBuild.build_hash) {
            await postBuild(newBuild, config.tasks.scrapeBuild.settings.webhookUrl);
        }
    }
}

export default class ScrapeBuild implements TaskManifest {
    name = "Scrape and save the current Discord builds";
    interval = config.tasks.scrapeBuild.interval;
    enabled: boolean = config.tasks.scrapeBuild.enabled;
    async run() {
        const branches = config.tasks.scrapeBuild.settings.branches as DiscordBranch[]
        const skipCheck = config.tasks.scrapeBuild.settings.skipSavedCheck

        try {
            //@ts-ignore ts got drunk, somehow it thinks branch is a string, when it's a DiscordBranch..
            await Promise.allSettled(branches.map((branch) => getAndSaveBuild(branch, skipCheck)))
            // await branches.map((branch) => getAndSaveBuild(branch, skipCheck))
        } catch (err) {
            logger.error(`scrapeBuild failed: ${err}`);
        }
    }
}
