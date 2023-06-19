import { NextPage } from 'next';
import { AppProps } from 'next/app';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/globals.css';

const App: NextPage<AppProps> = ({ Component, pageProps, router }) => {
	return (
		<>
			<Head>
				<title>Discord OAuth2</title>
			</Head>
			<div className='flex justify-center flex-row align-center w-full min-h-screen p-12 bg-slate-800 text-slate-300 font-mono'>
				<Link
					href={router.pathname === '/' ? 'https://splt.dev' : '/'}
					target={router.pathname === '/' ? '_blank' : undefined}
				>
					<Image
						alt='splt.dev'
						src='https://splt.dev/assets/e0e3e0f61d042aa38595bc8e09f2b687c0ec519c.png'
						width={50}
						height={50}
						className='fixed top-0 left-0 m-4'
						loading='eager'
					/>
				</Link>
				<Component {...pageProps} />
				{/* </div> */}
			</div>
		</>
	);
};

export default App;
