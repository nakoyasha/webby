export interface TaskManifest {
    name: string
    interval: string
    run: () => Promise<void>
}

export default class Task {
    public readonly name: string;
    public readonly interval: string;

    public enabled: boolean = true;
    public lastRun: Date | null = null;
    public running: boolean = false;

    manifestRun: () => Promise<void>

    constructor(manifest: TaskManifest) {
        this.name = manifest.name
        this.interval = manifest.interval
        this.manifestRun = manifest.run
    }

    async run() {
        this.running = true
        await this.manifestRun()
        this.running = false
    }
}