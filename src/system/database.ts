import mongoose, { Document } from "mongoose";
import * as dotenv from "dotenv";

import Logger from "@system/logger";
import { BuildData } from "@util/Tracker/Types/BuildData";
import { BuildModel } from "@util/Tracker/Models/BuildData";
import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch";
const logger = new Logger("System/DatabaseSystem");

export const database = {
    async startMongoose() {
        // do this AGAINH becuase it doesnt work for some reason
        dotenv.config();

        await mongoose.connect(process.env.MONGO_URL as string);
    },

    async getBuilds() {
        return await BuildModel.find();
    },

    async getBuildData(BuildNumber: string, Branch: DiscordBranch) {
        return await BuildModel.findOne({ BuildNumber: BuildNumber, Branch: Branch });
    },

    async createBuildData(Build: BuildData) {
        let buildDataExists = await this.getBuildData(Build.BuildNumber, Build.Branch) != undefined

        if (buildDataExists == true) {
            logger.warn(`Not saving data as the build data for ${Build.BuildNumber}-${Build.VersionHash} already exists`)
            return;
        }
        try {
            const buildData = new BuildModel({
                BuildNumber: Build.BuildNumber,
                VersionHash: Build.VersionHash,
                Date: Build.Date,
                Branch: Build.Branch,
                Experiments: Build.Experiments,
                Strings: Build.Strings,
            });

            await buildData.save()
        } catch (err) {
            logger.error(
                `The Thing has Mongoose'd: Failed to create BuildData: ${err}`,
            );
            return;
        }
    },
};
