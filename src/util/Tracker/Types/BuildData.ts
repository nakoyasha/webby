import { DiscordBranch } from "./DiscordBranch";

export type BuildData = {
  BuildNumber: string,
  VersionHash: string,
  Date: Number,
  Branch: DiscordBranch,
  Strings: string,
  Experiments: string,
};
