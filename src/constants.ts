import { join } from "node:path"

export default {
    paths: {
        data: join(process.cwd(), "data"),
        posts: join(process.cwd(), "posts"),
    }
}