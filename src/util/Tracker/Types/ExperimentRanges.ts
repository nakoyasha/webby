export type ExperimentPopulationRollout = {
  // Range start
  s: number,
  // Range end
  e: number
}

export type ExperimentPopulationRange = {
  bucket: number,
  rollout: ExperimentPopulationRollout
}