import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { authorsSchema } from '../schema';

interface RequestParams {
	params: {
		id: string;
	};
}

export async function PATCH(req: Request, { params }: RequestParams) {
	if (!params.id) {
		return NextResponse.json(
			{ error: 'Author ID is required' },
			{ status: 400 },
		);
	}

	// try {
	// 	const body = await req.json();
	// 	const parsed = authorsSchema.safeParse(body);

	// 	if (!parsed.success) {
	// 		return NextResponse.json(parsed.error.errors, { status: 400 });
	// 	}

	// 	const updatedAuthor = await prisma.author.update({
	// 		where: { id: params.id },
	// 		data: {
	// 			...parsed.data,
	// 		},
	// 	});

	// 	return NextResponse.json({ data: updatedAuthor });
	// } catch (error) {
	// 	if (error instanceof PrismaClientKnownRequestError) {
	// 		if (error.code === 'P2025') {
	// 			return NextResponse.json(
	// 				{ error: 'Author not found' },
	// 				{ status: 404 },
	// 			);
	// 		}
	// 	}

	// 	return NextResponse.json(
	// 		{ error: 'Internal Server Error' },
	// 		{ status: 500 },
	// 	);
	// }

	return NextResponse.json(params.id);
}

export async function DELETE(req: Request, { params }: RequestParams) {
	if (!params.id) {
		return NextResponse.json(
			{ error: 'Author ID is required' },
			{ status: 400 },
		);
	}

	try {
		const deletedAuthor = await prisma.author.delete({
			where: { id: params.id },
		});

		return NextResponse.json({
			message: 'Author deleted',
			data: deletedAuthor,
		});
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return NextResponse.json(
					{ error: 'Author not found' },
					{ status: 404 },
				);
			}
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
