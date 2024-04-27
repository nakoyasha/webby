export type APIErrorMessage = {
    message: string,
    code: number
}

export default function makeAPIError(message: string, code: number): APIErrorMessage {
    return {
        message,
        code
    }
}