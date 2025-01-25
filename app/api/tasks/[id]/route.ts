import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { updateTaskSchema } from '../schema';

interface RequestParams {
	params: {
		id: string;
	};
}

export async function PATCH(req: Request, { params }: RequestParams) {
	if (!params.id) {
		return NextResponse.json(
			{ message: 'Task ID is required' },
			{ status: 400 },
		);
	}

	try {
		const body = await req.json();
		const parsed = updateTaskSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(parsed.error.errors, { status: 400 });
		}

		const updatedTask = await prisma.task.update({
			where: { id: params.id },
			data: {
				...parsed.data,
			},
		});

		return NextResponse.json({ data: updatedTask });
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return NextResponse.json({ error: 'Task not found' }, { status: 404 });
			}
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request, { params }: RequestParams) {
	if (!params.id) {
		return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
	}

	try {
		const deletedTask = await prisma.task.delete({
			where: { id: params.id },
		});

		return NextResponse.json({
			message: 'Task deleted',
			data: deletedTask,
		});
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return NextResponse.json(
					{
						error: 'Not Found',
						message: 'No task found with the provided ID',
					},
					{ status: 404 },
				);
			}
		}

		return NextResponse.json(
			{
				error: 'Internal Server Error',
				message: 'An unexpected error occurred',
			},
			{ status: 500 },
		);
	}
}
