import puppeteer from "puppeteer";
import { ExperimentPuller } from "../ExperimentPuller";
import Logger from "../Logger"
import { DiscordBranch } from "../Types/DiscordBranch"
import { Experiment } from "../Types/Experiments";

const getExperimentsJS = `
  // webpack require..?
  let wpRequire;
  window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => { wpRequire = req; }]);

  // get experimentStore and get the registered experiments from LegacyExperimentStore
  Object.values(wpRequire.c).find(x => x?.exports?.default?.getRegisteredExperiments).exports.default.getRegisteredExperiments()
`
const logger = new Logger("Util/PullExperimentData/PuppteerPull")

export class PuppeteerPull implements ExperimentPuller {
  async getClientExperiments(branch: DiscordBranch): Promise<Experiment[] | void | undefined> {
    let experiments;
    const browser = await puppeteer.launch({ headless: true, args: ["--disable-gpu"] });
    const discord = await browser.pages().then(e => e[0]);

    await discord.goto('https://discord.com/app');
    await discord.setViewport({ width: 1, height: 1 });

    try {
      experiments = await discord.evaluate(getExperimentsJS) as Experiment[]
    } catch (err) {
      logger.error(`Error while pulling experiments: ${err}`)
      throw err;
    }

    await browser.close();
    return experiments
  }
}