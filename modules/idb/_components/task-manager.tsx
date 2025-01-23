'use client';

import React from 'react';
import { getTasks, insertMockData } from './helper';

interface TaskManagerProps {}

interface Task {
	id: number;
	title: string;
	completed: boolean;
}

export const TaskManager = ({}) => {
	const [tasks, setTasks] = React.useState<Task[]>([]);

	React.useEffect(() => {
		async function init() {
			await insertMockData();
			const tasks = await getTasks();
			setTasks(tasks);
		}
		init();
	}, []);

	return (
		<div>
			{/* list data task */}
			{tasks.map(task => (
				<div key={task.id}>
					{task.title} - {task.completed ? 'Completed' : 'Not completed'}
				</div>
			))}
		</div>
	);
};
