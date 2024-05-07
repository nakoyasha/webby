import { Experiment } from "@mizuki-bot/Tracker/Types/Experiments";

export type ExperimentLabelProps = {
  experiment: Experiment;
};

export default function ExperimentLabel(props: ExperimentLabelProps) {
  const { experiment } = props;
  const icon = experiment.type == "user" ? "👤" : "🏠";

  return (
    <div className="experiment-label">
      {icon}
      {experiment.hash_key}
    </div>
  );
}
