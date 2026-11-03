import { z } from "zod";

export const AnalyzeActivitySchema = z.object({
  activityId: z.string().min(1, { message: "ID Aktivitas wajib disertakan" }),
  periodId: z.string().optional().nullable().or(z.literal("")),
});

export const AnalyzeEvidenceSchema = z.object({
  evidenceFileId: z.string().min(1, { message: "ID Berkas Bukti wajib disertakan" }),
  periodId: z.string().optional().nullable().or(z.literal("")),
});

export const ReviewSuggestionSchema = z.object({
  action: z.enum(["accept", "modify", "reject"], {
    message: "Aksi harus berupa 'accept', 'modify', atau 'reject'",
  }),
  modifiedPayload: z.record(z.string(), z.unknown()).optional(),
});

export type AnalyzeActivityValues = z.infer<typeof AnalyzeActivitySchema>;
export type AnalyzeEvidenceValues = z.infer<typeof AnalyzeEvidenceSchema>;
export type ReviewSuggestionValues = z.infer<typeof ReviewSuggestionSchema>;
