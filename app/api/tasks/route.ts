import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { paginationSchema, taskSchema } from './schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function GET(req: Request) {
	try {
		// extract query parameters
		const { searchParams } = new URL(req.url);
		const params = {
			page: searchParams.get('page'),
			limit: searchParams.get('limit'),
		};

		// validate query parameters
		const validation = paginationSchema.safeParse(params);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: 'Invalid query parameters',
					details: validation.error.errors,
				},
				{ status: 400 },
			);
		}

		const { page, limit } = validation.data;
		const skip = (page - 1) * limit;

		// query database & paginate results
		const [total, tasks] = await prisma.$transaction([
			prisma.task.count(),
			prisma.task.findMany({
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		// handle page not found
		if (page > totalPages && totalPages > 0) {
			return NextResponse.json(
				{
					error: 'Page not found',
					currentPage: page,
					totalPages,
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			meta: {
				currentPage: page,
				limit,
				totalItems: total,
				totalPages,
				hasNextPage: page < totalPages,
			},
			data: tasks,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				message: 'Failed to fetch tasks',
			},
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const rawBody = await req.json();
		const parsed = taskSchema.safeParse(rawBody);

		if (!parsed.success) {
			return NextResponse.json(parsed.error.errors, { status: 400 });
		}

		const task = await prisma.$transaction(async tx => {
			const existingTask = await tx.task.findFirst({
				where: {
					title: parsed.data.title,
					status: 'Todo',
				},
			});

			if (existingTask) {
				throw new Error('Duplicate pending task with same title');
			}

			return tx.task.create({
				data: {
					...parsed.data,
					deadline: parsed.data.deadline,
				},
			});
		});

		return NextResponse.json({ data: task }, { status: 201 });
	} catch (error) {
		console.error('[TASK_CREATION_ERROR]', error);

		if (error instanceof Error && error.message.includes('Duplicate')) {
			return NextResponse.json(
				{ error: 'Conflict', message: error.message },
				{ status: 409 },
			);
		}

		if (error instanceof PrismaClientKnownRequestError) {
			return NextResponse.json(
				{
					error: 'Database Error',
					code: error.code,
					meta: error.meta,
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
