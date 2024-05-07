import { connect as connectToDatabase, Document } from "mongoose";

import Logger from "@shared/logger";
import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";
import { BuildModel } from "@mizuki-bot/Tracker/Schemas/BuildSchema";
import { defaultPageLimit } from "./constants";
import { DiscordBranch } from "@shared/Tracker/Types/DiscordBranch";

const logger = new Logger("System/DatabaseSystem");
export type ReturnedBuildData = Document<unknown, {}, BuildData> & BuildData

const FALLBACK_URL = "mongodb://localhost:27017/webbyStaging"
const SMOL_FILTER = {
    _id: false,
    scripts: false,
    strings_diff: false,
    // experiments: false,

    // legacy builds
    Scripts: false,
    Strings: false,
    Experiments: false,

    // why is this even here??
    __v: false,
}

const REGULAR_FILTER = {
    __v: false,
}

export const DatabaseSystem = {
    connected: false,
    async startMongoose() {
        if (this.connected) {
            return;
        }

        const mongoURL = process.env.MONGO_URL || FALLBACK_URL

        connectToDatabase(mongoURL as string)
            .then(() => {
                this.connected = true;
                logger.log("Connected to the database successfully!");
            })
            .catch((err: Error) => {
                logger.error(`Failed to connect to the database: ${err.message}\nCause:${err.cause}`);
            })
    },

    async getBuildCount() {
        return await BuildModel.estimatedDocumentCount({}).exec()
    },

    // set smol to true when you don't need terabytes worth of build data !!!!!!!!
    async getBuilds(limit: number = defaultPageLimit, smol: boolean = false): Promise<BuildData[]> {
        const filter: Record<any, any> = smol && SMOL_FILTER || REGULAR_FILTER

        const fetchedBuilds = await BuildModel.find().limit(limit).select(filter).exec();
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
            logger.log(`Processing ${build.build_number}`)
            const date = build.date_found

            // it's impossible for builds to be older than 2015.. sooo
            if (date.getFullYear() < 2015) {
                // sweet horrors beyond my comprehension..
                build.date_found = (((build.date_found as unknown) as number) * 1000 as unknown) as Date
            }

            await build.save()
        }
    },

    async getLatestBuilds() {
        const stableBuild = await this.getLastBuild(DiscordBranch.Stable)
        const canaryBuild = await this.getLastBuild(DiscordBranch.Canary)
        const ptbBuild = await this.getLastBuild(DiscordBranch.PTB)

        return {
            stable: stableBuild,
            canary: canaryBuild,
            ptb: ptbBuild
        }
    },

    async getLastBuild(branch?: DiscordBranch) {
        const filter = branch ? { branches: [branch] } : {}
        const build = await BuildModel.findOne(filter).sort({ built_on: -1 }).exec()

        // turns out it doesn't return undefined, but returns null instead!
        // to prevent things from breaking, we return undefined here instead
        if (build === null) {
            return undefined;
        }

        return build;
    },

    async getBuildData(BuildHash: string): Promise<ReturnedBuildData | null> {
        return await BuildModel.findOne({ build_hash: BuildHash }).exec()
    },

    async getLegacyBuildData(BuildHash: string): Promise<BuildData | null> {
        return await BuildModel.findOne({ VersionHash: BuildHash }).exec()
    },

    async createBuildData(build: BuildData) {
        const existingBuildData = await this.getBuildData(build.build_hash)
        const existingBuildDataExists = existingBuildData != undefined

        const newBranch = build.branches[0]
        const isNewBranch = build.branches.find(branch => branch == newBranch) !== undefined

        if (existingBuildDataExists && isNewBranch) {
            logger.log(`Build ${build.build_number} has been spotted on a new branch: ${newBranch}`)
            await BuildModel.updateOne({ build_hash: build.build_hash }, {
                $set: {
                    branches: [
                        ...existingBuildData.branches,
                        ...build.branches
                    ]
                }
            })
            return;
        }

        const buildData = new BuildModel(build);
        await new Promise((resolve, reject) => {
            buildData.save()
                .then(resolve)
                .catch((err) => {
                    logger.error(
                        `BuildData save for ${build.build_hash} has failed: ${err.message}\nCause: ${err.cause}`,
                    );
                    reject()
                })
        })
    },
};
