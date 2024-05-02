import { Diff } from "@mizuki-bot/tracker/Types/Diff";
import DiffItem from "./DiffItem";

export type DiffListProps = {
  diffs: Diff[];
  showAsString?: boolean;
};

export default function DiffList(props: DiffListProps) {
  return (
    <div className="hljs build-diff" id="strings-diff">
      {props.diffs.map((diff) => {
        return (
          <DiffItem
            diff={diff}
            key={diff.key}
            showAsString={props.showAsString}
          />
        );
      })}
    </div>
  );
}
