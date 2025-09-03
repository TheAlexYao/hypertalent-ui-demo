"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadZone, type UploadedFile } from "./file-upload-zone"
import {
  Plus,
  User,
  Star,
  TrendingUp,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react"
import { useState } from "react"

export interface TalentProfile {
  id: string
  name: string
  category: string
  avatar?: string
  bio?: string
  location?: string
  stats: {
    followers: number
    engagement: number
    deals: number
    avgDealValue: number
  }
  socialMedia: {
    instagram?: string
    twitter?: string
    youtube?: string
    website?: string
  }
  demographics: {
    ageRange: string
    topLocations: string[]
    interests: string[]
  }
  brandAlignment: {
    categories: string[]
    values: string[]
    pastBrands: string[]
  }
  goals: {
    targetDeals: number
    preferredCategories: string[]
    minDealValue: number
  }
  documents: UploadedFile[]
  status: "active" | "inactive"
  lastUpdated: string
}

interface TalentProfileManagerProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
}

const mockTalents: TalentProfile[] = [
  {
    id: "talent-1",
    name: "Alex Rodriguez",
    category: "Professional Athlete",
    bio: "Professional baseball player with 15+ years experience. Passionate about fitness, nutrition, and inspiring the next generation.",
    location: "Miami, FL",
    stats: { followers: 2500000, engagement: 4.8, deals: 24, avgDealValue: 75000 },
    socialMedia: {
      instagram: "@alexrod",
      twitter: "@AROD",
      website: "alexrodriguez.com",
    },
    demographics: {
      ageRange: "25-45",
      topLocations: ["USA", "Latin America", "Spain"],
      interests: ["Sports", "Fitness", "Business", "Family"],
    },
    brandAlignment: {
      categories: ["Sports", "Fitness", "Nutrition", "Luxury", "Finance"],
      values: ["Excellence", "Family", "Hard Work", "Innovation"],
      pastBrands: ["Nike", "Pepsi", "Rolex", "Mercedes-Benz"],
    },
    goals: {
      targetDeals: 8,
      preferredCategories: ["Sports", "Luxury", "Finance"],
      minDealValue: 50000,
    },
    documents: [],
    status: "active",
    lastUpdated: "2024-01-15",
  },
  {
    id: "talent-2",
    name: "Emma Chen",
    category: "Lifestyle Influencer",
    bio: "Lifestyle content creator focused on sustainable living, wellness, and authentic storytelling. Building a community of conscious consumers.",
    location: "Los Angeles, CA",
    stats: { followers: 890000, engagement: 7.2, deals: 18, avgDealValue: 25000 },
    socialMedia: {
      instagram: "@emmachen",
      youtube: "Emma Chen Lifestyle",
      website: "emmachen.co",
    },
    demographics: {
      ageRange: "22-35",
      topLocations: ["USA", "Canada", "Australia"],
      interests: ["Sustainability", "Wellness", "Travel", "Fashion"],
    },
    brandAlignment: {
      categories: ["Wellness", "Sustainability", "Fashion", "Travel", "Beauty"],
      values: ["Authenticity", "Sustainability", "Wellness", "Community"],
      pastBrands: ["Patagonia", "Glossier", "Whole Foods", "Airbnb"],
    },
    goals: {
      targetDeals: 12,
      preferredCategories: ["Wellness", "Sustainability", "Fashion"],
      minDealValue: 15000,
    },
    documents: [],
    status: "active",
    lastUpdated: "2024-01-14",
  },
  {
    id: "talent-3",
    name: "Marcus Johnson",
    category: "Gaming Creator",
    bio: "Professional esports player and content creator. Streaming daily on Twitch and creating educational gaming content for aspiring players.",
    location: "Austin, TX",
    stats: { followers: 1200000, engagement: 6.1, deals: 15, avgDealValue: 35000 },
    socialMedia: {
      instagram: "@marcusgaming",
      twitter: "@MarcusPlays",
      youtube: "Marcus Gaming Pro",
    },
    demographics: {
      ageRange: "16-28",
      topLocations: ["USA", "UK", "Germany", "Brazil"],
      interests: ["Gaming", "Technology", "Esports", "Streaming"],
    },
    brandAlignment: {
      categories: ["Gaming", "Technology", "Energy Drinks", "Apparel"],
      values: ["Competition", "Innovation", "Community", "Excellence"],
      pastBrands: ["Razer", "Red Bull", "HyperX", "Discord"],
    },
    goals: {
      targetDeals: 10,
      preferredCategories: ["Gaming", "Technology", "Energy"],
      minDealValue: 20000,
    },
    documents: [],
    status: "active",
    lastUpdated: "2024-01-13",
  },
]

