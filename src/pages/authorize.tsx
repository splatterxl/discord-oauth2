import Link from 'next/link';
import { useState } from 'react';
import { SCOPES as OAuth2Scopes } from './api/authorize';

export default function Home() {
	const [scopes, setScopes] = useState(['identify', 'email', 'guilds']);

	const addScope = (scope: string) =>
		setScopes((scopes) => [...new Set(scopes.concat([scope]))]);

	const removeScope = (toRemove: string) =>
		setScopes((scopes) => [
			...new Set(scopes.filter((scope) => scope !== toRemove))
		]);

	const [showSensitive, setSensitive] = useState(false);
	const [overrideCC, setClientCreds] = useState(false);

	return (
		<div
			className={`flex pt-24 justify-start flex-col align-center pb-12 max-w-full sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw]`}
		>
			<h1 className='font-extrabold text-4xl'>Authorize Discord</h1>
			<p>
				Choose the scopes you want to authorize with. Sensitive scopes will be
				requested using{' '}
				<code className='p-1 bg-slate-700 rounded-md'>client_credentials</code>{' '}
				or <code className='p-1 bg-slate-700 rounded-md'>token</code>.
			</p>
			<div className='flex items-center cursor-pointer mt-2'>
				<input
					id='sensitive'
					type='checkbox'
					checked={showSensitive}
					onChange={(event) => {
						setSensitive(event.target.checked);
					}}
					className='cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600'
				/>
				<label
					htmlFor='sensitive'
					className='cursor-pointer ml-2 text-md font-medium pb-0.5 text-gray-400'
				>
					show sensitive scopes
				</label>
			</div>

			<div className='mt-2'>
				{OAuth2Scopes.map((scope) => {
					if (
						!scopes.includes(scope.name) &&
						(scope.client_creds || scope.token) &&
						!showSensitive
					)
						return null;

					return (
						<div
							key={scope.name}
							className='flex items-center cursor-pointer'
							style={{}}
						>
							<input
								id={scope.name}
								type='checkbox'
								disabled={scope.rpc}
								checked={scopes.includes(scope.name)}
								onChange={(event) => {
									if (event.target.checked) addScope(scope.name);
									else removeScope(scope.name);
								}}
								className='cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600'
							/>
							<label
								htmlFor={scope.name}
								className='cursor-pointer ml-2 text-md font-medium text-gray-300 pb-0.5 text-gray-400'
							>
								<b>{scope.name}</b>
								<span className='hidden md:inline'> – {scope.description}</span>
								{scope.token ? (
									<>
										<span className='text-red-400 hidden sm:inline'>
											{' '}
											[token]
										</span>
										<span className='text-red-400 inline sm:hidden'>*</span>
									</>
								) : null}
								{scope.rpc ? (
									<>
										<span className='text-blue-400 hidden sm:inline'>
											{' '}
											[rpc-only]
										</span>
										<span className='text-blue-400 inline sm:hidden'>+</span>
									</>
								) : null}
								{scope.client_creds ? (
									<>
										<span className='text-yellow-400 hidden sm:inline'>
											{' '}
											[client-creds]
										</span>
										<span className='text-yellow-400 inline sm:hidden'>=</span>
									</>
								) : null}
							</label>
						</div>
					);
				})}
			</div>

			<div className='flex items-center cursor-pointer mt-2 mb-4'>
				<input
					id='client_creds'
					type='checkbox'
					checked={overrideCC}
					onChange={(event) => {
						setClientCreds(event.target.checked);
					}}
					className='cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600'
				/>
				<label
					htmlFor='client_creds'
					className='cursor-pointer ml-2 text-md font-medium pb-0.5 text-gray-400'
				>
					override use client_credentials
				</label>
			</div>

			<Link
				href={{
					pathname: '/api/authorize',
					query: { scopes, client_creds: overrideCC ? 'override' : false }
				}}
				className='-mt-1 w-0 pb-12 '
			>
				<button className='bg-transparent text-slate-400 font-semibold hover:text-slate-300 py-2 px-4 border border-slate-500 hover:border-slate-400 rounded'>
					Authorize
				</button>
			</Link>
		</div>
	);
}
