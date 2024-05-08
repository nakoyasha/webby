import React from "react";
import { BuildData } from "@mizuki-bot/Tracker/Types/BuildData";
import getBranchName from "@mizuki-bot/Tracker/Util/GetBranchName";

function timeDifference(current: number, previous: number) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " second(s) ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minute(s) ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hour(s) ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " day(s) ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " month(s) ago";
  } else {
    return Math.round(elapsed / msPerYear) + " year(s) ago";
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
        this.props.buildData.built_on.getTime()
      ),
    });
  }
  componentDidMount(): void {
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }
  //@ts-ignore
  // eslint-disable-next-line no-undef
  interval: NodeJS.Timeout;
  componentWillUnmount(): void {
    clearInterval(this.interval);
  }
  render(): React.ReactNode {
    const { buildData } = this.props;

    return (
      <div
        className={
          "build-card " + getBranchName(buildData.branches[0]) + "-outline"
        }
        key={buildData.build_number}
      >
        <a
          className="make-bold-tag-fancy-pls blog-top build-list-build "
          onClick={() => {
            this.props.onClick(this.props.buildData);
          }}
        >
          <div className="build-card">
            <h3>
              <b>Build {buildData.build_number}</b>
            </h3>
            <p className="blog-description">Built {this.state.timeElapsed}</p>
          </div>
        </a>
      </div>
    );
  }
}
