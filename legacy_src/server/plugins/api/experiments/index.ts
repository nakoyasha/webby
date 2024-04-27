import { database } from "@system/database";
import { Route, RouteType } from "../../pluginInterface";
import { BUILD_NOT_FOUND, getBuild } from "../builds";
import makeAPIError from "../makeAPIError";

export const EXPERIMENT_NOT_FOUND = makeAPIError("Unknown Experiment", 40000)
export const MISSING_EXPERIMENT_PARAM = makeAPIError("Missing Experiment", 40000)

const routes: Route[] = [
    {
        path: "/experiment/:experimentId",
        type: RouteType.GET,
        async onRequest(req, res) {
            const experimentId = req.params.experimentId

            if (experimentId === null) {
                res.status(404)
                res.send(MISSING_EXPERIMENT_PARAM)
                return;
            }

            const build = await database.getLastBuild()

            if (build === null) {
                res.status(404)
                res.send(BUILD_NOT_FOUND)
            } else {
                const experiment = build.experiments.get(experimentId)

                if (experiment === null) {
                    res.status(404)
                    res.send(EXPERIMENT_NOT_FOUND)
                    return;
                } else {
                    res.json(experiment)
                }
            }
        },
    }
];

export default routes;