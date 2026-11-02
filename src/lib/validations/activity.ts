import { z } from "zod";

export const ActivityFormSchema = z.object({
  periodId: z.string().optional().nullable().or(z.literal("")),
  activityDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal kegiatan tidak valid (YYYY-MM-DD)" }),
  activityTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktu tidak valid (HH:mm)" })
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z
    .string()
    .min(3, { message: "Deskripsi kegiatan minimal 3 karakter" })
    .max(2000, { message: "Deskripsi kegiatan maksimal 2000 karakter" }),
  resultNotes: z.string().max(1000, { message: "Catatan hasil maksimal 1000 karakter" }).optional().nullable().or(z.literal("")),
  privateNotes: z.string().max(1000, { message: "Catatan pribadi maksimal 1000 karakter" }).optional().nullable().or(z.literal("")),
  categorizationStatus: z.enum(["uncategorized", "categorized", "needs_review"]).default("uncategorized"),
  // Penautan opsional saat mencatat (bisa dilengkapi kemudian)
  rhkLinks: z
    .array(
      z.object({
        rhkId: z.string().min(1, { message: "RHK ID wajib ada" }),
        indicatorId: z.string().optional().nullable().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  evidenceFileIds: z.array(z.string()).optional().default([]),
});

export type ActivityFormValues = z.infer<typeof ActivityFormSchema>;

