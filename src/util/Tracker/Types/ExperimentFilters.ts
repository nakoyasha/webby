import { Snowflake } from "./Snowflake"

export type ExperimentPopulationGuildFeatureFilter = {
  guild_features: string[],
}

export type ExperimentPopulationRangeFilter = {
  min_id?: Snowflake,
  max_id?: Snowflake,
}

export type ExperimentPopulationIDFilter = {
  guild_ids: Snowflake[],
}

export type ExperimentPopulationHubTypeFilter = {
  guild_hub_types: number[]
}

export type ExperimentPopulationVanityFilter = {
  guild_has_vanity_url: boolean,
}

export type ExperimentPopulationHash = {
  hash_key: number,
  target: number,
}

export type ExperimentPopulationFilters = {
  guild_has_feature?: ExperimentPopulationGuildFeatureFilter,
  guild_id_range?: ExperimentPopulationRangeFilter,
  guild_member_count_range?: ExperimentPopulationRangeFilter,
  guild_ids?: ExperimentPopulationIDFilter,
  guild_hub_types?: ExperimentPopulationHubTypeFilter,
  guild_has_vanity_url?: ExperimentPopulationVanityFilter,
  guild_in_range_by_hash?: ExperimentPopulationHash,
}