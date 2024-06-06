# self-cert
This is a simple library to generate a self-signed x509 key-pair and certificate.

# Installation
## CDN
Import library from the ESM.SH CDN for fast and easy setup:
```javascript
import {create} from "//esm.sh/gh/rahatool/self-cert";
```
## NPM registry
Use the package manager npm to install self-cert.
```shell
$ npm install github:rahatool/self-cert
```

# Usage
## Self-signed Certificate
1) Create a [new project](https://docs.npmjs.com/cli/v7/commands/npm-init) with the entry point "index.mjs".
2) Add the project dependency by `npm i github:rahatool/self-cert`.
3) Put the following script in file "index.mjs".
```javascript
import {create as createCertificate} from '@raha.group/self-cert';
import fs from 'fs/promises';
import os from 'os';

let hosts = [];
for (let networkInterface of Object.values(os.networkInterfaces())) {
	for (let assignedNetworkAddress of networkInterface) {
		hosts.push(assignedNetworkAddress.address);
	}
}

let certificate = createCertificate({
	domains: [ // List the hostnames (including wildcards) on your origin that the certificate should protect.
		'localhost',
		'*.local', // wildcards
		...hosts
	],
	expires: new Date(2025, 1),
	/*
	attributes: {
		commonName: domains[0],
		countryName: 'IR',
		stateName: 'Isfahan',
		locality: 'Isfahan',
		organizationName: 'None',
	},
	keySize: 2048,
	*/
});
await fs.writeFile('privateKey.pem', certificate.privateKey);
await fs.writeFile('publicKey.pem', certificate.publicKey);
await fs.writeFile('certificate.pem', certificate.certificate);
```

## Basic HTTPS
Here is an example of generating an SSL key/cert on the fly and running an HTTPS server on port 443. Use https://localhost:443 to access the created server.
```javascript
import {create as createCertificate} from '@raha.group/self-cert';
import https from 'https';

let certificate = createCertificate({
	domains: ['localhost'],
});
https.createServer({key: certificate.privateKey, cert: certificate.certificate}, function(request, response) {
	response.end('Hello World ~_^');
}).listen(443);
```