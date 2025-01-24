'use client';

import { DBSchema, openDB } from 'idb';

interface MyDatabase extends DBSchema {
	tasks: {
		key: number;
		value: {
			id: number;
			title: string;
			completed: boolean;
		};
		indexes: { 'by-completed': 'completed' };
	};
}

export const db = openDB<MyDatabase>('MyDatabase', 1, {
	upgrade(database) {
		const store = database.createObjectStore('tasks', {
			keyPath: 'id',
			autoIncrement: true,
		});
		store.createIndex('by-completed', 'completed');
	},
});

export async function addTask(task: { title: string; completed: boolean }) {
	const database = await db;
	return database.add('tasks', { id: Date.now(), ...task });
}

export async function getTasks() {
	const database = await db;
	return database.getAll('tasks');
}

export async function insertMockData() {
	const database = await db;
	const mockTasks = [
		{ id: 1, title: 'Buy groceries', completed: false },
		{ id: 2, title: 'Complete project', completed: true },
		{ id: 3, title: 'Workout', completed: false },
		{ id: 4, title: 'Read a book', completed: true },
	];

	for (const task of mockTasks) {
		await database.put('tasks', task); // Use put to avoid duplicate keys
	}
}
