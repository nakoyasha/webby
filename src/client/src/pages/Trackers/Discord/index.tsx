import React, { useEffect, useState } from "react";
import BuildsList from "../../../components/Discord/BuildsList";
import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";
import BuildDetails from "./BuildDetails";
import Layout from "../../../components/Layout";
import Page from "../../../components/Page";
import { getBuilds, getLatestBuilds } from "../../../util/api";

//@ts-ignore this is for testing only
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
  const [latestBuilds, setLatestBuilds] = useState<BuildData[]>([]);
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
      const response = await getBuilds(page);

      if (response == undefined) {
        console.error("Failed to fetch the builds for some reason?");
        return;
      }

      setBuilds(response.builds);
      setMaxPages(response.totalPages);
      setBuildsLoading(false);
    }
    fetchData();
  }, [page]);

  useEffect(() => {
    getLatestBuilds().then((response) => {
      if (response == undefined) {
        return;
      }

      setLatestBuilds(response);
      setLatestBuildsLoading(false);
    });
  }, []);

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
              title="Latest builds"
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
