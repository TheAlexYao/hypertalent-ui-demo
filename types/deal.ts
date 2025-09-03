export interface Deal {
  id: string
  brand: string
  title: string
  category: string
  valueRange: string
  matchScore: number
  description: string
  tags: string[]
  deadline?: string
  requirements?: string[]
  engagement?: number
  reach?: string
  conversions?: string
  industry?: string
  companySize?: string
  duration?: string
  startDate?: string
  contact?: {
    name?: string
    email?: string
    department?: string
  }
  linkedStepId?: string
  status?: "new" | "contacted" | "negotiating" | "closed" | "rejected"
  createdAt: string
  updatedAt: string
}
