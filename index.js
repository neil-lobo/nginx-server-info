const ConfigParser = require('@webantic/nginx-config-parser')
const parser = new ConfigParser()
const fs = require('fs')

const out = []
const files = fs.readdirSync("/etc/nginx/sites-available").filter(file => file !== "default")

for (const file of files) {
    const config = parser.readConfigFile(`/etc/nginx/sites-available/${file}`, { parseIncludes: false })

    config.server.filter(s => {
        const keys = Object.keys(s);

        for (const key of keys) {
            if (key.startsWith("location ")) return true;
        }
        return false;
    }).forEach(s => {
        const locationKeys = Object.keys(s).filter(k => k.startsWith("location "))
        const locations = [];

        for (const key of locationKeys) {
            locations.push({
                path: key.slice(9),
                proxy_pass: s[key].proxy_pass
            })
        }

        out.push({
            server_name: s.server_name,
            locations
        })
    })
}

if(process.argv[2] == "--json" || process.argv[2] == "-j") {
	console.log(JSON.stringify(out));
} else {
    for(let server of out) {
        const locations = server.locations.map(({path, proxy_pass}) => {
            return `Location ${path} -> ${proxy_pass}`
        });
        console.log(`${server.server_name} | ${locations.join(" | ")}`)
    }
}
