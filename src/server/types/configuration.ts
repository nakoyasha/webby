
export type WebbyConfiguration = {
    allow_public_access: boolean,
    allow_api_access: boolean,

    admin_ip: string,
    blocked_headers: string[],
    blocked_user_agents: string[],
}

export type TaskManifest = {
    enabled: boolean,
    interval: string,
}

export type TaskConfiguration = Record<any, TaskManifest & any>

export type ConfigFile = {
    webby: WebbyConfiguration,
    tasks: TaskConfiguration
}