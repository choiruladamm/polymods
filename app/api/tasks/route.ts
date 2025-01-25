import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { paginationSchema, taskSchema } from './schema';

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
			pagination: {
				currentPage: page,
				limit,
				totalItems: total,
				totalPages,
				hasNextPage: page < totalPages,
			},
			data: tasks,
		});
	} catch (error) {}
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

	return NextResponse.json({ data: task }, { status: 201 });
}

// export async function PUT(req: Request) {
// 	const body = await req.json();
// 	const parsed = taskSchema.safeParse(body);

// 	if (!parsed.success) {
// 		return NextResponse.json(parsed.error.errors, { status: 400 });
// 	}

// 	const task = await prisma.task.update({
// 		where: { id: body.id },
// 		data: {
// 			...parsed.data,
// 			deadline: new Date(parsed.data.deadline),
// 		},
// 	});

// 	return NextResponse.json(task);
// }

// export async function DELETE(req: Request) {
// 	const { id } = await req.json();

// 	if (!id) {
// 		return NextResponse.json(
// 			{ message: 'Task ID is required' },
// 			{ status: 400 },
// 		);
// 	}

// 	await prisma.task.delete({ where: { id } });

// 	return NextResponse.json({ message: 'Task deleted' });
// }
