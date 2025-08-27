import { useState } from 'react';
import { Plus, Search, MoreHorizontal, MapPin, Users, Building } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useMunicipalities, useDeleteMunicipality } from '../hooks/useMunicipalities';
import MunicipalityForm from '../components/MunicipalityForm';

const Municipalities = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // Fetch municipalities with pagination and search
  const {
    data: municipalitiesData,
    isLoading,
    error,
    refetch
  } = useMunicipalities({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });

  const deleteMutation = useDeleteMunicipality();

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle create municipality
  const handleCreate = () => {
    setSelectedMunicipality(null);
    setIsFormOpen(true);
  };

  // Handle edit municipality
  const handleEdit = (municipality) => {
    setSelectedMunicipality(municipality);
    setIsFormOpen(true);
  };

  // Handle delete municipality
  const handleDelete = async (municipalityId) => {
    if (window.confirm('Are you sure you want to delete this municipality?')) {
      try {
        await deleteMutation.mutateAsync(municipalityId);
      } catch (error) {
        console.error('Error deleting municipality:', error);
        alert('Failed to delete municipality. Please try again.');
      }
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMunicipality(null);
  };

  // Calculate statistics
  const municipalities = municipalitiesData?.data?.municipalities || [];
  const pagination = municipalitiesData?.data?.pagination || {};
  
  const totalMunicipalities = pagination.totalItems || 0;
  const activeMunicipalities = municipalities.filter(m => m.isActive).length;
  const totalPopulation = municipalities.reduce((sum, m) => 
    sum + (m.populationData?.totalPopulation || 0), 0
  );

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading municipalities</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Municipalities</h1>
            <p className="text-muted-foreground">
              Manage municipality information and records
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Municipality
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Municipalities</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMunicipalities}</div>
              <p className="text-xs text-muted-foreground">
                {activeMunicipalities} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Population</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPopulation.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all municipalities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Population</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeMunicipalities > 0 
                  ? Math.round(totalPopulation / activeMunicipalities).toLocaleString()
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Per municipality
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Municipality List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search municipalities..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Data Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading municipalities...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No municipalities found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      municipalities.map((municipality) => (
                        <TableRow key={municipality._id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{municipality.name}</div>
                              <div className="text-sm text-gray-500">
                                {municipality.country}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{municipality.state}</TableCell>
                          <TableCell>
                            {municipality.populationData?.totalPopulation 
                              ? municipality.populationData.totalPopulation.toLocaleString()
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {municipality.contactInfo?.email && (
                                <div className="text-sm">{municipality.contactInfo.email}</div>
                              )}
                              {municipality.contactInfo?.phone && (
                                <div className="text-sm text-gray-500">
                                  {municipality.contactInfo.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              municipality.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {municipality.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(municipality)}>
                                  Edit municipality
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(municipality._id)}
                                  className="text-red-600"
                                >
                                  Delete municipality
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} municipalities
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Municipality Form Dialog */}
      <MunicipalityForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        municipality={selectedMunicipality}
      />
    </AdminLayout>
  );
};

export default Municipalities;
