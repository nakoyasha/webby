import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";
import DiffList from "../../../components/Discord/Diff/DiffList";
import BuildFeature from "../../../components/Discord/BuildFeature";

import { Tooltip } from "react-tooltip";
import { DiscordBranch } from "@mizuki-bot/Tracker/Types/DiscordBranch";

import getBranchName from "@mizuki-bot/Tracker/Util/GetBranchName";
import Page from "../../../components/Page";
import ExperimentLabel from "../../../components/Discord/Experiments/ExperimentLabel";

export default function BuildDetails(props: {
  buildData: BuildData;
  onExit: () => void;
}) {
  const { buildData, onExit } = props;
  let experiments = Object.values(buildData.experiments);
  return (
    <div>
      <div className="blog-return-container">
        <a className="blog-return" onClick={onExit}>
          &lt; Return to builds
        </a>
      </div>

      <div className="center-div topbar-margin">
        <Page
          className="build-details"
          tabs={["Info", "Experiments", "Scripts"]}
        >
          <div className="make-bold-tag-fancy-pls blog-top">
            <div className="build-indicators build-indicators-details">
              {buildData.branches.map((branch: DiscordBranch) => {
                const branchName = getBranchName(branch);
                const tooltipKey = "build-indicator-" + branchName;

                return (
                  <div
                    className={"tooltip build-indicator " + tooltipKey}
                    key={branchName}
                    data-tooltip-id={tooltipKey}
                    data-tooltip-content={`This build exists on ${branchName}`}
                    data-tooltip-place="top"
                  >
                    <Tooltip
                      key={branchName}
                      className={"menhera-outline"}
                      id={tooltipKey}
                    />
                  </div>
                );
              })}
            </div>

            <h1>
              <b>Build {buildData.build_number}</b>
            </h1>
            <div className="description-and-date">
              <p className="blog-description">
                {buildData.build_hash} • Saved on{" "}
                {buildData.built_on.toISOString()}
              </p>
            </div>
            <div className="blog-separator"></div>
            <div className="build-details-grid">
              <BuildFeature
                title={`Strings (${buildData.diffs.strings.length} changed)`}
              >
                {/* <p>No strings changes were found</p> */}
                <DiffList showAsString={true} diffs={buildData.diffs.strings} />
              </BuildFeature>

              <BuildFeature
                title={`Experiments (${buildData.diffs.experiments.length} changed)`}
                hidden={true}
              >
                {experiments.map((experiment) => {
                  return (
                    <ExperimentLabel
                      key={experiment.hash}
                      experiment={experiment}
                    />
                  );
                })}
                {/* <ExperimentLabel
                    experiment={{
                      hash: 1111,
                      hash_key: "2024-02_the_huh_experiment",
                      buckets: [],
                      description: ["huh"],
                      title: "huh",
                      type: "user",
                      name: "The Huh Experiment",
                    }}
                  /> */}
              </BuildFeature>
            </div>
          </div>
        </Page>
      </div>
    </div>
  );
}
