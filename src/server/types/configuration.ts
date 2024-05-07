
export type WebbyConfiguration = {
    allow_public_access: boolean,
    allow_api_access: boolean,

    admin_ip: string,
    blocked_headers: string[],
    blocked_user_agents: string[],
}

export type TaskConfig = {
    enabled: boolean,
    interval: string,
    settings: Record<string, any>
}

export type ConfigFile = {
    webby: WebbyConfiguration,
    tasks: Record<any, TaskConfig & any>
}