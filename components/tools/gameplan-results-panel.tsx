"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  TrendingUp,
  Building,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  Handshake,
  Shield,
  Zap,
} from "lucide-react"
import { useState } from "react"
import type { TalentProfile } from "../talent-selector"

interface GameplanResultsPanelProps {
  selectedTalent?: TalentProfile
  onTalentChange: (talent: TalentProfile) => void
  files: any[]
  onFilesChange: (files: any[]) => void
}

const mockMarketplaceListings = [
  {
    id: "listing-1",
    brandCode: "BRAND-7X9K",
    isAnonymous: true,
    industry: "Sports Nutrition",
    marketCap: "$20B+",
    packageType: "Multi-Platform Sponsorship",
    budget: "$1.5M - $3M",
    duration: "2-3 years",
    targetDemographics: "18-35, Athletes, Fitness Enthusiasts",
    requirements: ["Social media presence 500K+", "Performance metrics", "Clean background check"],
    postedDate: "2025-01-14",
    applications: 23,
    status: "active",
  },
  {
    id: "listing-2",
    brandCode: "BRAND-4M2P",
    isAnonymous: true,
    industry: "Athletic Apparel",
    marketCap: "$5B - $15B",
    packageType: "Product Endorsement",
    budget: "$500K - $1.2M",
    duration: "1-2 years",
    targetDemographics: "16-28, Emerging Athletes, Social Influencers",
    requirements: ["Rising star potential", "Authentic brand alignment", "Content creation skills"],
    postedDate: "2025-01-13",
    applications: 41,
    status: "active",
  },
  {
    id: "listing-3",
    brandCode: "BRAND-9L5T",
    isAnonymous: false,
    brandName: "Red Bull",
    industry: "Energy Drinks",
    marketCap: "$15B+",
    packageType: "Event Partnership",
    budget: "$2M - $5M",
    duration: "3-5 years",
    targetDemographics: "18-40, Extreme Sports, Adventure Seekers",
    requirements: ["Extreme sports background", "Global appeal", "Risk tolerance"],
    postedDate: "2025-01-12",
    applications: 67,
    status: "featured",
  },
]

const mockVenueInventory = [
  {
    id: "venue-1",
    name: "MetLife Stadium",
    location: "East Rutherford, NJ",
    capacity: 82500,
    type: "NFL Stadium",
    availablePackages: [
      { type: "Naming Rights", price: "$2.5M/year", availability: "2026-2031", roi: 3.2 },
      { type: "Premium Sponsorship", price: "$1.8M/year", availability: "2025-2028", roi: 2.9 },
      { type: "Digital Integration", price: "$900K/year", availability: "2025-2027", roi: 4.1 },
    ],
    demographics: "18-54, Sports Fans, High Income",
    seasonalEvents: 25,
    mediaValue: "$45M annually",
    partnershipHistory: "Nike, Pepsi, Verizon",
  },
  {
    id: "venue-2",
    name: "Madison Square Garden",
    location: "New York, NY",
    capacity: 20789,
    type: "Multi-Purpose Arena",
    availablePackages: [
      { type: "Arena Naming", price: "$3.2M/year", availability: "2027-2032", roi: 3.8 },
      { type: "Court Sponsorship", price: "$1.5M/year", availability: "2025-2030", roi: 3.1 },
      { type: "Concourse Branding", price: "$650K/year", availability: "2025-2028", roi: 2.7 },
    ],
    demographics: "25-45, Urban Professional, Entertainment Seekers",
    seasonalEvents: 180,
    mediaValue: "$78M annually",
    partnershipHistory: "Chase, Delta, Coca-Cola",
  },
]

