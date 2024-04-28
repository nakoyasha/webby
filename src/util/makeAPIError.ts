export default function makeAPIError(message: string, code: number) {
    return new Response(JSON.stringify({
        message: message,
        code: code
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}