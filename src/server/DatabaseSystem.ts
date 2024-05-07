import mongoose from "mongoose";

import Logger from "@shared/logger";
import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";
import { BuildModel } from "@mizuki-bot/tracker/Schemas/BuildSchema";
import { defaultPageLimit } from "./constants";

const logger = new Logger("System/DatabaseSystem");

export const DatabaseSystem = {
    async startMongoose() {
        await mongoose.connect(process.env.MONGO_URL as string);
    },

    async getBuildCount() {
        return await BuildModel.estimatedDocumentCount({}).exec()
    },

    // set smol to true when you don't need terabytes worth of build data !!!!!!!!
    async getBuilds(limit: number = defaultPageLimit, smol: boolean = false): Promise<BuildData[]> {
        const filteredFields: Record<any, any> = smol && {
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

    // async getLastBuilds() {
    //     const stableBuilds = BuildModel.find({ branch: "stable" })
    //     const canaryBuilds = BuildModel.find({ branch: "canary" })

    //     const latestStableBuild = stableBuilds.sort({ id: -1 }).limit(1)[0]
    //     const latestCanaryBuild = canaryBuilds.sort({ id: -1 }).limit(1).get 

    //     return {
    //         stable: latestStableBuild,
    //         canary: latestCanaryBuild,
    //     }
    // },

    async getLastBuild() {
        const build = await BuildModel.findOne().sort({ built_on: -1 }).exec()
        return build as BuildData;
    },

    async getBuildData(BuildHash: string): Promise<BuildData | null> {
        return await BuildModel.findOne({ build_hash: BuildHash }).exec()
    },

    async getLegacyBuildData(BuildHash: string): Promise<BuildData | null> {
        return await BuildModel.findOne({ VersionHash: BuildHash }).exec()
    },

    async createBuildData(Build: BuildData) {
        let buildDataExists = await this.getBuildData(Build.build_hash) != undefined

        if (buildDataExists == true) {
            logger.warn(`Not saving data as the build data for ${Build.build_number}-${Build.build_hash} already exists`)
            return;
        }
        try {
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
