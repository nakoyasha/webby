export default interface Task {
    name: string
    interval: number,
    run: () => Promise<void>
}