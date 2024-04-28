import React from "react";
import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";

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
              <div className="tooltip build-indicator build-indicator-canary">
                <span className="tooltiptext">
                  This is the latest canary build
                </span>
              </div>
            </div>
            <h1>
              <b>Build {buildData.build_number}</b>
            </h1>
            <div className="description-and-date">
              <p className="blog-description">
                {buildData.build_hash} • Saved on{" "}
                {buildData.date_found.toISOString()}
              </p>
            </div>
            <div className="blog-separator"></div>
            <div className="build-details-grid">
              <div className="build-feature">
                <div className="build-feature-top">
                  <h2>
                    <b>Strings (2005)</b>
                  </h2>
                  <button className="menhera-button" id="strings-button">
                    Show
                  </button>
                </div>

                <p>No strings changes were found</p>
                <div className="hljs build-diff" id="strings-diff">
                  <span className="diff-add">
                    DISCORD: "Kerfus Incorporated!"
                  </span>
                  <span className="diff-change">
                    DISCORD_DESC_SHORT: "we hate kerfus !! 😠😠😠"
                  </span>
                  <span className="diff-remove">
                    DISCORD_DESC_LONG: "Kerfus haters united.."
                  </span>
                </div>
              </div>

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
