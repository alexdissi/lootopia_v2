import { z } from "zod";

export const formSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    description: z.string().optional(),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    location: z.string().optional(),
    mode: z.enum(["PUBLIC", "PRIVATE"]),
    fee: z.coerce.number().min(0).optional(),
    mapStyle: z.string().optional(),
    steps: z
        .array(
            z.object({
                description: z
                    .string()
                    .min(3, "La description doit contenir au moins 3 caractères"),
                stepOrder: z.number().int().min(1),
            }),
        )
        .min(1, "Au moins une étape est requise"),
});

export type FormValues = z.infer<typeof formSchema>;
