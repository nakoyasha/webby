export interface Routine {
  name: string,
  // Run every (x) miliseconds
  run_every: number,
  execute: () => {},
}