const mockROIScenarios = [
  {
    id: "scenario-1",
    name: "Conservative Growth",
    investment: "$1.5M",
    projectedReturn: "$4.8M",
    roi: 3.2,
    timeline: "24 months",
    probability: 0.85,
    keyFactors: ["Market stability", "Brand alignment", "Audience engagement"],
    risks: ["Economic downturn", "Performance decline"],
  },
  {
    id: "scenario-2",
    name: "Aggressive Expansion",
    investment: "$1.5M",
    projectedReturn: "$7.2M",
    roi: 4.8,
    timeline: "18 months",
    probability: 0.62,
    keyFactors: ["Viral marketing", "Championship performance", "Media coverage"],
    risks: ["Market saturation", "Competitor response", "Injury/scandal"],
  },
  {
    id: "scenario-3",
    name: "Steady Partnership",
    investment: "$1.5M",
    projectedReturn: "$3.9M",
    roi: 2.6,
    timeline: "36 months",
    probability: 0.92,
    keyFactors: ["Long-term stability", "Consistent performance", "Brand loyalty"],
    risks: ["Market shifts", "Contract disputes"],
  },
]

const mockPackages = [
  {
    id: "pkg-1",
    venue: "MetLife Stadium",
    packageType: "Naming Rights",
    duration: "5 years",
    estimatedROI: 3.2,
    audienceReach: "2.1M",
    demographics: "18-54, Sports Fans",
    price: "$2.5M/year",
    confidence: 0.94,
  },
  {
    id: "pkg-2",
    venue: "Madison Square Garden",
    packageType: "Premium Sponsorship",
    duration: "3 years",
    estimatedROI: 2.8,
    audienceReach: "1.8M",
    demographics: "25-45, Urban Professional",
    price: "$1.2M/year",
    confidence: 0.87,
  },
  {
    id: "pkg-3",
    venue: "Yankee Stadium",
    packageType: "Digital Integration",
    duration: "2 years",
    estimatedROI: 4.1,
    audienceReach: "3.2M",
    demographics: "21-65, Baseball Fans",
    price: "$800K/year",
    confidence: 0.91,
  },
]

const mockCampaignGoals = [
  "Brand Awareness",
  "Lead Generation",
  "Market Penetration",
  "Product Launch",
  "Customer Retention",
]

