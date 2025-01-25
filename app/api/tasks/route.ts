import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const taskSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	status: z.enum(['Todo', 'In Progress', 'Done']),
	deadline: z.string().refine(val => !isNaN(Date.parse(val)), {
		message: 'Invalid deadline date',
	}),
});

export async function GET() {
	const tasks = await prisma.task.findMany();

	// check if there are tasks
	if (!tasks.length) {
		return NextResponse.json({ message: 'No tasks found' }, { status: 404 });
	}

	return NextResponse.json(tasks);
}

export async function POST(req: Request) {
	const body = await req.json();
	const parsed = taskSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(parsed.error.errors, { status: 400 });
	}

	const task = await prisma.task.create({
		data: {
			...parsed.data,
			deadline: new Date(parsed.data.deadline),
		},
	});

	return NextResponse.json(task, { status: 201 });
}

export async function PUT(req: Request) {
	const body = await req.json();
	const parsed = taskSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(parsed.error.errors, { status: 400 });
	}

	const task = await prisma.task.update({
		where: { id: body.id },
		data: {
			...parsed.data,
			deadline: new Date(parsed.data.deadline),
		},
	});

	return NextResponse.json(task);
}

export async function DELETE(req: Request) {
	const { id } = await req.json();

	if (!id) {
		return NextResponse.json(
			{ message: 'Task ID is required' },
			{ status: 400 },
		);
	}

	await prisma.task.delete({ where: { id } });

	return NextResponse.json({ message: 'Task deleted' });
}
