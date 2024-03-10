import { BuildData } from "../Types/BuildData";
import { Experiment } from "../Types/Experiments";

type BuildStrings = { [key: string]: string }

export type DiffTable = {
  Added: String,
  Removed: String,
  Changed: String,
}

export type BuildDiff = {
  Strings: DiffTable,
  Experiments: DiffTable,
}


// Outputs a BuildDiff with markdown diff strings - should only really be used for displaying diffs.
export function CreateBuildDiff(Original: BuildData, Compare: BuildData) {
  const addedStrings = []
  const changedStrings = []
  const removedStrings = []

  const addedExperiments = []
  const removedExperiments = []

  const originalStrings = JSON.parse(Original.Strings) as BuildStrings
  const compareStrings = JSON.parse(Compare.Strings) as BuildStrings

  const originalExperiments = JSON.parse(Original.Experiments)
  const compareExperiments = JSON.parse(Compare.Experiments)

  // strings pass
  for (const [name, value] of Object.entries(compareStrings)) {
    const originalValue = originalStrings[name]

    if (originalValue == undefined) {
      addedStrings.push(`+ ${name}: "${value}"`)
    } else if (originalValue != value) {
      changedStrings.push(`- ${name}: "${originalValue}"`)
      changedStrings.push(`+ ${name}: "${value}"`)
    }
  }

  for (const [name, value] of Object.entries(originalStrings)) {
    const compareValue = compareStrings[name]

    if (compareValue == undefined) {
      removedStrings.push(`- ${name}: "${value}"`)
    }
  }

  // experiments pass
  for (const [name, value] of Object.entries(originalExperiments)) {
    const experiment = (value as Experiment)
    const experimentName = experiment?.title || experiment.name
    const originalValue = originalExperiments[name] as Experiment

    if (originalValue == undefined) {
      addedExperiments.push(`+ ${name}: ${experimentName}`)
    }
  }

  for (const [name, value] of Object.entries(compareExperiments)) {
    const experiment = (value as Experiment)
    const experimentName = experiment?.title || experiment.name
    const compareValue = originalExperiments[name]

    if (compareValue == undefined) {
      removedExperiments.push(`- ${name}: ${experimentName}`)
    }
  }

  return {
    Strings: {
      Added: addedStrings,
      Changed: changedStrings,
      Removed: removedStrings,
    },
    Experiments: {
      Added: addedExperiments,
      Removed: removedExperiments
    }
  }
}