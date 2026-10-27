export type PeriodStatus = "active" | "closed" | "archived";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformancePeriod {
  id: string;
  userId: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: PeriodStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RHK {
  id: string;
  userId: string;
  periodId: string;
  sourceDocumentId?: string | null;
  intervenedLeadRhk?: string | null;
  individualRhk: string;
  category: "utama" | "tambahan";
  notes?: string | null;
  status: "active" | "archived";
  indicators?: RHKIndicator[];
  createdAt: string;
  updatedAt: string;
}

export interface RHKIndicator {
  id: string;
  rhkId: string;
  aspect?: string | null; // e.g. Kuantitas, Kualitas, Waktu
  indicatorText: string;
  targetValue?: string | null;
  targetUnit?: string | null;
  targetPeriodText?: string | null;
  sourceText?: string | null;
  reviewStatus: "pending_review" | "confirmed" | "edited";
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  periodId?: string | null;
  activityDate: string; // YYYY-MM-DD
  activityTime?: string | null; // HH:mm
  description: string;
  resultNotes?: string | null;
  privateNotes?: string | null;
  categorizationStatus: "uncategorized" | "categorized" | "needs_review";
  createdAt: string;
  updatedAt: string;
  // Relations
  rhkLinks?: Array<{
    rhkId: string;
    indicatorId?: string | null;
    rhk?: RHK;
  }>;
  evidenceLinks?: Array<{
    evidenceFileId: string;
    file?: EvidenceFile;
  }>;
}

export interface EvidenceFile {
  id: string;
  userId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum?: string | null;
  uploadedAt: string;
  evidenceDate?: string | null;
  sourceLocation?: string | null;
  processingStatus: "uploaded" | "processing" | "completed" | "failed";
  aiSummary?: string | null;
  userDescription?: string | null;
  reviewStatus: "new" | "needs_review" | "categorized";
  createdAt: string;
  updatedAt: string;
  // Attached relations
  linkedActivitiesCount?: number;
  linkedRhksCount?: number;
}

export interface AISuggestion {
  id: string;
  userId: string;
  entityType: "evidence_file" | "activity" | "rhk_mapping";
  entityId: string;
  suggestionType: "metadata" | "rhk_link" | "summary";
  suggestionPayload: Record<string, unknown>;
  confidenceLabel?: "high" | "medium" | "low" | "uncertain" | null;
  status: "pending" | "accepted" | "modified" | "rejected";
  createdAt: string;
  reviewedAt?: string | null;
}
