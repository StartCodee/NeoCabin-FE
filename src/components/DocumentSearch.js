import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  MapPin,
  User,
  FileText,
  X
} from 'lucide-react';
import { mockDocuments, mockLocations, mockDepartments, mockAccessRights } from '../data/mockData';

const DocumentSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    location: '',
    ownership: '',
    accessRights: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ownership.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.year) {
      filtered = filtered.filter(doc => doc.year.toString() === filters.year);
    }
    if (filters.location) {
      filtered = filtered.filter(doc => doc.physicalLocation === filters.location);
    }
    if (filters.ownership) {
      filtered = filtered.filter(doc => doc.ownership === filters.ownership);
    }
    if (filters.accessRights) {
      filtered = filtered.filter(doc => doc.accessRights.includes(filters.accessRights));
    }
    if (filters.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    return filtered;
  }, [searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      location: '',
      ownership: '',
      accessRights: '',
      status: ''
    });
    setSearchQuery('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Borrowed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Search</h1>
        <p className="text-gray-600">Find and access documents in the archive system</p>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Documents</CardTitle>
              <CardDescription>Use filters to narrow down your search</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-[#5d87ff] text-white ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, ownership, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any year</SelectItem>
                    {[...new Set(mockDocuments.map(doc => doc.year))].sort().reverse().map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    {mockLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ownership</Label>
                <Select value={filters.ownership} onValueChange={(value) => handleFilterChange('ownership', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any department</SelectItem>
                    {mockDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Access Rights</Label>
                <Select value={filters.accessRights} onValueChange={(value) => handleFilterChange('accessRights', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any access</SelectItem>
                    {mockAccessRights.map(right => (
                      <SelectItem key={right} value={right}>{right}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Borrowed">Borrowed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Year: {doc.year}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{doc.physicalLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{doc.ownership}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {doc.accessRights.slice(0, 3).map(right => (
                            <Badge key={right} variant="outline" className="text-xs">
                              {right}
                            </Badge>
                          ))}
                          {doc.accessRights.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.accessRights.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {doc.borrowedBy && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span>Borrowed by: <strong>{doc.borrowedBy}</strong></span>
                          {doc.returnDate && (
                            <span className="ml-4">Due: {doc.returnDate}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="bg-[#5d87ff] hover:bg-[#4c75e8] ml-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentSearch;