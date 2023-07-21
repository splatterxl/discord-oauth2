import { NextApiRequest, NextApiResponse } from 'next';

export default async function Authorize(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const {
		scopes: query,
		client_creds: cq,
		client_id,
		client_secret
	} = req.query;

	const scopes = Array.isArray(query) ? query : query ? [query] : [];

	let client_creds =
		cq === 'override' ||
		scopes.some((v) => SCOPES.find((s) => s.name === v)?.client_creds);

	if (scopes.some((v) => SCOPES.find((s) => s.name === v)?.rpc))
		return res.status(400).send({
			scopes: Object.fromEntries(
				scopes
					.filter((v) => SCOPES.find((s) => s.name === v)?.rpc)
					.map((scope) => [
						scope,
						'This scope is only for use in the local RPC client.'
					])
			)
		});

	if (
		scopes.some((v) => SCOPES.find((s) => s.name === v)?.client_creds) &&
		scopes.some((v) => SCOPES.find((s) => s.name === v)?.token)
	)
		return res.redirect(
			'/error?name=Invalid%20Request&description=Cannot use both client_credentials and token auth.'
		);

	if (scopes.some((v) => !SCOPES.find((s) => s.name === v))) {
		return res.status(404).send({
			scopes: Object.fromEntries(
				scopes
					.filter((v) => !SCOPES.find((s) => s.name === v))
					.map((scope) => [scope, 'Invalid scope.'])
			)
		});
	}

	for (const key of ['CLIENT_ID', 'CLIENT_SECRET', 'CLIENT_REDIRECT'].concat(
		client_creds ? ['CLIENT_OWNER'] : []
	)) {
		if (!(key in process.env))
			return res.status(503).send(
				process.env.NODE_ENV === 'development'
					? {
							error: 'Missing env'
					  }
					: {
							env: 'Service Unavailable'
					  }
			);
	}

	return res.redirect(
		`https://discord.com/api/v10/oauth2/authorize?${new URLSearchParams({
			client_id: process.env.CLIENT_ID!,
			scope: client_creds
				? 'identify'
				: [
						...new Set(
							scopes
								.filter((v) => {
									const s = SCOPES.find((s) => s.name === v);
									return s && (s.token || !s.client_creds);
								})
								.concat(['identify'])
						)
				  ].join(' '),
			response_type: scopes.some((v) => SCOPES.find((s) => s.name === v)?.token)
				? 'token'
				: 'code',
			state: client_creds
				? Buffer.from(
						`client_creds:${scopes
							.concat(['identify'])
							.join(',')}:${client_id}+${client_secret}`
				  ).toString('base64')
				: '',
			prompt: 'none',
			redirect_uri: process.env.CLIENT_REDIRECT!
		})}`
	);
}

export const SCOPES = [
	{
		name: 'activities.read',
		description: 'fetch activities list',
		client_creds: false,
		token: true
	},
	{
		name: 'activities.write',
		description: 'write presences',
		client_creds: false,
		token: true
	},
	{
		name: 'applications.builds.read',
		description: 'read build data',
		client_creds: false
	},
	{
		name: 'applications.builds.upload',
		description: 'upload builds',
		client_creds: false,
		token: true
	},
	{
		name: 'applications.commands.update',
		description: 'update slashies',
		client_creds: true
	},
	{
		name: 'applications.commands.permissions.update',
		description: 'update command perms',
		client_creds: false
	},
	{
		name: 'applications.entitlements',
		description: 'read entitlements'
	},
	{
		name: 'applications.store.update',
		description: 'read & update store data'
	},
	{ name: 'connections', description: 'get self connections' },
	{
		name: 'dm_channels.read',
		description: 'list dm channels',
		client_creds: false,
		token: true
	},
	{
		name: 'email',
		description: 'get self email'
	},
	{ name: 'gdm.join', description: 'join group dms' },
	{ name: 'guilds', description: 'list guilds' },
	{ name: 'guilds.join', description: 'join guilds' },
	{
		name: 'guilds.members.read',
		description: 'get self member info'
	},
	{ name: 'identify', description: 'get user information' },
	{
		name: 'messages.read',
		description: 'read messages',
		rpc: true
	},
	{
		name: 'relationships.read',
		description: 'list relationships',
		client_creds: false,
		token: true
	},
	{
		name: 'role_connections.write',
		description: 'write role metadata'
	},
	{
		name: 'voice',
		description: 'connect to voice',
		client_creds: true
	}
] satisfies {
	name: string;
	description: string;
	client_creds?: boolean;
	rpc?: boolean;
	token?: boolean;
}[];
