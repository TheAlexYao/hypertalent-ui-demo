import { apiGet, apiPost } from "@/utils/api-client"
import type {
  AnalyzeTalentResponse,
  AuthStatusResponse,
  DealSearchPayload,
  DealSearchResponse,
  DealSearchStatusResponse,
  DriveFolderFilesResponse,
  DriveFoldersResponse,
  SpreadsheetResponse,
} from "@/types/backend"

const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.append(key, Array.isArray(value) ? value.join(",") : String(value))
  })

  const query = searchParams.toString()
  return query.length > 0 ? `?${query}` : ""
}

export const getAuthStatus = () => apiGet<AuthStatusResponse>("/auth/status")

export const getGoogleAuthUrl = () =>
  apiGet<{ authorization_url: string; instructions?: string }>("/auth/login")

export const initiateDealSearch = (payload: DealSearchPayload) =>
  apiPost<DealSearchResponse>("/api/deals/search", payload)

export const initiateDealSearchSync = (payload: DealSearchPayload) =>
  apiPost<DealSearchStatusResponse>("/api/deals/search/sync", payload)

export const getDealSearchStatus = (searchId: string) =>
  apiGet<DealSearchStatusResponse>(`/api/deals/status/${encodeURIComponent(searchId)}`)

export const listDriveFolders = () => apiGet<DriveFoldersResponse>("/drive/folders")

export const listDriveFolderFiles = (folderId: string) =>
  apiGet<DriveFolderFilesResponse>(`/drive/folder/${encodeURIComponent(folderId)}/files`)

interface AnalyzeTalentOptions {
  folderId?: string | null
  limit?: number
  exportCsv?: boolean
  createSheet?: boolean
}

export const analyzeDriveTalent = ({ folderId, limit, exportCsv, createSheet }: AnalyzeTalentOptions = {}) => {
  const query = buildQueryString({
    folder_id: folderId ?? undefined,
    limit,
    export_csv: exportCsv,
    create_sheet: createSheet,
  })
  return apiPost<AnalyzeTalentResponse>(`/drive/analyze-talent${query}`)
}

export const createDealsSpreadsheet = (folderId: string, { limit }: { limit?: number } = {}) => {
  const query = buildQueryString({ limit })
  return apiPost<SpreadsheetResponse>(`/drive/spreadsheet/${encodeURIComponent(folderId)}${query}`)
}
