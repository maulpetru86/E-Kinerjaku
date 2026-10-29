import { z } from "zod";

export const RHKIndicatorSchema = z.object({
  id: z.string().optional(),
  aspect: z.string().max(50, "Aspek maksimal 50 karakter").optional().nullable().or(z.literal("")),
  indicatorText: z
    .string()
    .min(3, { message: "Teks indikator kinerja minimal 3 karakter" })
    .max(500, { message: "Teks indikator maksimal 500 karakter" }),
  targetValue: z.string().max(50, "Target maksimal 50 karakter").optional().nullable().or(z.literal("")),
  targetUnit: z.string().max(50, "Satuan maksimal 50 karakter").optional().nullable().or(z.literal("")),
  targetPeriodText: z.string().max(100, "Periode target maksimal 100 karakter").optional().nullable().or(z.literal("")),
  reviewStatus: z.enum(["pending_review", "confirmed", "edited"]).default("confirmed"),
});

export const RHKFormSchema = z.object({
  periodId: z.string().min(1, { message: "Periode kinerja wajib dipilih" }),
  sourceDocumentId: z.string().optional().nullable(),
  intervenedLeadRhk: z
    .string()
    .max(500, { message: "RHK pimpinan yang diintervensi maksimal 500 karakter" })
    .optional()
    .nullable()
    .or(z.literal("")),
  individualRhk: z
    .string()
    .min(3, { message: "Rencana Hasil Kerja (RHK) minimal 3 karakter" })
    .max(500, { message: "Rencana Hasil Kerja maksimal 500 karakter" }),
  category: z.enum(["utama", "tambahan"], {
    message: "Kategori RHK harus salah satu dari: utama atau tambahan",
  }),
  notes: z.string().max(500, { message: "Catatan maksimal 500 karakter" }).optional().nullable().or(z.literal("")),
  status: z.enum(["active", "archived"]).default("active"),
  indicators: z
    .array(RHKIndicatorSchema)
    .min(1, { message: "Setiap RHK wajib memiliki minimal 1 indikator kinerja" }),
});

export const RHKBatchConfirmSchema = z.object({
  periodId: z.string().min(1, { message: "Periode kinerja wajib dipilih" }),
  sourceDocumentId: z.string().optional().nullable(),
  rhks: z
    .array(
      z.object({
        intervenedLeadRhk: z.string().optional().nullable().or(z.literal("")),
        individualRhk: z.string().min(3, { message: "RHK individu minimal 3 karakter" }),
        category: z.enum(["utama", "tambahan"]),
        indicators: z.array(RHKIndicatorSchema).min(1, { message: "Minimal 1 indikator harus tersedia" }),
      })
    )
    .min(1, { message: "Minimal 1 butir RHK harus dikonfirmasi" }),
});

export type RHKIndicatorValues = z.infer<typeof RHKIndicatorSchema>;
export type RHKFormValues = z.infer<typeof RHKFormSchema>;
export type RHKBatchConfirmValues = z.infer<typeof RHKBatchConfirmSchema>;

