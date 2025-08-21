import { useState } from 'react';
import { Plus, Search, MoreHorizontal, MapPin, Users, Building } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useMunicipalities, useDeleteMunicipality } from '@/hooks/useMunicipalities';
import type { Municipality } from '@/lib/api';
import MunicipalityForm from '@/components/MunicipalityForm'; // Assuming you have a form component for adding/editing municipalities

export default function MunicipalitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: municipalitiesData, isLoading } = useMunicipalities({
    page,
    limit: 10,
    search: searchTerm,
  });

  const deleteMunicipalityMutation = useDeleteMunicipality();

  const handleAddMunicipality = () => {
    setSelectedMunicipality(null);
    setShowForm(true);
  };

  const handleEditMunicipality = (municipality: Municipality) => {
    setSelectedMunicipality(municipality);
    setShowForm(true);
  };

  const handleDeleteMunicipality = async (municipalityId: string) => {
    if (window.confirm('Are you sure you want to delete this municipality?')) {
      try {
        await deleteMunicipalityMutation.mutateAsync(municipalityId);
        // Success handled by react-query
      } catch (error) {
        console.error('Failed to delete municipality:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPopulation = (population?: number) => {
    if (!population) return 'N/A';
    return population.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-black">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Municipality Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage Municipal Organizations
            </p>
          </div>
          <Button onClick={handleAddMunicipality} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Municipality
          </Button>
        </div>

        {/* Stats Cards */}
        {municipalitiesData?.data.length > 0 && <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Municipalities</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{municipalitiesData?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Municipalities</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {municipalitiesData?.data?.filter(municipality => municipality.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Population</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPopulation(
                  municipalitiesData?.data?.reduce((sum, municipality) => 
                    sum + (municipality.populationData.totalPopulation || 0), 0
                  ) || 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search municipalities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Municipalities Table */}
        <Card>
          <CardContent>
            {municipalitiesData?.data.length > 0 ?<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : municipalitiesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No municipalities found
                    </TableCell>
                  </TableRow>
                ) : (
                  municipalitiesData?.data?.map((municipality) => (
                    <TableRow key={municipality._id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{municipality.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{municipality.state}, {municipality.country}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Total: {formatPopulation(municipality.populationData.totalPopulation)}</div>
                          {municipality.populationData.lastCensusYear && (
                            <div className="text-slate-500">
                              Census: {municipality.populationData.lastCensusYear}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {municipality.contactInfo.email && (
                            <div>{municipality.contactInfo.email}</div>
                          )}
                          {municipality.contactInfo.phone && (
                            <div>{municipality.contactInfo.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={municipality.isActive ? 'default' : 'secondary'}>
                          {municipality.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(municipality.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMunicipality(municipality)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMunicipality(municipality._id)}
                              className="text-red-600"
                              disabled={deleteMunicipalityMutation.isPending}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>:<div className='text-center'>Municipalities not found</div>}
          </CardContent>
        </Card>

        {/* Pagination */}
        {municipalitiesData?.totalPages && municipalitiesData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {page} of {municipalitiesData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === municipalitiesData.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <MunicipalityForm isOpen={showForm} onClose={() => setIsFormOpen(false)}  />
    </AdminLayout>
  );
}
