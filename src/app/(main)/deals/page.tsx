"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Search, 
  Plus, 
  DollarSign, 
  Calendar,
  User,
  Building,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  ArrowRight
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expectedCloseDate: string;
  contactName: string;
  company: string;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  notes?: string;
}

const DEAL_STAGES = [
  { key: 'new', label: 'New', color: 'bg-gray-100 text-gray-800' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { key: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { key: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
];

export default function DealsPage() {
  const { data: session, status } = useSession();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    contactName: "",
    company: "",
    expectedCloseDate: "",
    notes: ""
  });

  // Mock data for demo purposes
  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setDeals([
          {
            id: "1",
            title: "Website Redesign Project",
            value: 15000,
            stage: "proposal",
            probability: 75,
            expectedCloseDate: "2024-02-15",
            contactName: "John Smith",
            company: "ABC Corporation",
            assignedTo: "You",
            createdAt: "2024-01-01",
            lastActivity: "2024-01-10",
            notes: "Client interested in modern design with e-commerce functionality"
          },
          {
            id: "2",
            title: "Enterprise Software License",
            value: 50000,
            stage: "negotiation",
            probability: 85,
            expectedCloseDate: "2024-01-30",
            contactName: "Sarah Johnson",
            company: "TechStart Inc",
            assignedTo: "You",
            createdAt: "2024-01-05",
            lastActivity: "2024-01-12",
            notes: "Negotiating volume discount for 100+ licenses"
          },
          {
            id: "3",
            title: "Marketing Campaign",
            value: 8000,
            stage: "qualified",
            probability: 60,
            expectedCloseDate: "2024-02-28",
            contactName: "Mike Davis",
            company: "Enterprise Solutions",
            assignedTo: "You",
            createdAt: "2023-12-20",
            lastActivity: "2024-01-08",
            notes: "Looking for comprehensive digital marketing solution"
          },
          {
            id: "4",
            title: "Cloud Migration Services",
            value: 25000,
            stage: "contacted",
            probability: 30,
            expectedCloseDate: "2024-03-15",
            contactName: "Emily Chen",
            company: "Innovate Co",
            assignedTo: "You",
            createdAt: "2024-01-08",
            lastActivity: "2024-01-09",
            notes: "Initial discussion about AWS migration requirements"
          },
          {
            id: "5",
            title: "Mobile App Development",
            value: 35000,
            stage: "won",
            probability: 100,
            expectedCloseDate: "2024-01-15",
            contactName: "Alex Rodriguez",
            company: "StartupXYZ",
            assignedTo: "You",
            createdAt: "2023-11-15",
            lastActivity: "2024-01-15",
            notes: "iOS and Android app for food delivery service"
          }
        ]);
        setLoading(false);
      }, 1000);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === "all" || deal.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const deal: Deal = {
      id: Date.now().toString(),
      title: newDeal.title,
      value: parseFloat(newDeal.value) || 0,
      stage: 'new',
      probability: 20,
      expectedCloseDate: newDeal.expectedCloseDate,
      contactName: newDeal.contactName,
      company: newDeal.company,
      assignedTo: "You",
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      notes: newDeal.notes
    };
    setDeals([deal, ...deals]);
    setNewDeal({ title: "", value: "", contactName: "", company: "", expectedCloseDate: "", notes: "" });
    setShowAddForm(false);
  };

  const getStageColor = (stage: string) => {
    const stageConfig = DEAL_STAGES.find(s => s.key === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getTotalValue = (stage?: string) => {
    const relevantDeals = stage ? deals.filter(d => d.stage === stage) : deals;
    return relevantDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading deals...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access deals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-2">Manage your sales pipeline and track deal progress</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'pipeline' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pipeline View
            </button>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold">${getTotalValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weighted Pipeline</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${getWeightedValue().toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold">
                  {deals.filter(d => !['won', 'lost'].includes(d.stage)).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  ${getTotalValue('won').toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {DEAL_STAGES.map(stage => (
                <option key={stage.key} value={stage.key}>{stage.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add Deal Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Deal Title *"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  placeholder="Deal Value *"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({...newDeal, value: e.target.value})}
                  required
                />
                <Input
                  placeholder="Contact Name *"
                  value={newDeal.contactName}
                  onChange={(e) => setNewDeal({...newDeal, contactName: e.target.value})}
                  required
                />
                <Input
                  placeholder="Company"
                  value={newDeal.company}
                  onChange={(e) => setNewDeal({...newDeal, company: e.target.value})}
                />
                <Input
                  type="date"
                  placeholder="Expected Close Date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal({...newDeal, expectedCloseDate: e.target.value})}
                />
                <Input
                  placeholder="Notes"
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({...newDeal, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Deal</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {DEAL_STAGES.slice(0, -2).map((stage) => {
            const stageDeals = filteredDeals.filter(deal => deal.stage === stage.key);
            return (
              <Card key={stage.key} className="min-h-96">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                  <div className="text-xs text-gray-500">
                    {stageDeals.length} deals • ${stageDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{deal.title}</h4>
                      <p className="text-lg font-bold text-green-600 mb-2">${deal.value.toLocaleString()}</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{deal.contactName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{deal.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium">{deal.probability}%</span>
                        <div className="w-12 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No deals in this stage
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Deal List ({filteredDeals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <div key={deal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{deal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                          {DEAL_STAGES.find(s => s.key === deal.stage)?.label}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ${deal.value.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{deal.contactName} at {deal.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Probability: {deal.probability}%</span>
                        </div>
                      </div>
                      
                      {deal.notes && (
                        <p className="text-sm text-gray-600 mb-2">{deal.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Created: {new Date(deal.createdAt).toLocaleDateString()} • 
                        Last Activity: {new Date(deal.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDeals.length === 0 && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No deals found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
