import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, getUser } from './callback';

export default async function ClientCreds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { code, scope, client_id, client_secret } = req.query;

	if (!code || typeof code !== 'string')
		return res.status(400).send({
			code: 'This field is required.'
		});

	const scopes = Array.isArray(scope) ? scope : scope ? [scope] : [];

	try {
		const {
			user: user,
			access: { access_token, refresh_token }
		} = await getToken(code);

		if (
			!process.env.CLIENT_OWNER ||
			!process.env.CLIENT_OWNER.split(',').includes(user.id as string)
		) {
			await deleteToken(access_token, refresh_token);

			throw 'AccessError[403]: invalid_grant';
		}

		const access = await clientCredentials(
			scopes,
			client_id?.toString(),
			client_secret?.toString()
		);

		return res.redirect(
			`/success?data=${Buffer.from(
				JSON.stringify({ user: await getUser(access), access })
			).toString('base64url')}`
		);
	} catch (err: any) {
		return res.redirect(
			`/error?${new URLSearchParams({
				name: err.toString()
			})}`
		);
	}
}

export const deleteToken = async (token: string, refresh: string) => {
	await fetch('https://discord.com/api/v10/oauth2/token/revoke', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `token=${token}&token_type_hint=access_token`
	});

	await fetch('https://discord.com/api/v10/oauth2/token/revoke', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `token=${refresh}&token_type_hint=refresh_token`
	});
};

export const clientCredentials = async (
	scope: string[],
	client_id?: string,
	client_secrets?: string
) => {
	const json = await fetch('https://discord.com/api/v10/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${
				client_id && client_secrets
					? process.env.CLIENT_AUTH!
					: Buffer.from(`${client_id}:${client_secrets}`).toString('base64')
			}`
		},
		body: `grant_type=client_credentials&scope=${scope.join('%20')}`
	}).then(async (res) => {
		const json = await res.json();

		if (!res.ok)
			throw `HTTPError[${res.status}]${json.error ? `: ${json.error}` : ''}`;

		return json;
	});

	return json;
};
