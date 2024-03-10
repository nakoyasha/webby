import { DiscordBranch } from "./Types/DiscordBranch"
import { Experiment } from "./Types/Experiments";

export interface ExperimentPuller {
  getClientExperiments(branch: DiscordBranch): Promise<Experiment[] | void | undefined>;
}