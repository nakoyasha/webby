import { join } from "node:path"

export const paths = {
    data: join(process.cwd(), "data"),
    posts: join(process.cwd(), "posts"),
}

export const defaultPageLimit = 15