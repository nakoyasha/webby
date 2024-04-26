import mongoose, { Document } from "mongoose";

import Logger from "@system/logger";
import { BuildData } from "@util/Tracker/Types/BuildData";
import { BuildModel } from "@util/Tracker/Models/BuildData";
import { defaultPageLimit } from "src/server/constants";
import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch";

const logger = new Logger("System/DatabaseSystem");

export const database = {
    async startMongoose() {
        return mongoose.connect(process.env.MONGO_URL as string);
    },

    async getBuildCount() {
        return await BuildModel.estimatedDocumentCount({}).exec()
    },

    // set smol to true when you don't need terabytes worth of build data !!!!!!!!
    async getBuilds(limit: number = defaultPageLimit, smol: boolean = false): Promise<BuildData[]> {
        const filteredFields: Record<any, any> = smol == true && {
            _id: false,
            scripts: false,
            strings_diff: false,
            experiments: false,

            // legacy builds
            Scripts: false,
            Strings: false,
            Experiments: false,

            // why is this even here??
            __v: false,
        } || {
            // nuh uh
            __v: false,
        }

        const fetchedBuilds = await BuildModel.find().limit(limit).select(filteredFields).exec();
        const builds: BuildData[] = []

        for (const build of fetchedBuilds) {
            builds.push(build)
        }

        return builds
    },


    // TODO: the tracker refactor probably broke this, fix it !!
    async fixBrokenDates() {
        const builds = await BuildModel.find()

        for (let build of builds) {
            console.log(`Processing ${build.build_number}`)
            const date = build.date_found

            // it's impossible for builds to be older than 2015.. sooo
            if (date.getFullYear() < 2015) {
                // sweet horrors beyond my comprehension..
                build.date_found = (((build.date_found as unknown) as number) * 1000 as unknown) as Date
            }

            await build.save()
        }
    },

    async getLastBuild(branch: DiscordBranch = DiscordBranch.Stable) {
        const build: BuildData = await BuildModel.findOne({
            branches: [branch]
        }).sort({ id: -1 }).exec() as BuildData
        return build
    },

    async getBuildData(BuildHash: string): Promise<BuildData | null> {
        return await BuildModel.findOne({ build_hash: BuildHash }).exec()
    },

    async getLegacyBuildData(BuildHash: string): Promise<BuildData | null> {
        return await BuildModel.findOne({ VersionHash: BuildHash }).exec()
    },

    async createBuildData(Build: BuildData, Branch: DiscordBranch, lastBuild?: BuildData) {
        let existingBuildData = await BuildModel.findOne({ build_hash: Build.build_hash }).exec()

        // if there's existing build data, and we haven't found this build on the specified branch..
        if (existingBuildData !== null) {
            if (!existingBuildData.branches.includes(Branch)) {
                logger.log(`Build ${Build.build_hash} was found on a different branch!`)
                existingBuildData.branches = [...Build.branches, Branch]
                await existingBuildData.save()
            } else {
                logger.log(`Skipping build ${Build.build_hash} as it is already saved`)
            }
            return;
        }
        try {
            if (lastBuild != undefined) {
                // set the last build to be diffed against later
                Build.diff_against = lastBuild?.build_hash
            }

            const buildData = new BuildModel(Build);
            await buildData.save()
        } catch (err) {
            logger.error(
                `The Thing has Mongoose'd: Failed to create BuildData: ${err}`,
            );
            return;
        }
    },
};
