import { useRouter } from 'next/router';

export default function Home() {
	const router = useRouter();
	const { name, description } = router.query;

	return (
		<div
			className={`flex justify-center flex-col align-center pb-12 max-w-full sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw]`}
		>
			<h1 className='font-extrabold text-4xl'>
				{name
					?.toString()
					.replace(/[\-_ ]+/g, ' ')
					.replaceAll(/\b[a-z]/g, (matched) => matched.toUpperCase()) ??
					'Error'}
			</h1>
			<p>
				{description?.toString() ??
					'An error occured while extracting the access token.'}
			</p>
		</div>
	);
}
