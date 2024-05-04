import Logger from "@shared/logger"
import type { Plugin } from "./pluginInterface"
import type { Express, Request, Response } from "express"
import { BlockedLogModel, BlockedReason } from "@server/models/blockedLog"
import ConfigurationPlugin from "./configuration"


export class AntiBotPlugin implements Plugin {
    public readonly name = "antibot"
    private readonly logger = new Logger("Middleware/Antibot")
    /*
    * Most scrapers don't even change their headers, so we just go the easy route and block the common HTTP library / tool
    * user agents.
    * Also to block *certain people* from using the server.
    */
    private readonly BAD_USER_AGENTS_PATTERNS = [
        "curl/",
        "YandexBot/",
        "python-requests",
        "aiohttp",
        "httpx",
        "libwww-perl",
        "Go-http-client/",
    ]
    /*
    * Unused for now, but is a list of bad IP ranges (e.g ones that are part of a botnet or something)
    */
    private readonly BAD_IP_RANGES = [{}];
    /*

    * A list of routes that are usually from spam scraper bots, that try to find vulnerable websites
    */
    private readonly BAD_ROUTES = [
        "phpmyadmin",
        "cgi-bin",
        "sql",
        "phpma",
        "sqlweb",
        "mysqlmanager",
        "server-status",
        "telescope",
        ".git",
        ".env",
        "admin",
        "boaform",
        "pmd",
        "manager",
        "webui",
        "config.json",
        "cf_scripts",
        "odinhttpcall",
        ".php",
        ".map",
    ];

    /*
    * A list of headers that should forcefully close the connection - e.g requests coming from Cloudflare workers
    */
    private readonly BAD_HEADERS = [
        // some people would probably want to use cloudflare workers, to use the a certain tracker's api while calling the tracker bad
        // ^ you know who you are!
        "Cf-Worker",
    ];

    /*
    * Forcefully closes the connection, pretty much telling them to fuck off
    */
    private goAway(request: Request, response: Response, reason: BlockedReason) {
        this.logger.log(`Anti-bot caught ${request.ip} because: ${reason ?? "No reason was specified by caller"}`)
        const blockedLog = new BlockedLogModel({
            ip: request.ip,
            reason: reason,
            blocked_on: new Date(),
        })

        blockedLog.save().catch((err) => {
            this.logger.error(`Failed to save the blocked log for ${request.ip}`)
        }).then(() => {
            this.logger.log(`Saved the blocked log for ${request.ip}`)
        })

        response.socket?.destroy()
    }

    /*
    * Checks if the request has a bad user-agent
    */

    private checkUserAgent(request: Request) {
        const userAgent = request.get("User-Agent") || request.get("user-agent")

        for (let badUserAgent of this.BAD_USER_AGENTS_PATTERNS) {
            if (userAgent?.includes(badUserAgent)) {
                return true;
            }
        }

        for (let badUserAgent of ConfigurationPlugin.configuration.blocked_user_agents) {
            if (userAgent?.includes(badUserAgent)) {
                return true;
            }
        }

        return false;
    }

    /*
    * Checks if the request is coming from a blocked IP range
    */

    private checkIPRange(request: Request) {
        throw new Error("Not Implemented");
    }

    /*
    * Checks if the request has a bad query (e.g, trying to access a php file)
    */

    private checkRoute(request: Request) {
        const route = request.url

        for (let badRoute of this.BAD_ROUTES) {
            if (route.includes(badRoute)) {
                return true
            }
        }

        return false;
    }

    /* 
    * Checks if the headers match any of the headers listed under BAD_HEADERS, 
    * aka, block cloudflare workers!
    */

    private checkHeader(request: Request) {
        for (let badHeader of this.BAD_HEADERS) {
            if (request.get(badHeader) != undefined) {
                return true
            }
        }

        for (let badHeader of ConfigurationPlugin.configuration.blocked_headers) {
            if (request.get(badHeader) != undefined) {
                return true;
            }
        }
    }

    public async init(server: Express) {
        server.use((request: Request, response: Response, nextConsumer) => {
            if (this.checkUserAgent(request)) {
                this.goAway(request, response, BlockedReason.BadUserAgent)
                return;
            }

            // TODO: Implement IP range
            // if (this.checkIPRange(request)) {
            //     this.goAway(response)
            // }

            if (this.checkRoute(request)) {
                this.goAway(request, response, BlockedReason.BadRoute)
                return;
            }

            if (this.checkHeader(request)) {
                this.goAway(request, response, BlockedReason.BadHeader)
                return;
            }


            nextConsumer()
        })
    }
}