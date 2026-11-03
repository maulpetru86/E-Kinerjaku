import { z } from "zod";

export const RekapQuerySchema = z.object({
  periodId: z.string().min(1, { message: "ID Periode wajib disertakan" }),
  status: z
    .enum(["belum_ada_bukti", "ada_bukti", "perlu_ditinjau", "siap_direkap"])
    .optional(),
  search: z.string().optional(),
});

export const RhkMappingFormSchema = z.object({
  oldPeriodId: z.string().min(1, { message: "ID Periode Lama wajib disertakan" }),
  newPeriodId: z.string().min(1, { message: "ID Periode Baru wajib disertakan" }),
  oldRhkId: z.string().min(1, { message: "ID RHK Lama wajib disertakan" }),
  newRhkId: z.string().min(1, { message: "ID RHK Baru wajib disertakan" }),
  mappingStatus: z.enum(["suggested", "confirmed", "rejected"]).default("confirmed"),
  similarityScore: z.number().min(0).max(1).optional().nullable(),
  notes: z.string().max(500, { message: "Catatan maksimal 500 karakter" }).optional().nullable(),
});

export const RhkAutoMappingSchema = z.object({
  oldPeriodId: z.string().min(1, { message: "ID Periode Lama wajib disertakan" }),
  newPeriodId: z.string().min(1, { message: "ID Periode Baru wajib disertakan" }),
});

export type RekapQueryValues = z.infer<typeof RekapQuerySchema>;
export type RhkMappingFormValues = z.infer<typeof RhkMappingFormSchema>;
export type RhkAutoMappingValues = z.infer<typeof RhkAutoMappingSchema>;
