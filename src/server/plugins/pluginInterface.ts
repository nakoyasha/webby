import type { Express, NextFunction, Request, Response } from "express"

export enum RouteType {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
}

export type Route = {
    path: string,
    type: RouteType,
    onRequest: (req: Request, res: Response, nextFunction: NextFunction) => void
}

export interface Plugin {
    name: string,
    routePrefix?: string,
    routes?: Route[],
    middleware?: Array<any>,
    init: (server: Express) => Promise<void>
}