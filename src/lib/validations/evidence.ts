import { z } from "zod";

export const EvidenceUpdateSchema = z.object({
  userDescription: z.string().max(500, { message: "Deskripsi berkas maksimal 500 karakter" }).optional().nullable().or(z.literal("")),
  evidenceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal bukti tidak valid (YYYY-MM-DD)" })
    .optional()
    .nullable()
    .or(z.literal("")),
  reviewStatus: z.enum(["new", "needs_review", "categorized"]).optional(),
});

export const EvidenceLinkSchema = z.object({
  evidenceFileId: z.string().min(1, { message: "ID berkas bukti wajib diisi" }),
  activityId: z.string().optional().nullable().or(z.literal("")),
  rhkId: z.string().optional().nullable().or(z.literal("")),
  indicatorId: z.string().optional().nullable().or(z.literal("")),
  action: z.enum(["link", "unlink"]).default("link"),
  notes: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const BatchLinkEvidenceSchema = z.object({
  evidenceFileIds: z.array(z.string()).min(1, { message: "Pilih minimal 1 berkas bukti" }),
  activityId: z.string().optional().nullable().or(z.literal("")),
  rhkId: z.string().optional().nullable().or(z.literal("")),
  indicatorId: z.string().optional().nullable().or(z.literal("")),
});

export type EvidenceUpdateValues = z.infer<typeof EvidenceUpdateSchema>;
export type EvidenceLinkValues = z.infer<typeof EvidenceLinkSchema>;
export type BatchLinkEvidenceValues = z.infer<typeof BatchLinkEvidenceSchema>;