export function GameplanResultsPanel({
  selectedTalent,
  onTalentChange,
  files,
  onFilesChange,
}: GameplanResultsPanelProps) {
  const [campaignBudget, setCampaignBudget] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [targetDemographic, setTargetDemographic] = useState("")
  const [activeTab, setActiveTab] = useState<"packages" | "marketplace" | "venues" | "roi">("marketplace")
  const [selectedROIScenario, setSelectedROIScenario] = useState("scenario-1")

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  const getROIColor = (roi: number) => {
    if (roi >= 3.5) return "text-green-500"
    if (roi >= 2.5) return "text-yellow-500"
    return "text-red-500"
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return "text-green-500"
    if (probability >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* File Context Indicator */}
      {files.length > 0 && (
        <div className="p-3 bg-secondary/50 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            Using context from {files.filter((f) => f.status === "completed").length} uploaded files for partnership
            matching
          </p>
        </div>
      )}

      {/* Campaign Goals Input */}
      <div>
        <h4 className="text-sm font-medium mb-3">Partnership Configuration</h4>
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign Budget</label>
              <Input
                placeholder="e.g., $500K - $2M annually"
                value={campaignBudget}
                onChange={(e) => setCampaignBudget(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Demographics</label>
              <Input
                placeholder="e.g., 18-34, Sports Enthusiasts, Urban"
                value={targetDemographic}
                onChange={(e) => setTargetDemographic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Partnership Goals</label>
              <div className="flex flex-wrap gap-2">
                {mockCampaignGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(goal)}
                    className="text-xs"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full">
              <Target className="w-4 h-4 mr-2" />
              Find Matching Opportunities
            </Button>
          </div>
        </Card>
      </div>

      {/* Enhanced Tab Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">B2B Marketplace</h4>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "marketplace" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("marketplace")}
            >
              Marketplace
            </Button>
            <Button
              variant={activeTab === "packages" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("packages")}
            >
              Packages
            </Button>
            <Button
              variant={activeTab === "venues" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("venues")}
            >
              Venues
            </Button>
            <Button variant={activeTab === "roi" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("roi")}>
              ROI Models
            </Button>
          </div>
        </div>

        {activeTab === "marketplace" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Anonymous brand listings for secure partnership discovery</p>
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                Verified Brands
              </Badge>
            </div>

            {mockMarketplaceListings.map((listing) => (
              <Card key={listing.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {listing.isAnonymous ? (
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{listing.brandCode}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{listing.brandName}</span>
                        </div>
                      )}
                      <Badge variant={listing.status === "featured" ? "default" : "secondary"} className="text-xs">
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{listing.budget}</p>
                      <p className="text-xs text-muted-foreground">{listing.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{listing.industry}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Market Cap:</span>
                      <span>{listing.marketCap}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Package Type:</span>
                      <span>{listing.packageType}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {listing.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Posted: {new Date(listing.postedDate).toLocaleDateString()}</span>
                    <span>{listing.applications} applications</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
                      <Handshake className="w-3 h-3" />
                      Apply Anonymously
                    </Button>
                    <Button size="sm" className="flex-1 gap-2">
                      <Zap className="w-3 h-3" />
                      Request Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "packages" && (
          <div className="space-y-3">
            <Badge variant="outline">{mockPackages.length} matches found</Badge>
            {mockPackages.map((pkg) => (
              <Card key={pkg.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{pkg.venue}</span>
                      <Badge variant="secondary" className="text-xs">
                        {pkg.packageType}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{pkg.price}</p>
                      <p className="text-xs text-muted-foreground">{pkg.duration}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${getROIColor(pkg.estimatedROI)}`} />
                      <span>ROI: {pkg.estimatedROI}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Reach: {pkg.audienceReach}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>Demographics: {pkg.demographics}</p>
                    <p>Confidence: {Math.round(pkg.confidence * 100)}%</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Generate Proposal
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "venues" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Comprehensive venue inventory with partnership opportunities
            </p>

            {mockVenueInventory.map((venue) => (
              <Card key={venue.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <h5 className="text-sm font-medium">{venue.name}</h5>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {venue.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{venue.capacity.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">capacity</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-1">{venue.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Events/Year:</span>
                      <span className="ml-1">{venue.seasonalEvents}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Media Value:</span>
                      <span className="ml-1">{venue.mediaValue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Packages:</span>
                      <span className="ml-1">{venue.availablePackages.length} available</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Available Packages:</p>
                    <div className="space-y-1">
                      {venue.availablePackages.map((pkg, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs p-2 bg-secondary/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pkg.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {pkg.roi}x ROI
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{pkg.price}</p>
                            <p className="text-muted-foreground">{pkg.availability}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                    <Calendar className="w-3 h-3" />
                    Schedule Venue Tour
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "roi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Advanced ROI scenarios with probability modeling</p>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <BarChart3 className="w-3 h-3" />
                Export Model
              </Button>
            </div>

            <div className="grid gap-2">
              {mockROIScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedROIScenario === scenario.id ? "ring-2 ring-primary" : "hover:bg-secondary/50"
                  }`}
                  onClick={() => setSelectedROIScenario(scenario.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{scenario.name}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getROIColor(scenario.roi)}`}>
                          {scenario.roi}x ROI
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getProbabilityColor(scenario.probability)}`}>
                          {Math.round(scenario.probability * 100)}% likely
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Investment:</span>
                        <p className="font-medium">{scenario.investment}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Return:</span>
                        <p className="font-medium">{scenario.projectedReturn}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeline:</span>
                        <p className="font-medium">{scenario.timeline}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Success Factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {scenario.keyFactors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Progress value={scenario.probability * 100} className="h-1" />
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <h5 className="text-sm font-medium">Selected Scenario Analysis</h5>
                </div>
                {(() => {
                  const selected = mockROIScenarios.find((s) => s.id === selectedROIScenario)
                  return selected ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expected Return</span>
                        <span className="text-lg font-semibold text-green-500">{selected.projectedReturn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Break-even Timeline</span>
                        <span className="text-sm text-muted-foreground">{selected.timeline}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Success Probability</span>
                        <span className={`text-sm ${getProbabilityColor(selected.probability)}`}>
                          {Math.round(selected.probability * 100)}%
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.risks.map((risk, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
