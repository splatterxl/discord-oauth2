import {
	APIUser,
	RESTPostOAuth2AccessTokenResult
} from 'discord-api-types/v10';
import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	InferGetServerSidePropsType
} from 'next';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Success({
	data: { user, access }
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	console.log(user, access);

	const [show, setShow] = useState(false);
	const [toast, setToast] = useState(false);

	useEffect(() => {
		if (toast) setTimeout(() => setToast(false), 2000);
	}, [toast]);

	return (
		<div
			className={`flex pt-40 justify-start flex-col align-center pb-12 max-w-full sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[40vw] w-full`}
		>
			<div
				id='toast-default'
				className={`m-3 flex items-center w-48 p-1 rounded-md shadow text-slate-200 bg-slate-700 fixed top-0 right-0 fade ${
					toast ? 'visible' : 'hidden'
				}`}
				role='alert'
			>
				<div className='ml-1 text-sm font-normal'>Copied to clipboard.</div>
			</div>

			<div className='flex flex-row justify-start align-center gap-2'>
				<div className='flex flex-col justify-center align-center'>
					<Image
						alt={user.username}
						src={
							user.avatar
								? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
								: `https://cdn.discordapp.com/embed/avatars/${
										user.discriminator === '0'
											? (BigInt(user.id) >> 22n) % 6n
											: parseInt(user.discriminator) % 5
								  }.png`
						}
						width={user.discriminator === '0' ? 40 : 35}
						height={user.discriminator === '0' ? 40 : 35}
						className='rounded-full'
						loading='eager'
					/>
				</div>
				<h1 className='font-extrabold text-4xl'>
					<b>{user.username}</b>
					<span className='text-slate-500'>
						{user.discriminator !== '0' ? `#${user.discriminator}` : null}
					</span>
				</h1>
			</div>
			<p>Successfully authorized. Scopes:</p>
			<ul className='list-disc list-inside ml-1 mt-1'>
				{access.scope.split(' ').map((scope) => (
					<li key={scope}>
						<code className='p-1 bg-slate-700 rounded-md'>{scope}</code>
					</li>
				))}
			</ul>
			<p className='mt-3'>
				Access token:{' '}
				<code
					className='p-1 bg-slate-700 rounded-md'
					onMouseEnter={() => setShow(true)}
					// onMouseLeave={() => setShow(false)}
				>
					{show ? access.access_token : '*'.repeat(access.access_token.length)}
				</code>
				<br />
				{access.refresh_token ? (
					<>
						Refresh token:{' '}
						<code className='p-1 bg-slate-700 rounded-md'>
							{access.refresh_token}
						</code>
					</>
				) : null}
			</p>
		</div>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<
	GetServerSidePropsResult<{
		data: { user: APIUser; access: RESTPostOAuth2AccessTokenResult };
	}>
> {
	const { data } = context.query;

	if (!data)
		return {
			redirect: {
				destination: '/error',
				permanent: false
			}
		};

	return {
		props: {
			data: JSON.parse(Buffer.from(data.toString(), 'base64').toString())
		}
	};
}
