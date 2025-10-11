export interface DealSearchPayload {
  drive_link: string
  prompt: string
  categories?: string[] | null
  min_company_size?: string | null
  geographic_focus?: string | null
  exclude_industries?: string[] | null
}

export interface DealSearchResponse {
  search_id: string
  status?: "queued" | "in_progress" | "completed" | "failed"
  message?: string
  submitted_at?: string
}

export interface BackendDealContact {
  name?: string
  email?: string
  department?: string
}

export interface BackendDeal {
  id: string
  brand: string
  title: string
  category?: string
  value_range?: string
  match_score?: number
  description?: string
  tags?: string[]
  status?: string
  insights?: string[]
  requirements?: string[]
  contact?: BackendDealContact
  metadata?: Record<string, unknown>
}

export interface DealSearchStatusResponse {
  search_id: string
  status: "queued" | "in_progress" | "completed" | "failed"
  progress?: number
  started_at?: string
  completed_at?: string
  message?: string
  deals?: BackendDeal[]
  insights?: string[]
  spreadsheet_url?: string
  error?: string
}

export interface DriveFolderSummary {
  id: string
  name: string
  path?: string
  fileCount?: number
  webViewLink?: string
}

export interface DriveFoldersResponse {
  status: string
  folders: DriveFolderSummary[]
  count: number
}

export interface DriveFileSummary {
  id: string
  name: string
  mimeType?: string
  size?: number
  modifiedTime?: string
  webViewLink?: string
}

export interface DriveFolderFilesResponse {
  status: string
  files: DriveFileSummary[]
  count: number
}

export interface AnalyzeTalentResponse {
  status: string
  message?: string
  deals?: BackendDeal[]
  spreadsheet_url?: string
  summary?: Record<string, unknown>
}

export type SpreadsheetResponse = string | { url: string; [key: string]: unknown }

export interface AuthStatusResponse {
  authenticated: boolean
  email?: string
  name?: string
  message?: string
}
