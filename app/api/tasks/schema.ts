import { z } from 'zod';

export const taskSchema = z
	.object({
		title: z.string().min(1, 'Title is required'),
		description: z.string().optional(),
		status: z.enum(['Todo', 'In_Progress', 'Done']).default('Todo'),
		deadline: z.coerce
			.date()
			.min(new Date(), 'Deadline must be in the future')
			.refine(date => date.getFullYear() <= new Date().getFullYear() + 1, {
				message: 'Deadline cannot be more than 1 year ahead',
			}),
	})
	.strict();

export const updateTaskSchema = taskSchema
	.partial()
	.strict()
	.refine(data => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
});
