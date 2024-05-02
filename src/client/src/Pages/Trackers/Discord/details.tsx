import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";
import DiffList from "../../../components/Discord/Diff/DiffList";
import BuildFeature from "../../../components/Discord/BuildFeature";

import { Tooltip } from "react-tooltip";

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
        <div className="build-details generic-background menhera-outline">
          <div className="make-bold-tag-fancy-pls blog-top">
            <div className="build-indicators build-indicators-details">
              <div
                className="tooltip build-indicator build-indicator-canary"
                data-tooltip-id="build-indicator-canary"
                data-tooltip-content={"This is the latest canary build"}
                data-tooltip-place="top"
              >
                <Tooltip
                  className={"menhera-outline"}
                  id="build-indicator-canary"
                />
              </div>
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
        </div>
      </div>
    </div>
  );
}
