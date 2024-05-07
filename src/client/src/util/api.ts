import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";

export const BASE_URL = document.baseURI

export default function makeExperimentsURL(buildHash: string) {
    return new URL(`api/build/${buildHash}/experiments`, BASE_URL);
}

export async function getBuilds(page: number) {
    const response = await fetch(`${BASE_URL}/api/builds?page=${page}`);
    if (!response.ok) {
        console.error("uh oh!", response.status);
        return;
    }

    const jsonResponse = await response.json();
    const builds = jsonResponse.builds.map((build: BuildData) => {
        build.built_on = new Date(build.built_on);
        return build;
    });

    return {
        builds: builds,
        totalPages: jsonResponse.total_pages,
    };
}

export async function getExperiments(buildHash: string) {
    const response = await fetch(makeExperimentsURL(buildHash));
    if (!response.ok) {
        console.error(`Failed to fetch experiments for ${buildHash}`, response.status);
        return;
    }

    return await response.json()
}