
const http = require('http')
const fs = require('fs')
const path = require('path')

const { networkInterfaces } = require('os')

let port = 3000
const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), req.url)

    if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
            const files = fs.readdirSync(filePath)
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(`<h1>Index of ${req.url}</h1><ul>` + files.map(f => `<li><a href="${req.url.endsWith('/') ? req.url : req.url + '/'}${f}">${f}</a></li>`).join('') + '</ul>')
        } else {
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.wav': 'audio/wav',
                '.mp4': 'video/mp4'
            }
            res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' })
            fs.createReadStream(filePath).pipe(res)
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 Not Found')
    }
})

const ips = []
const start_server = () => server.listen(port, () => ips.map(ip => console.log(`${ip[0]}:   http://${ip[1]}:${port}/`)))


const get_ips = async f => {
    ips.push(["External", (await (await fetch('https://api.ipify.org').catch(e => { return { text: () => '127.0.0.1' } })).text()).toString()])
    const interfaces = networkInterfaces()
    const interfaces_names = Object.keys(interfaces)
    Object.values(interfaces).reduce((r, ni) => [...r, ...ni], []).filter(i => i.family === 'IPv4').map((i, j) => ips.push([interfaces_names[j], i.address]))
    console.log("Server running on:\n")
    start_server()
}

const args = process.argv.slice(2);
port = args.shift() || port

process.removeAllListeners('warning')
get_ips()



