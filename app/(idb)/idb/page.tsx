import dynamic from 'next/dynamic';

const IDBPage = dynamic(() => import('@/modules/idb/idb-page'), {
	ssr: false,
});

export default IDBPage;

