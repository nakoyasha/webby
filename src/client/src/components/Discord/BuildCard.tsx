import React from "react";
import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";

function timeDifference(current: number, previous: number) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

export type BuildCardProps = {
  buildData: BuildData;
  onClick: (build: BuildData) => void;
};

export default class BuildCard extends React.Component {
  constructor(props: BuildCardProps) {
    super(props);
    this.props = props;
    this.state = {
      timeElapsed: "0 seconds ago",
    };
  }
  props: BuildCardProps;
  state: {
    timeElapsed: string;
  };
  tick() {
    this.setState({
      timeElapsed: timeDifference(
        new Date().getTime(),
        this.props.buildData.date_found.getTime()
      ),
    });
  }
  componentDidMount(): void {
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }
  //@ts-expect-error yeah
  interval: NodeJS.Timeout;
  componentWillUnmount(): void {
    clearInterval(this.interval);
  }
  render(): React.ReactNode {
    const { buildData } = this.props;

    return (
      <div className="build-card" key={buildData.build_hash}>
        <a
          className="make-bold-tag-fancy-pls blog-top build-list-build menhera-outline"
          onClick={() => {
            this.props.onClick(this.props.buildData);
          }}
        >
          {/* <div className="build-indicators">
            <div
              data-toggle="tooltip"
              data-placement="top"
              title={`This is a ${buildData.branches[0]} build`}
              className={`build-indicator build-indicator-${buildData.branches[0]}`}
            ></div>
          </div> */}

          <div className="build-card">
            <h3>
              <b>Build {buildData.build_number}</b>
            </h3>
            <p className="blog-description">Saved {this.state.timeElapsed}</p>
          </div>
        </a>
      </div>
    );
  }
}
