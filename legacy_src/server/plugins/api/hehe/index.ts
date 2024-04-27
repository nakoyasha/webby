import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch"
import { Route, RouteType } from "../../pluginInterface"
import makeAPIError, { APIErrorMessage } from "../makeAPIError"
import { BuildModel } from "@util/Tracker/Models/BuildData";
import { BuildData, BuildFlags } from "@util/Tracker/Types/BuildData";

import { readFileSync } from "node:fs"
import { compileBuildData } from "@util/Tracker/Util/CompileBuildData";
import { database } from "@system/database";

const NELLY_TOOLS = "https://nelly.tools"
const NELLY_BUILDS = new URL("/api/builds/app", NELLY_TOOLS)

const routes: Route[] = [
    {
        // Converts *legacy* builsd to a newer schema
        path: "/admin/make-it-work-again",
        type: RouteType.GET,
        onRequest: async function (req, res) {
            // TODO: make a proper admin check
            if (false) {
                res.status(401)
                res.json(makeAPIError("nuh uh", 20000))
                return;
            }

            (await BuildModel.find({})).forEach((build: any) => {
                console.log(`Converting ${build.build_number}`)
                const branch = build.Branch as DiscordBranch
                const build_number = build.build_number
                console.log(branch)

                build.Strings = null
                build.branch = null
                build.branches = ([branch] as unknown) as string
                build.build_number = (parseInt(build_number) as unknown) as string

                // TODO: figure out how to do this later !!
                build.strings_diff = []

                build.save()
            })


            // rename values
            await BuildModel.updateMany({
            }, {

                "$rename": {
                    "Experiments": "experiments",
                    "Date": "date_found",
                    "VersionHash": "build_hash",
                    "BuildNumber": "build_number",
                    "scripts.Initial": "scripts.initial",
                    "scripts.Lazy": "scripts.lazy",
                }
            })

            res.send("yay!")
        }
    },
    {
        path: "/admin/refetch-builds",
        type: RouteType.PATCH,
        async onRequest(req, res) {
            const rawBuilds = await readFileSync(process.cwd() + "/builds.json", "utf8")
            const builds = JSON.parse(rawBuilds)

            for (const build of Object.values(builds)) {
                const buildExists = await database.getBuildData((build as any).VersionHash) !== null

                if (buildExists == true) {
                    console.log(`Skipping build ${(build as any).VersionHash} as it already exists`)
                    continue;
                }

                const buildHash = (build as any).VersionHash
                try {
                    const lastBuild = await database.getLastBuild()
                    const canaryBuildData = (await compileBuildData(DiscordBranch.Canary, buildHash) as BuildData)

                    database.createBuildData(canaryBuildData, DiscordBranch.Canary, lastBuild)
                } catch (err) {
                    console.error(`Error while re-fetching build ${buildHash}: ${err}`)
                }
            }
        }
    },
    {
        // Pulls string diffs from nelly.tools and incorporates it into our own database.
        path: "/admin/amia-piggyback-gaming",
        type: RouteType.GET,
        onRequest: async function (req, res) {
            const response = await fetch(NELLY_BUILDS)

            if (!response.ok) {
                res.status(500)
                res.send(response.statusText)
                return;
            }

            const nellyBuilds = await response.json()

            for (const nellyBuild of nellyBuilds.data) {
                const build = await BuildModel.findOne({ build_hash: nellyBuild.build_hash }).exec()

                if (build !== null) {
                    console.log(`Piggybacking off of amia: ${nellyBuild.build_hash} (ty amia !!!)`)
                    build.strings_diff = nellyBuild.strings_diff
                    await build.save()
                } else {
                    console.log(`No build found for ${nellyBuild.build_hash}`)
                    const build = new BuildModel({
                        build_number: nellyBuild.build_number,
                        build_hash: nellyBuild.build_hash,
                        branches: nellyBuild.latest.map((branch: string) => {
                            switch (branch) {
                                case "stable":
                                    return DiscordBranch.Stable
                                case "canary":
                                    return DiscordBranch.Canary
                                case "ptb":
                                    return DiscordBranch.PTB
                            }
                        }),
                        strings_diff: nellyBuild.strings_diff,
                        diff_againt: nellyBuild.diff_against,
                        scripts: {
                            initial: [],
                            lazy: []
                        },
                        flags: [
                            BuildFlags.NeedsExperimentFetch,
                            BuildFlags.NeedsScriptFetch,
                            BuildFlags.NeedsStringRediff,
                        ],
                        experiments: {},
                        date_found: new Date(nellyBuild.created_at)
                    })

                    build.save()
                    console.log(`Build ${nellyBuild.build_hash} saved!`)
                }
            }

            res.status(200)
            res.send("piggybacking complete!")
        }
    }
];

export default routes;