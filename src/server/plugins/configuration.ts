import { Application } from "express";
import type { Plugin } from "./pluginInterface";
import Logger from "@shared/logger";
import { configFileLocation, envFileLocation } from "@server/constants";
import { ConfigFile, WebbyConfiguration } from "@server/types/configuration";


export default class ConfigurationPlugin implements Plugin {
    public readonly name = "Configuration";
    public static configuration: WebbyConfiguration = {
        allow_public_access: true,
        allow_api_access: true,
        admin_ip: "",
        blocked_headers: [],
        blocked_user_agents: []
    }

    private readonly logger = new Logger("Plugins/Configuration")

    public async reloadSettings() {
        await this.loadSettings()
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
    }
}