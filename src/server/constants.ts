import { join } from "node:path"

export const defaultPageLimit = 15
export const configFileLocation = join(process.cwd(), "config.json")
export const envFileLocation = join(process.cwd(), ".env")