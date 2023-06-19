import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function TryHash() {
	const router = useRouter();
	const [loaded, setLoaded] = useState('');

	useEffect(() => {
		try {
			const url = new URL(router.asPath, 'https://splt.dev/');

			if (url.hash) {
				const hash = url.hash.slice(1);

				const searchParams = new URLSearchParams(hash);

				router.push(`/api/callback?${searchParams.toString()}`);
			} else {
				router.replace({
					pathname: '/error'
				});
			}
		} catch (err: any) {
			router.replace({
				pathname: '/error',
				query: { name: err.toString() }
			});
		}
	}, []);

	return <>{loaded}</>;
}
