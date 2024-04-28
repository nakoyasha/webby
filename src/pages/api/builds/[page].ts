import { database } from "@system/database";
import { defaultPageLimit } from "src/constants";
import type { APIRoute } from "astro";

//@ts-ignore ts won't shut up otherwise
export const GET: APIRoute = async ({ params, request }) => {
    if (!database.connected === true) {
        await database.startMongoose();
    }

    const pageNumber = parseInt((params.page as string))

    const totalBuilds = await database.getBuildCount()
    const totalPages = Math.ceil(totalBuilds / defaultPageLimit)

    if (pageNumber > totalPages) {
        return;
    }

    const builds = await database.getBuilds(0, true)
    const startIndex = (pageNumber - 1) * defaultPageLimit
    const endIndex = pageNumber * defaultPageLimit

    const page = builds.slice(startIndex, endIndex)

    return new Response(JSON.stringify({
        data: page,
        totalBuilds: totalBuilds,
        totalPages: Math.ceil(totalBuilds / defaultPageLimit),
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=20, s-maxage=20",
        },
    });
};