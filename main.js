import forge from 'https://esm.sh/gh/digitalbazaar/forge@v1.3.1';
let {pki} = forge;

let checkIPv4 = function(value) {
	let blocks = value.split('.');
	return blocks.length == 4 && blocks.map(block => Number.parseInt(block)).every(block => block >= 0 && block <= 255);
};
let checkIPv6 = function(value) {
	let blocks = value.split(':');
	return blocks.length >= 3 && blocks.length <= 8 && blocks.filter(block => block).map(block => Number.parseInt(block, 16)).every(block => block >= 0 && block <= 65536);
};
export let create = function({attributes = {}, domains = [], keySize = 2048, expires = new Date(2050, 1)} = {}) {
	let keys = pki.rsa.generateKeyPair(keySize);
	// let keys = pki.ed25519.generateKeyPair();
	
	let certificate = pki.createCertificate();
	certificate.publicKey = keys.publicKey;
	certificate.serialNumber = '01';

	certificate.validity.notBefore = new Date();
	certificate.validity.notAfter = expires;

	let properties = [
		{name: 'commonName', value: attributes.commonName ?? domains[0]},
		{name: 'countryName', value: attributes.countryName ?? 'IR'},
		{name: 'stateOrProvinceName', value: attributes.stateName ?? 'Isfahan'},
		{name: 'localityName', value: attributes.locality ?? 'Isfahan'},
		{name: 'organizationName', value: attributes.organizationName ?? 'None'},
	];
	certificate.setSubject(properties);
	certificate.setIssuer(properties);

	certificate.setExtensions([
		{
			name: 'basicConstraints',
			cA: true
		},
		{
			name: 'keyUsage',
			keyCertSign: true,
			digitalSignature: true,
			nonRepudiation: true,
			keyEncipherment: true,
			dataEncipherment: true
		},
		{
			name: 'subjectAltName',
			altNames: [
				...function*() {
					/* 1: Mail, 2: DNS, 4: directoryName, 6: URI, 7: IP */
					for (let domain of domains) {
						yield {
							type: checkIPv4(domain) || checkIPv6(domain) ? 7 : 2,
							value: domain
						};
					}
				}()
			]
		}
	]);

	certificate.sign(keys.privateKey, forge.md.sha256.create());
	return {
		privateKey: pki.privateKeyToPem(keys.privateKey),
		publicKey: pki.publicKeyToPem(keys.publicKey),
		certificate: pki.certificateToPem(certificate)
	};
};