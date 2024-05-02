import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";
import DiffList from "../../../components/Discord/Diff/DiffList";
import BuildFeature from "../../../components/Discord/BuildFeature";

import { Tooltip } from "react-tooltip";
import { DiscordBranch } from "@mizuki-bot/tracker/Types/DiscordBranch";

import getBranchName from "@mizuki-bot/tracker/Util/GetBranchName";
import Page from "../../../components/Page";

export default function BuildDetails(props: {
  buildData: BuildData;
  onExit: () => void;
}) {
  const buildData = props.buildData;
  return (
    <div>
      <div className="blog-return-container">
        <a className="blog-return" onClick={props.onExit}>
          &lt; Return to builds
        </a>
      </div>

      <div className="center-div topbar-margin">
        <Page className="build-details">
          <div className="make-bold-tag-fancy-pls blog-top">
            <div className="build-indicators build-indicators-details">
              {buildData.branches.map((branch: DiscordBranch) => {
                const branchName = getBranchName(branch);
                const tooltipKey = "build-indicator-" + branchName;
                console.log(branchName);

                return (
                  <div
                    className={"tooltip build-indicator " + tooltipKey}
                    data-tooltip-id={tooltipKey}
                    data-tooltip-content={`This is the latest ${branchName} build`}
                    data-tooltip-place="top"
                  >
                    <Tooltip className={"menhera-outline"} id={tooltipKey} />
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
                title={`Strings (${props.buildData.diffs.strings.length} changed)`}
              >
                {/* <p>No strings changes were found</p> */}
                <DiffList
                  showAsString={true}
                  diffs={props.buildData.diffs.strings}
                />
              </BuildFeature>

              <div className="build-feature">
                <div className="build-feature-top">
                  <h2>
                    <b>Experiments</b>
                  </h2>
                  <button className="menhera-button" id="experiments-button">
                    Show
                  </button>
                </div>
                <p>No experiment changes were found</p>
                <div className="hljs build-diff" id="experiments-diff">
                  <span className="diff-add"></span>
                  <span className="diff-change">
                    DISCORD_DESC_SHORT: "we hate kerfus !! 😠😠😠"
                  </span>
                  <span className="diff-remove">
                    DISCORD_DESC_LONG: "Kerfus haters united.."
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Page>
      </div>
    </div>
  );
}
