import React from 'react';
import { TaskManager } from './_components';

interface IDBPageProps {}

const IDBPage: React.FC<IDBPageProps> = ({}) => {
	return (
		<React.Fragment>
			<TaskManager />
		</React.Fragment>
	);
};

export default IDBPage;
