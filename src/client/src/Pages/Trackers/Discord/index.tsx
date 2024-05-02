import React, { useEffect, useState } from "react";
import BuildsList from "../../../components/Discord/BuildsList";
import { BuildData, BuildFlags } from "@mizuki-bot/tracker/Types/BuildData";
import { DiscordBranch } from "@mizuki-bot/tracker/Types/DiscordBranch";
import BuildDetails from "./details";
import Layout from "../../../components/Layout";
import Page from "../../../components/Page";

const exampleBuildData: BuildData = {
  build_hash: "hash",
  build_number: 125192,
  date_found: new Date(Date.now()),
  built_on: new Date(Date.now()),
  schema_version: 1,
  experiments: new Map(),
  branches: [DiscordBranch.Canary],
  strings_diff: [],
  flags: [BuildFlags.NeedsStringRediff],
  scripts: {
    initial: [],
    lazy: [],
  },
  counts: {
    experiments: 100,
    strings: 100,
  },
};

async function fetchBuildsWebby(page: number) {
  const response = await fetch(`http://localhost/api/builds?page=${page}`);
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

async function fetchBuildsNelly(page: number) {
  const response = await fetch("https://nelly.tools/api/builds/app");

  if (!response.ok) {
    console.error("uh oh!", response.status);
    return;
  }

  const jsonResponse = await response.json();
  const builds = jsonResponse.data.map((build: any) => {
    return {
      build_number: build.build_number,
      build_hash: build.build_hash,
      branches: build.release_channels,
      built_on: new Date(build.built_on),
      counts: {
        experiments: build.experiments_count,
        strings: build.strings_diff_count,
      },
    };
  });
  builds.length = 15;

  return {
    builds: builds,
    totalPages: 500,
  };
}

export default function DiscordTrackerPage() {
  const [latestBuilds, aaa] = useState([exampleBuildData]);
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [latestBuildsLoading, aaaaa] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState<string | number>("fetching..");

  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);

  useEffect(() => {
    async function fetchData() {
      setBuildsLoading(true);
      const response = await fetchBuildsWebby(page);

      setBuilds(response.builds);
      setMaxPages(response.totalPages);
      setBuildsLoading(false);
    }
    fetchData();
  }, [page]);

  if (isViewingDetails) {
    return (
      <Layout>
        <BuildDetails
          buildData={selectedBuild as BuildData}
          onExit={() => setIsViewingDetails(false)}
        />
      </Layout>
    );
  } else {
    return (
      <Layout>
        <div className="center-div vertical-center-thing topbar-margin build-list-gap">
          <Page className="discord-builds-page">
            <BuildsList
              title="Latest buildss"
              builds={latestBuilds}
              onClick={(build: BuildData) => {
                setSelectedBuild(build);
                setIsViewingDetails(true);
              }}
              loading={latestBuildsLoading}
            />

            <BuildsList
              title="Recent builds"
              builds={builds}
              loading={buildsLoading}
              paginated={true}
              page={page}
              maxPages={maxPages as number}
              onClick={(build: BuildData) => {
                setSelectedBuild(build);
                setIsViewingDetails(true);
              }}
              onNextPage={() => {
                const newPage = page + 1;
                // all just to make it a proper number..
                // react is just a bit janky
                const _maxPages: number = maxPages as number;
                if (newPage >= _maxPages) {
                  return;
                }

                setPage(newPage);
              }}
              onPreviousPage={() => {
                const newPage = page - 1;
                if (newPage <= 0) {
                  return;
                }

                setPage(newPage);
              }}
            />
          </Page>
        </div>
      </Layout>
    );
  }
}
