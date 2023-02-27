const ConfigParser = require('@webantic/nginx-config-parser')
const parser = new ConfigParser()
const fs = require('fs')

const config = parser.readConfigFile('/etc/nginx/sites-available/default', { parseIncludes: false })
let out = []

config.server.filter(s => s['location /']).forEach(s => out.push({
    server_name: s.server_name,
    proxy_pass: s['location /'].proxy_pass
}))

if(process.argv[2] == "--json" || process.argv[2] == "-j") {
	console.log(JSON.stringify(out));
} else {
    //fs.writeFileSync("./out.json", JSON.stringify(out, null, 2))
    for(let server of out) {
        console.log(`Domain: ${server.server_name} | Location: ${server.proxy_pass}`)
    }
}
