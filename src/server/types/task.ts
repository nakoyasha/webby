export default interface Task {
    name: string
    interval: string,
    run: () => Promise<void>
}