import { Diff, DiffType } from "@mizuki-bot/Tracker/Types/Diff";

export type DiffItemProps = {
  diff: Diff;
  showAsString?: boolean;
};

export default function DiffItem(props: DiffItemProps) {
  const isAdd = props.diff.type === DiffType.Added;
  const isRemove = props.diff.type === DiffType.Removed;
  const isChange = props.diff.type === DiffType.Changed;

  // if it's add, do diff-change-add
  // if it's remove, do diff-change-remove
  // if it's changed, do diff-change
  const className = isAdd
    ? "diff-add diff-item"
    : isRemove
    ? "diff-remove diff-item"
    : isChange
    ? "diff-change diff-item"
    : "diff-unknown diff-item";

  let value = props.diff.value;

  if (props.showAsString == true) {
    value = `${props.diff.key}: "${value}"`;
  } else {
    value = `${props.diff.key}: ${value}`;
  }

  if (isChange) {
    return (
      <div>
        <span className="diff-change-remove">-{props.diff.oldValue}</span>
        <span className="diff-change-add">+{props.diff.newValue}</span>
      </div>
    );
  } else {
    return <span className={className}>{value}</span>;
  }
}
