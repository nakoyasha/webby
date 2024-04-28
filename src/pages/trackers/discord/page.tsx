import React, { useEffect, useState } from "react";
//@ts-ignore yabayaba
import BuildsList from "../../../components/trackers/discord/BuildsList";
import { BuildData, BuildFlags } from "@mizuki-bot/tracker/Types/BuildData";
import { DiscordBranch } from "@mizuki-bot/tracker/Types/DiscordBranch";
import BuildDetails from "./BuildDetails";

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

export default function DiscordTracker() {
  const [latestBuilds, setLatestBuilds] = useState([exampleBuildData]);
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [latestBuildsLoading, setLatestBuildsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState<string | number>("fetching..");

  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);

  useEffect(() => {
    async function fetchData() {
      setBuildsLoading(true);
      const response = await fetch(`http://localhost:4321/api/builds/${page}`);
      if (!response.ok) {
        console.error("uh oh!", response.status);
        return;
      }

      const jsonResponse = await response.json();
      const builds = jsonResponse.data.map((build) => {
        build.date_found = new Date(build.date_found);
        return build;
      });
      setBuilds(builds);
      setMaxPages(jsonResponse.totalPages);
      setBuildsLoading(false);
    }
    fetchData();
  }, [page]);

  if (isViewingDetails) {
    return (
      <BuildDetails
        buildData={selectedBuild as BuildData}
        onExit={() => setIsViewingDetails(false)}
      />
    );
  } else {
    return (
      <div className="center-div vertical-center-thing topbar-margin build-list-gap">
        <div className="discord-builds-page generic-background menhera-outline">
          <BuildsList
            title="Latest builds"
            builds={latestBuilds}
            onClick={(build) => {
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
            onClick={(build) => {
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
        </div>
      </div>
    );
  }
}
