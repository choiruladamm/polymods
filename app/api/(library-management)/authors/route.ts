import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { authorsSchema } from './schema';

export async function GET(req: Request) {
	try {
		const authors = await prisma.author.findMany();

		return NextResponse.json({ data: authors });
	} catch (error) {
		console.error('[AUTHORS_FETCH_ERROR]', error);

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

export async function POST(req: Request) {
	try {
		const rawBody = await req.json();
		const parsed = authorsSchema.safeParse(rawBody);

		if (!parsed.success) {
			return NextResponse.json(parsed.error.errors, { status: 400 });
		}

		const author = await prisma.author.create({
			data: parsed.data,
		});

		return NextResponse.json({ data: author }, { status: 201 });
	} catch (error) {
		console.error('[AUTHOR_CREATION_ERROR]', error);

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
