const fastify = require('fastify').default;
const { fetch } = require('undici');
const { URLSearchParams } = require('url');
const crypto = require('crypto');

const server = fastify({
	logger: true
});

server.get('/callback', async (req, reply) => {
	// @ts-ignore
	const code = req.query.code;

	if (!code) return reply.code(400).send('Missing code');
	// @ts-ignore
	if (!req.query.state) return reply.code(400).send('Missing state');

	const data = await fetch('https://discord.com/api/v10/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'authorization_code',
			code,
			redirect_uri: process.env.REDIRECT_URI
		})
	}).then((res) => res.json());

	return data;
});

server.get('/url', async (req, reply) => {
	// @ts-ignore
	const scopes = req.query.scopes ?? ['identify', 'guilds'];

	const state = Buffer.from(
		crypto.getRandomValues(new Uint8Array(16))
	).toString('hex');

	const options = new URLSearchParams({
		client_id: process.env.CLIENT_ID,
		redirect_uri: process.env.REDIRECT_URI,
		response_type: 'code',
		scope: scopes.join(' '),
		state
	});

	reply.redirect(302, `https://discord.com/api/oauth2/authorize?${options}`);
});

server.listen(3000);
