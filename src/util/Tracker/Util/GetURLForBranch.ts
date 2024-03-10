import { DiscordBranch } from "../Types/DiscordBranch"

export function getURLForBranch(branch: DiscordBranch) {
  const DISCORD_URL = "https://discord.com";
  const PTB_DISCORD_URL = "https://ptb.discord.com";
  const CANARY_DISCORD_URL = "https://canary.discord.com";

  return branch == "stable" && DISCORD_URL || branch == "ptb" && PTB_DISCORD_URL || branch == "canary" && CANARY_DISCORD_URL
}