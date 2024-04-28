import { readFile } from 'node:fs/promises';
import { join } from "node:path"
import { paths } from 'src/constants';

export default async function readData(file: string) {
    return ((await readFile(join(paths.data, file)))).toString()
}