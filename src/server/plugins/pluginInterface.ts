import type { Express, Request, Response } from "express"

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
    onRequest: (req: Request, res: Response) => void
}

export interface Plugin {
    name: string,
    routePrefix?: string,
    routes?: Route[],
    init: (server: Express) => Promise<void>
}