import Logger from "@shared/logger";
import Task from "./types/task";

export default class TaskSystem {
    public running: boolean = false;
    public locked: boolean = false;
    private readonly tasks: Task[] = [];
    private readonly logger = new Logger("Server/TaskSystem")
    constructor(tasks: Task[]) {
        this.tasks = tasks;
    }

    private getInterval(intervalString: string) {
        const interval = intervalString.replaceAll("s", "").replaceAll("m", "").replaceAll("h", "");

        const isSeconds = intervalString.endsWith("s");
        const isMinutes = intervalString.endsWith("m");
        const isHours = intervalString.endsWith("h");

        if (isSeconds == true) {
            return parseInt(interval) * 1000;
        } else if (isMinutes == true) {
            return (parseInt(interval) * 1000) * 60;
        } else if (isHours == true) {
            return (parseInt(interval) * 1000) * 60 * 60 * 24;
        } else {
            this.logger.error(`Invalid interval: ${intervalString}`)
            return 60000;
        }
    }

    public async start() {
        if (this.running) {
            this.logger.error("Tried to start TaskSystem when it's already running")
            return;
        }

        for (const task of this.tasks) {
            const logger = this.logger
            const interval = this.getInterval(task.interval)
            const isLocked = this.locked

            async function startRoutine(firstRun?: boolean) {
                // restart the timer for now, since we're locked 
                if (isLocked == true) {
                    setTimeout(startRoutine, interval)
                    return;
                }

                if (firstRun != true) {
                    try {
                        logger.log(`Task ${task.name} is starting`)
                        await task.run()
                        logger.log(`Task ${task.name} has finished!`)
                    } catch (err) {
                        logger.error(`Routine ${task.name} has encountered an error: ${err}`)
                    }
                }
                setTimeout(startRoutine, interval)
            }

            startRoutine(true)
        }
    }
}