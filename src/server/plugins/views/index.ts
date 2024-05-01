import type { Plugin } from "../pluginInterface";
import { Express, NextFunction, Request, Response, static as staticDir } from "express"
import { join } from "path"

export default class ViewsPlugin implements Plugin {
    name = "Views";
    DATA_LOCATION: string = join(process.cwd(), "data");
    CLIENT_LOCATION: string = join(process.cwd(), "dist/client");

    async init(server: Express) {
        server.set("views", join(process.cwd(), "dist/client"))
        server.use(staticDir(this.CLIENT_LOCATION))

        // we have an spa silly
        server.get("*", (_: Request, response: Response) => {
            response.sendFile(join(this.CLIENT_LOCATION, "index.html"))
        })

        // server.get("/", async (req, res) => {
        //     const meData = JSON.parse(readFileSync(this.DATA_LOCATION + "/me.json", { encoding: "utf8", flag: "r" }))
        //     res.render('index', {
        //         page: "home", my: meData
        //     })
        // })

        // server.get("/sekai-stickers", async (req, res) => {
        //     res.render('index', {
        //         page: "sekaiStickers"
        //     })
        // })

        // server.get("/projects", async (req, res) => {
        //     res.render('index', {
        //         page: "projects"
        //     })
        // })

        // server.get("/trackers", async (req, res) => {
        //     res.render('index', {
        //         page: "trackers",
        //     })
        // })

        // server.get("/trackers/discord/:buildHash", async (req, res, nextConsumer) => {
        //     // redirect to 404
        //     if (!req.params.buildHash) {
        //         return;
        //     }

        //     const build = await database.getBuildData(req.params.buildHash)

        //     if (build == undefined) {
        //         nextConsumer()
        //         return;
        //     }

        //     res.render('index', {
        //         page: "trackers/discord/build",
        //         build: {
        //             build_number: build.build_number,
        //             build_hash: build.build_hash,
        //             date: build.date_found.toLocaleDateString(),
        //             strings_diff: build.strings_diff,
        //             experiments: build.experiments
        //         }
        //     })
        // })

        // server.get("/api/v1/portalcord/verification", async (req, res) => {
        //     // :3
        //     res.redirect("https://youtu.be/vAvcxeXtBz0?t=11")
        // })
    }
}