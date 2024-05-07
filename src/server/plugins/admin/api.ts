import { RouteType, type Route } from "@plugins/pluginInterface";
import { invalidJSON, missingJSONFields } from "@server/util/commonErrors";
import Logger from "@shared/logger";
import { Request, Response, NextFunction } from "express"
import ConfigurationPlugin from "../configuration";
import { apiSuccess } from "@server/util/commonMessages";

const logger = new Logger("routes/admin")

const routes: Route[] = [
    {
        path: "/api/update-access",
        type: RouteType.POST,
        async onRequest(request: Request, response: Response, nextFunction: NextFunction) {
            try {
                console.log(request.body)
                const { allowPublicAccess, allowAPIAccess }: {
                    allowPublicAccess: boolean,
                    allowAPIAccess: boolean
                } = JSON.parse(request.body)

                if (allowPublicAccess == undefined || allowAPIAccess == undefined) {
                    response
                        .status(400)
                        .send(missingJSONFields(["allowPublicAccess", "allowAPIAccess"]))
                }

                ConfigurationPlugin.configuration.allow_public_access = allowPublicAccess
                ConfigurationPlugin.configuration.allow_api_access = allowAPIAccess

            } catch (err) {
                logger.error(`Failed to parse access configuration: ${err}`)
                response.send(invalidJSON)
                return;
            }

            response
                .status(200)
                .send(apiSuccess)
        }
    }
]

export default routes; 