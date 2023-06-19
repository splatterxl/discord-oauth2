import { NextApiRequest, NextApiResponse } from 'next';

export default async function DiscordCallback(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { error, error_description, code, state } = Object.assign(
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

	if (!code || typeof code !== 'string')
		return res.status(400).send({
			code: 'This field is required.'
		});

	try {
		if (state) {
			const buf = state.toString();
			const txt = Buffer.from(buf, 'base64').toString();

			if (txt.startsWith('client_creds:'))
				return res.redirect(
					`/api/client_credentials?${new URLSearchParams({
						code
					})}&scope=${txt
						.replace(/^client_creds:/, '')
						.split(',')
						.join('&scope=')}`
				);
		}

		const userInfo = await getUserInfo(code);

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

export const getUserInfo = async (code: string) => {
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

	const user = await fetch('https://discord.com/api/v10/users/@me', {
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

	return { access, user };
};