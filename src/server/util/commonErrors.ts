import StaticPlugin from "@server/plugins/static";
import makeAPIError from "./makeAPIError";
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { Response } from "express"

export const invalidJSON = makeAPIError("Invalid JSON", 500)
export const missingJSONFields = (fields: string[] = []) => {
    return makeAPIError(`Missing fields: ${fields.join(", ")}`, 500)
}


export async function getOutAndStayOut(response: Response) {
    const randomMessageId = Math.floor(Math.random() * 4)

    switch (randomMessageId) {
        case 1:
            response.send(makeAPIError("Something lurks in the shadows, that something may come and get you if you continue your adventure down this path. Only the bravest can continue their adventure down the unknown - are you brave enough?\nClearly not, because you're not supposed to be here!", 401))
            break;
        case 2:
            response.send(makeAPIError("https://youtu.be/v-fc1zv31zE", 401))
            break;
        case 3:
            response.sendFile(join(StaticPlugin.PUBLIC_LOCATION, "wires.jpg"))
    }
}