import React from "react";
import { BuildData } from "@mizuki-bot/tracker/Types/BuildData";
import BuildCard from "./BuildCard";
import ActivityIndicator from "../../ActivityIndicator";

export type BuildsListProps = {
  title: string;
  builds: BuildData[];
  loading: boolean;
  paginated?: boolean;
  page?: number;
  maxPages?: number;
  onNextPage?: () => void;
  onClick: (build: BuildData) => void;
  onPreviousPage?: () => void;
};

function PaginatorControls(props: {
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  page?: number;
  maxPages?: number;
}): React.ReactNode {
  return (
    <div className="paginator-controls">
      <button
        className="menhera-button"
        id="strings-button"
        onClick={props.onPreviousPage}
      >
        Previous
      </button>
      <p>
        Page {props.page} / {props.maxPages}
      </p>
      <button
        className="menhera-button"
        id="strings-button"
        onClick={props.onNextPage}
      >
        Next
      </button>
    </div>
  );
}

export default class BuildsList extends React.Component {
  constructor(props: BuildsListProps) {
    super(props);
    this.props = props;
  }
  props: BuildsListProps;
  render() {
    return (
      <div className="builds-list-container" key={"builds-list"}>
        <h1>{this.props.title}</h1>

        {/* if loading, display a loading indicator */}
        {/* not? then display the builds */}
        {this.props.loading ? (
          <ActivityIndicator />
        ) : (
          <div className="build-list">
            {this.props.builds.map((build) => {
              return (
                <BuildCard onClick={this.props.onClick} buildData={build} />
              );
            })}
          </div>
        )}
        {this.props.paginated ? (
          <PaginatorControls
            onPreviousPage={this.props.onPreviousPage}
            onNextPage={this.props.onNextPage}
            page={this.props.page}
            maxPages={this.props.maxPages}
          />
        ) : null}
      </div>
    );
  }
}
