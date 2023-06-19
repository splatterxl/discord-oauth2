import Link from 'next/link';

export default function Home() {
	return (
		<div
			className={`flex justify-center flex-col align-center pb-12 max-w-full sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw]`}
		>
			<h1 className='font-extrabold text-4xl'>Discord OAuth2</h1>
			<p>Easily get your Discord access token.</p>
			<Link href='/authorize' className='mt-2'>
				<button className='bg-transparent text-slate-400 font-semibold hover:text-slate-300 py-2 px-4 border border-slate-500 hover:border-slate-400 rounded'>
					Authorize
				</button>
			</Link>
		</div>
	);
}
