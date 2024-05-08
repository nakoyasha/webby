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
      <>
        <span className="diff-item"># Updated</span>
        <span className="diff-remove diff-item">{props.diff.oldValue}</span>
        <span className="diff-add diff-item">{props.diff.newValue}</span>
      </>
    );
  } else if (isRemove) {
    return <span className={className}>{props.diff.key}</span>;
  } else {
    return <span className={className}>{value}</span>;
  }
}
