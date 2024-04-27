import { readFile } from 'node:fs/promises';
import { join } from "node:path"
import constants from 'src/constants';

export default async function readData(file: string) {
    return ((await readFile(join(constants.paths.data, file)))).toString()
}