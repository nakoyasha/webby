import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";

let BASE_URL = document.location.origin

// a fix for running both the express server and a vite live-server at the same time
if (BASE_URL.includes("localhost")) {
    BASE_URL = "http://localhost"
}

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
        totalPages: jsonResponse.totalPages,
    };
}


export async function getLatestBuilds(): Promise<BuildData[] | undefined> {
    const response = await fetch(`${BASE_URL}/api/builds/latest`);
    if (!response.ok) {
        console.error("Error fetching latest builds:", response.status);
        return undefined;
    }
    const jsonData = await response.json();
    const builds = jsonData.builds.map((build: BuildData) => {
        build.built_on = new Date(build.built_on);
        return build;
    })

    return builds;
}

export async function getExperiments(buildHash: string) {
    const response = await fetch(makeExperimentsURL(buildHash));
    if (!response.ok) {
        console.error(`Failed to fetch experiments for ${buildHash}`, response.status);
        return;
    }

    return await response.json()
}