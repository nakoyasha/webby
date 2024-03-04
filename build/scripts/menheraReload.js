// my own implementation of liveReload; because for some reason that doesnt wanna work.
console.log("helloo!!!")

const ws = new WebSocket("ws://localhost:1882")

ws.addEventListener("open", (event) => {
    console.log("Connected to menheraReload server successfully; waiting for reload request")
})
ws.addEventListener("error", (event) => {
    console.log("man")
})

// reload on any message (boring but it workey!!!)
ws.addEventListener("message", (event) => {
    location.reload()
})