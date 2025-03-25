import { z } from 'zod';

export const authorsSchema = z
	.object({
		name: z.string().min(3, 'Author name is required'),
		bio: z.string().optional(),
	})
	.strict();

export const updateAuthorSchema = authorsSchema
	.partial()
	.refine(data => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});
