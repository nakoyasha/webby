import { database } from "@system/database"
import { BuildData } from "@util/Tracker/Types/BuildData"
import { defaultPageLimit } from "src/server/constants"
import { Route, RouteType } from "../../pluginInterface"
import makeAPIError, { APIErrorMessage } from "../makeAPIError"
import { EXPERIMENT_NOT_FOUND, MISSING_EXPERIMENT_PARAM } from "../experiments"

export type Page = {
    builds: BuildData[],
    totalBuilds: number,
    totalPages: number,
}

export const BUILD_NOT_FOUND = makeAPIError("Build not found", 80088)
export const MISSING_BUILD_PARAM = makeAPIError("Missing Build", 40000)

export async function getBuilds(pageNumber: number = 1, limit: number = defaultPageLimit): Promise<Page | APIErrorMessage> {
    const totalBuilds = await database.getBuildCount()
    const totalPages = Math.ceil(totalBuilds / limit)

    if (pageNumber > totalPages) {
        return makeAPIError("Exceeded the page limit, did you forget to add a totalPages check?", 40004)
    }

    const builds = await database.getBuilds(0, true)
    const startIndex = (pageNumber - 1) * limit
    const endIndex = pageNumber * limit

    const page = builds.slice(startIndex, endIndex)

    return {
        builds: page,
        totalBuilds,
        totalPages
    } as Page
}

export async function getBuild(buildHash: string) {
    const build = await database.getBuildData(buildHash)
    return build;
}

const routes: Route[] = [
    {
        path: "/builds",
        type: RouteType.GET,
        async onRequest(req, res) {
            const pageNumber = parseInt((req.query?.page as string))
            const page = await getBuilds(pageNumber)

            const isError = "message" in page

            if (isError) {
                res.status(400)
                res.send(page)
                return;
            }

            res.json(page)
        }
    },
    {
        path: "/build/:buildId",
        type: RouteType.GET,
        async onRequest(req, res) {
            const buildId = req.params.buildId
            const build = await getBuild(buildId)

            if (build === null) {
                res.status(404)
                res.send(BUILD_NOT_FOUND)
            } else {
                res.json(build)
            }
        }
    },
    {
        path: "/build/:buildId/experiments",
        type: RouteType.GET,
        async onRequest(req, res) {
            const buildId = req.params.buildId
            const build = await getBuild(buildId)

            if (build === null) {
                res.status(404)
                res.send(BUILD_NOT_FOUND)
            } else {
                res.json(build.experiments)
            }
        },
    },
    {
        path: "/build/:buildId/experiment/:experimentId",
        type: RouteType.GET,
        async onRequest(req, res) {
            const buildId = req.params.buildId
            const experimentId = req.params.experimentId

            if (buildId === null) {
                res.status(404)
                res.send(MISSING_BUILD_PARAM)
                return;
            }

            if (experimentId === null) {
                res.status(404)
                res.send(MISSING_EXPERIMENT_PARAM)
                return;
            }

            const build = await getBuild(buildId)

            if (build === null) {
                res.status(404)
                res.send(BUILD_NOT_FOUND)
            } else {
                const experiment = build.experiments.get(experimentId)

                if (experiment === undefined) {
                    res.status(404)
                    res.send(EXPERIMENT_NOT_FOUND)
                    return;
                }

                res.json(experiment)
            }
        },
    },
];

export default routes;