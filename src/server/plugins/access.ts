import { NextFunction, Request, Response } from "express";
import ConfigurationPlugin from "./configuration";


export function isAdmin(request: Request) {
    const webbyConfiguration = ConfigurationPlugin.configuration
    // if we're connecting from an admin ip, or if we're connecting from localhost
    // then open the gate
    const isAdmin = request.ip == webbyConfiguration.admin_ip
        || request.hostname == "localhost"
    console.log(webbyConfiguration, request.ip)

    return isAdmin
}

export function restrictToAdmin(request: Request, response: Response, nextFunction: NextFunction) {
    if (!isAdmin(request)) {
        // nop!
        console.log("someone tried to access the admin panel :p")
        response.redirect("/")
    } else {
        console.log("yay")
        nextFunction()
    }
}