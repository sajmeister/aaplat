'use client';

import React, { useState, useMemo } from 'react';
import { usePublicAgents } from '@/hooks/use-agents';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Code, 
  Clock,
  Grid3x3,
  List,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

import type { Agent } from '@/lib/db/schema';
import type { CreateAgentInput } from '@/lib/validations/agent';

interface AgentCardProps {
  agent: Agent;
  viewMode: 'grid' | 'list';
}

function AgentCard({ agent, viewMode }: AgentCardProps) {
  const isGridView = viewMode === 'grid';

  const runtimeColors = {
    python: 'bg-blue-100 text-blue-800',
    nodejs: 'bg-green-100 text-green-800',
    rust: 'bg-orange-100 text-orange-800',
  };

  const categoryColors = {
    automation: 'bg-purple-100 text-purple-800',
    'data-processing': 'bg-indigo-100 text-indigo-800',
    'ai-ml': 'bg-pink-100 text-pink-800',
    'web-scraping': 'bg-yellow-100 text-yellow-800',
    'api-integration': 'bg-cyan-100 text-cyan-800',
    monitoring: 'bg-red-100 text-red-800',
    utilities: 'bg-gray-100 text-gray-800',
    other: 'bg-slate-100 text-slate-800',
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  if (isGridView) {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <Link href={`/marketplace/agent/${agent.id}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  v{agent.version}
                </p>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Star className="h-4 w-4" />
                <span>{agent.rating || '0.0'}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-3">
              {agent.description || 'No description available.'}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className={runtimeColors[agent.runtime as keyof typeof runtimeColors] || 'bg-gray-100 text-gray-800'}>
                <Code className="h-3 w-3 mr-1" />
                {agent.runtime}
              </Badge>
              <Badge className={categoryColors[agent.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}>
                {agent.category.replace('-', ' ')}
              </Badge>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Download className="h-3 w-3" />
                <span>{agent.downloads || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(agent.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // List view
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/marketplace/agent/${agent.id}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {agent.description || 'No description available.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-3">
              <Badge className={runtimeColors[agent.runtime as keyof typeof runtimeColors] || 'bg-gray-100 text-gray-800'}>
                <Code className="h-3 w-3 mr-1" />
                {agent.runtime}
              </Badge>
              <Badge className={categoryColors[agent.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}>
                {agent.category.replace('-', ' ')}
              </Badge>
              <span className="text-xs text-gray-500">v{agent.version}</span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Star className="h-4 w-4" />
              <span>{agent.rating || '0.0'}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Download className="h-3 w-3" />
              <span>{agent.downloads || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRuntime, setSelectedRuntime] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Fetch agents based on current filters
  const { data: agentsData, isLoading, error } = usePublicAgents({
    search: searchQuery,
    category: (selectedCategory as CreateAgentInput['category']) || undefined,
    runtime: (selectedRuntime as CreateAgentInput['runtime']) || undefined,
    page,
  });

  const agents = agentsData?.data || [];
  const pagination = agentsData?.pagination;

  // Filter and sort options
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'automation', label: 'Automation' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'web-scraping', label: 'Web Scraping' },
    { value: 'api-integration', label: 'API Integration' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' },
  ];

  const runtimes = [
    { value: '', label: 'All Runtimes' },
    { value: 'python', label: 'Python' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'rust', label: 'Rust' },
  ];

  const sortedAgents = useMemo(() => {
    if (!agents) return [];
    
    const sorted = [...agents];
    
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
    }
  }, [agents, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRuntime('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedRuntime;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Marketplace</h1>
        <p className="text-gray-600 mt-2">
          Discover and deploy AI agents for your automation needs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Runtime Filter */}
          <select
            value={selectedRuntime}
            onChange={(e) => {
              setSelectedRuntime(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {runtimes.map((runtime) => (
              <option key={runtime.value} value={runtime.value}>
                {runtime.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'rating')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="ml-auto flex items-center space-x-1 border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="border-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading agents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load agents. Please try again.</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {pagination?.total || 0} agents found
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {/* Agent Grid/List */}
          {sortedAgents.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {sortedAgents.map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No agents found.</p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-2" onClick={clearFilters}>
                  Clear filters to see all agents
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 