export function TalentProfileManager({ selectedTalent, onTalentChange }: TalentProfileManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTalentForm, setNewTalentForm] = useState({
    name: "",
    category: "",
    bio: "",
    location: "",
    instagram: "",
    twitter: "",
    youtube: "",
    website: "",
  })
  const [files, setFiles] = useState<UploadedFile[]>([])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num}`
  }

  const handleTalentSelect = (talentId: string) => {
    const talent = mockTalents.find((t) => t.id === talentId)
    if (talent) {
      onTalentChange(talent)
      setFiles(talent.documents)
    }
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    // Simulate creating new talent profile
    setTimeout(() => {
      const newTalent: TalentProfile = {
        id: `talent-${Date.now()}`,
        name: newTalentForm.name || "New Talent",
        category: newTalentForm.category || "Uncategorized",
        bio: newTalentForm.bio,
        location: newTalentForm.location,
        stats: { followers: 0, engagement: 0, deals: 0, avgDealValue: 0 },
        socialMedia: {
          instagram: newTalentForm.instagram,
          twitter: newTalentForm.twitter,
          youtube: newTalentForm.youtube,
          website: newTalentForm.website,
        },
        demographics: {
          ageRange: "18-35",
          topLocations: [],
          interests: [],
        },
        brandAlignment: {
          categories: [],
          values: [],
          pastBrands: [],
        },
        goals: {
          targetDeals: 5,
          preferredCategories: [],
          minDealValue: 1000,
        },
        documents: files,
        status: "active",
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      onTalentChange(newTalent)
      setIsCreating(false)
      setShowCreateDialog(false)
      setNewTalentForm({
        name: "",
        category: "",
        bio: "",
        location: "",
        instagram: "",
        twitter: "",
        youtube: "",
        website: "",
      })
    }, 1000)
  }

  const handleProcessFiles = () => {
    console.log("[v0] Processing files for talent profile extraction...")
    // Simulate AI processing of uploaded documents
    const processedFiles = files.map((file) => ({
      ...file,
      status: "processing" as const,
    }))
    setFiles(processedFiles)

    // Simulate processing completion
    setTimeout(() => {
      const completedFiles = processedFiles.map((file) => ({
        ...file,
        status: "completed" as const,
      }))
      setFiles(completedFiles)

      if (selectedTalent) {
        // Update talent profile with extracted data
        const updatedTalent = {
          ...selectedTalent,
          documents: completedFiles,
          lastUpdated: new Date().toISOString().split("T")[0],
        }
        onTalentChange(updatedTalent)
      }
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Talent Profile</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              New Talent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Talent Profile</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newTalentForm.name}
                      onChange={(e) => setNewTalentForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTalentForm.category}
                      onValueChange={(value) => setNewTalentForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional Athlete">Professional Athlete</SelectItem>
                        <SelectItem value="Lifestyle Influencer">Lifestyle Influencer</SelectItem>
                        <SelectItem value="Gaming Creator">Gaming Creator</SelectItem>
                        <SelectItem value="Fashion Influencer">Fashion Influencer</SelectItem>
                        <SelectItem value="Tech Reviewer">Tech Reviewer</SelectItem>
                        <SelectItem value="Fitness Influencer">Fitness Influencer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newTalentForm.location}
                    onChange={(e) => setNewTalentForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State/Country"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={newTalentForm.bio}
                    onChange={(e) => setNewTalentForm((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief description of the talent..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram">Instagram Handle</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <Input
                        id="instagram"
                        value={newTalentForm.instagram}
                        onChange={(e) => setNewTalentForm((prev) => ({ ...prev, instagram: e.target.value }))}
                        placeholder="@username"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <Input
                        id="twitter"
                        value={newTalentForm.twitter}
                        onChange={(e) => setNewTalentForm((prev) => ({ ...prev, twitter: e.target.value }))}
                        placeholder="@username"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="youtube">YouTube Channel</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                        <Youtube className="w-4 h-4" />
                      </div>
                      <Input
                        id="youtube"
                        value={newTalentForm.youtube}
                        onChange={(e) => setNewTalentForm((prev) => ({ ...prev, youtube: e.target.value }))}
                        placeholder="Channel name"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                        <Globe className="w-4 h-4" />
                      </div>
                      <Input
                        id="website"
                        value={newTalentForm.website}
                        onChange={(e) => setNewTalentForm((prev) => ({ ...prev, website: e.target.value }))}
                        placeholder="website.com"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div>
                  <Label>Upload Documents</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload media kits, performance reports, brand guidelines, or any relevant documents
                  </p>
                  <FileUploadZone
                    files={files}
                    onFilesChange={setFiles}
                    onProcessFiles={handleProcessFiles}
                    talentId="new-talent"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNew} disabled={isCreating || !newTalentForm.name}>
                {isCreating ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Talent Selector */}
      <Select value={selectedTalent?.id} onValueChange={handleTalentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a talent profile" />
        </SelectTrigger>
        <SelectContent>
          {mockTalents.map((talent) => (
            <SelectItem key={talent.id} value={talent.id}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {talent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{talent.name}</div>
                  <div className="text-xs text-muted-foreground">{talent.category}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Talent Profile */}
      {selectedTalent && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {selectedTalent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-xl font-semibold">{selectedTalent.name}</h4>
                    <p className="text-muted-foreground">{selectedTalent.category}</p>
                    {selectedTalent.location && (
                      <p className="text-sm text-muted-foreground">{selectedTalent.location}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                </div>

                {selectedTalent.bio && <p className="text-sm text-muted-foreground mb-4">{selectedTalent.bio}</p>}

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-semibold">{formatNumber(selectedTalent.stats.followers)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{selectedTalent.stats.engagement}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="font-semibold">{selectedTalent.stats.deals}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{formatCurrency(selectedTalent.stats.avgDealValue)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Deal</p>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="flex gap-2 mb-4">
                  {selectedTalent.socialMedia.instagram && (
                    <Badge variant="outline" className="gap-1">
                      <Instagram className="w-3 h-3" />
                      {selectedTalent.socialMedia.instagram}
                    </Badge>
                  )}
                  {selectedTalent.socialMedia.twitter && (
                    <Badge variant="outline" className="gap-1">
                      <Twitter className="w-3 h-3" />
                      {selectedTalent.socialMedia.twitter}
                    </Badge>
                  )}
                  {selectedTalent.socialMedia.youtube && (
                    <Badge variant="outline" className="gap-1">
                      <Youtube className="w-3 h-3" />
                      {selectedTalent.socialMedia.youtube}
                    </Badge>
                  )}
                </div>

                {/* Brand Alignment */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Brand Categories</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedTalent.brandAlignment.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Document Upload Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Documents & Media Kit</h5>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated {selectedTalent.lastUpdated}
                </Badge>
              </div>
              <FileUploadZone
                files={files}
                onFilesChange={setFiles}
                onProcessFiles={handleProcessFiles}
                talentId={selectedTalent.id}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
