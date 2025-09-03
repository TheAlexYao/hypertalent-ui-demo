"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, X, Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

export interface DealFilters {
  search: string
  category: string
  valueRange: string
  minScore: number
  sortBy: "score" | "value" | "brand" | "deadline"
  sortOrder: "asc" | "desc"
  tags: string[]
}

interface DealFiltersProps {
  filters: DealFilters
  onFiltersChange: (filters: DealFilters) => void
  availableCategories: string[]
  availableTags: string[]
  dealCount: number
}

export function DealFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  dealCount,
}: DealFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof DealFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter("tags", [...filters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter(
      "tags",
      filters.tags.filter((t) => t !== tag),
    )
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "",
      valueRange: "",
      minScore: 0,
      sortBy: "score",
      sortOrder: "desc",
      tags: [],
    })
  }

  const hasActiveFilters =
    filters.search || filters.category || filters.valueRange || filters.minScore > 0 || filters.tags.length > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          <Badge variant="secondary" className="text-xs">
            {dealCount} deals
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Advanced
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search deals, brands, or descriptions..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Match Score</SelectItem>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="brand">Brand</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
        >
          {filters.sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.valueRange} onValueChange={(value) => updateFilter("valueRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Value Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Value</SelectItem>
                <SelectItem value="0-25000">$0 - $25K</SelectItem>
                <SelectItem value="25000-50000">$25K - $50K</SelectItem>
                <SelectItem value="50000-100000">$50K - $100K</SelectItem>
                <SelectItem value="100000+">$100K+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Minimum Match Score: {filters.minScore}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filters.minScore}
              onChange={(e) => updateFilter("minScore", Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="default" className="text-xs gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="w-2 h-2" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter((tag) => !filters.tags.includes(tag))
                .slice(0, 6)
                .map((tag) => (
                  <Button key={tag} variant="outline" size="sm" onClick={() => addTag(tag)} className="text-xs h-6">
                    {tag}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
