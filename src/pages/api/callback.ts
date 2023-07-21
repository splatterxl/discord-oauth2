import { APIUser } from 'discord-api-types/v10';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DiscordCallback(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { error, error_description, code, state, access_token: token, token_type, expires_in, scope } = Object.assign(
		{},
		req.query
	);

	if (!error && !code && !state) return res.redirect('/try-hash');

	if (error)
		return res.redirect(
			`/error?${new URLSearchParams({
				name: error.toString(),
				description: error_description?.toString() ?? ''
			})}`
		);

	if ((!code || typeof code !== 'string') && (!token_type && !token))
		return res.status(400).send({
			code: 'This field is required.'
		});

	try {
		if (state) {
			const buf = state.toString();
			const txt = Buffer.from(buf, 'base64').toString();

			const [, scopes, credentials] = txt.split(':');
			const [client_id, client_secret] = credentials.split('+');

			if (txt.startsWith('client_creds:'))
				return res.redirect(
					`/api/client_credentials?${new URLSearchParams({
						code,
						token, 
						token_type,
						already_authorized: scope,
						expires_in
					} as any)}&scope=${scopes
						.split(',')
						.join(
							'&scope='
						)}&client_id=${client_id}&client_secret=${client_secret}`
				);
		}

		const userInfo = !token ? await getToken(code) : {
			user: getUser({
				access_token: token,
				token_type,
				scope: already_authorized,
				expires_in,
			}),
			access: {
				access_token: token,
				refresh_token: ""
			}
		};

		return res.redirect(
			`/success?data=${Buffer.from(JSON.stringify(userInfo)).toString(
				'base64url'
			)}`
		);
	} catch (err: any) {
		return res.redirect(
			`/error?${new URLSearchParams({
				name: err.toString()
			})}`
		);
	}
}

export const getToken = async (code: string) => {
	// const text = new URLSearchParams({
	// 	client_id: process.env.CLIENT_ID!,
	// 	client_secret: process.env.CLIENT_SECRET!,
	// 	grant_type: 'authorization_code',
	// 	code: code,
	// 	redirect_uri: process.env.CLIENT_REDIRECT!
	// }).toString();

	const access: {
		access_token: string;
		expires_in: number;
		refresh_token: string;
		scope: string;
		token_type: string;
	} = await fetch('https://discord.com/api/v10/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${process.env.CLIENT_REDIRECT}`
	}).then(async (res) => {
		const json = await res.json();

		if (!res.ok)
			throw `HTTPError[${res.status}]${json.error ? `: ${json.error}` : ''}`;

		return json;
	});

	return { access, user: await getUser(access) };
};

export const getUser = (access: {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
}): Promise<APIUser> => {
	return fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			Authorization: `${access.token_type} ${access.access_token}`
		}
	}).then(async (res) => {
		const json = await res.json();

		if (!res.ok)
			throw `HTTPError[${json.code ?? res.status}]${
				json.message ? `: ${json.message}` : ''
			}`;

		return json;
	});
};
