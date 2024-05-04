import { Application } from "express";
import type { Plugin } from "./pluginInterface";
import Logger from "@shared/logger";
import { configFileLocation } from "@server/constants";
import { WebbyConfiguration } from "@server/types/configuration";
import { join } from "path"
import { readFile } from "node:fs/promises"

export default class ConfigurationPlugin implements Plugin {
    public readonly name = "Configuration";
    public static configuration: WebbyConfiguration = {
        allow_public_access: true,
        allow_api_access: true,
        admin_ip: "",
        blocked_headers: [],
        blocked_user_agents: []
    }

    private readonly logger = new Logger("Middleware/Configuration")

    public async reloadSettings() {
        await this.loadSettings()
    }

    // loads the bad_user_agents.txt file, then inserts them into the blocked_user_agents list
    private async loadBadUserAgentList() {
        try {
            const file = await readFile(join(process.cwd(), "bad_user_agents.txt"), { encoding: "utf8" })
            const lines = file
                // windows stinky; removes CRLF line endings
                .replace(/\r/g, "")
                // removes whatever the double slashes are
                .replace(/\\/g, "")
                .split("\n")
            console.log(lines)
            ConfigurationPlugin.configuration.blocked_user_agents = [...lines, ...ConfigurationPlugin.configuration.blocked_user_agents]
            this.logger.log("Loaded bad_user_agents.txt")
        } catch (err) {
            this.logger.error(`Failed to load bad_user_agents.txt: ${err}`)
        }
    }

    private async loadSettings() {
        this.logger.log("Loading server configuration..")
        const configFile = await import(`file://${configFileLocation}`, {
            with: { type: 'json' }
        })
        const config = configFile.default
        const adminIp = process.env.ADMIN_IP

        if (config?.webby == undefined) {
            this.logger.warn("Configuration file is missing the webby field! Your config file is most likely corrupted!")
            return;
        }

        ConfigurationPlugin.configuration = config.webby
        // this is loaded from the .env file
        if (adminIp == undefined) {
            this.logger.warn(".env file is missing the ADMIN_IP field! THis means you won't be able to access the admin panel!")
            this.logger.warn("If this is intentional, then you can safely ignore this message")
        } else {
            ConfigurationPlugin.configuration.admin_ip = process.env.ADMIN_IP as string
        }

        this.logger.log("Loaded server configuration")
    }

    public async init(server: Application) {
        await this.loadSettings()
        await this.loadBadUserAgentList()
    }
}