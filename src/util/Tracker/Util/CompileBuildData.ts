import { pullClientScripts } from "../ClientScriptsPuller"
import acorn, { Identifier, Literal, Property } from "acorn"
import walk from "acorn-walk"
import { getExperiments } from ".."
import murmurhash from "murmurhash"
import { BuildData } from "../Types/BuildData"
import Logger from "../Logger"
import { DiscordBranch } from "../Types/DiscordBranch"
import { Experiment, GuildExperiment, MinExperiment } from "../Types/Experiments"

const logger = new Logger("Util/CompileBuildData");

export async function compileBuildData(branch: DiscordBranch): Promise<BuildData | Error> {

  logger.log("Getting Scripts")
  const scripts = await pullClientScripts("initial", branch)
  logger.log("Getting Experiments")
  const experiments = await getExperiments(branch)

  const strings = {} as { [key: string]: string }

  let buildNumber = undefined as string | undefined
  let versionHash = undefined as string | undefined

  for (let [path, script] of scripts) {
    const ast = acorn.parse(script, { ecmaVersion: 10 })

    walk.simple(ast, {
      ObjectExpression(node) {
        const properties = node.properties
        const fileBuildNumber = properties.find(prop => (prop as any)?.key?.name == "buildNumber") as Property
        const fileVersionHash = properties.find(prop => (prop as any)?.key?.name == "versionHash") as Property

        const isBuildObject = fileBuildNumber != undefined && fileVersionHash != undefined
        const isLanguageObject = properties.find(prop => (prop as any)?.key?.name == "DISCORD") != undefined

        if (isLanguageObject == true) {
          logger.log("Found strings")
          properties.forEach((node) => {
            const prop = node as Property
            const key = prop.key as Identifier
            const value = prop.value as Literal

            strings[key.name] = value.value as string
          })
        } else if (isBuildObject == true) {
          buildNumber = (fileBuildNumber.value as Literal)?.value as string
          versionHash = (fileVersionHash.value as Literal)?.value as string
          logger.log(`Found buildNumber and versionHash: ${buildNumber}, ${versionHash}`)
        }
      }
    })
  }

  if (buildNumber == undefined || versionHash == undefined) {
    logger.error("Compile error: Couldn't find buildNumber/versionHash! Aborting")
    return new Error("Couldn't find buildNumber/versionHash")
  }

  logger.log(`Minifying experiments..`)
  const minifiedExperiments = [] as MinExperiment[]

  // TODO: put this in getClientExperiments instead of here
  const arrayUserExperiments = Object.values(experiments.user as Experiment[]).filter((experiment) => experiment.hash_key != undefined)
  const arrayGuildExperiments = Object.values(experiments.guild).filter((experiment) => experiment.hash_key != undefined)

  function pushUserExperiment(experiment: Experiment) {
    minifiedExperiments.push({
      type: "user",
      hash_key: experiment.hash_key,
      hash: murmurhash(experiment.hash_key as string),
      title: experiment.title,
      name: experiment.name,
      description: experiment.description,
      buckets: experiment.buckets,
    })
  }

  function pushGuildExperiment(experiment: GuildExperiment) {
    minifiedExperiments.push({
      type: "guild",
      hash_key: experiment.hash_key,
      hash: murmurhash(experiment.hash_key as string),
      title: experiment.hash_key as string,
      name: experiment.hash_key as string,
      description: [],
      buckets: [],
    })
  }

  // TODO: change the return type to an object, instead of Experiment[]
  for (let experiment of arrayUserExperiments) {
    pushUserExperiment(experiment)
  }

  for (let experiment of arrayGuildExperiments) {
    pushGuildExperiment(experiment)
  }

  // compression?? ig
  const buildData: BuildData = {
    Strings: JSON.stringify(strings),
    Experiments: JSON.stringify(minifiedExperiments),
    // sanitize it
    Date: Math.floor(Date.now() / 1000),
    Branch: branch,
    BuildNumber: buildNumber as string,
    VersionHash: versionHash as string,
  }

  logger.log(`Build ${buildData.BuildNumber} has been compiled!`)
  return buildData
}