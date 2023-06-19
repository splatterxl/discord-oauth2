import Link from 'next/link';

export default function Home() {
	return (
		<div
			className={`flex justify-center flex-col align-center pb-12 max-w-full sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw]`}
		>
			<h1 className='font-extrabold text-4xl'>Not Found</h1>
			<p>The page you were looking for wasn't found.</p>
		</div>
	);
}
