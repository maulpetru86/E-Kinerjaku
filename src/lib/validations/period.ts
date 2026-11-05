import { z } from "zod";

export const PeriodBaseSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nama periode minimal 3 karakter" })
    .max(100, { message: "Nama periode maksimal 100 karakter" }),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal mulai tidak valid (YYYY-MM-DD)" }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal akhir tidak valid (YYYY-MM-DD)" }),
  status: z.enum(["active", "closed", "archived"], {
    message: "Status periode harus salah satu dari: active, closed, atau archived",
  }),
  notes: z.string().max(500, { message: "Catatan maksimal 500 karakter" }).optional().or(z.literal("")),
});

export const PeriodFormSchema = PeriodBaseSchema.refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: "Tanggal selesai tidak boleh mendahului tanggal mulai",
    path: ["endDate"],
  }
);

export const PeriodUpdateSchema = PeriodBaseSchema.partial().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  },
  {
    message: "Tanggal selesai tidak boleh mendahului tanggal mulai",
    path: ["endDate"],
  }
);

export type PeriodFormValues = z.infer<typeof PeriodFormSchema>;
export type PeriodUpdateValues = z.infer<typeof PeriodUpdateSchema>;
