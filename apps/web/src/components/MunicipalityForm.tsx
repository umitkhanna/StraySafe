import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCreateMunicipality, useUpdateMunicipality } from '../hooks/useMunicipalities';
import type { Municipality } from '../lib/types';

interface MunicipalityFormData {
  name: string;
  state: string;
  country: string;
  populationData: {
    totalPopulation?: number;
    lastCensusYear?: number;
    urbanPopulation?: number;
    ruralPopulation?: number;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
}

interface MunicipalityFormProps {
  isOpen: boolean;
  onClose: () => void;
  municipality?: Municipality | null;
}

export default function MunicipalityForm({ isOpen, onClose, municipality }: MunicipalityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateMunicipality();
  const updateMutation = useUpdateMunicipality();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MunicipalityFormData>({
    defaultValues: {
      name: '',
      state: '',
      country: 'India',
      populationData: {
        totalPopulation: undefined,
        urbanPopulation: undefined,
        ruralPopulation: undefined,
        lastCensusYear: undefined,
      },
      contactInfo: {
        email: '',
        phone: '',
        website: '',
        address: '',
      },
    },
  });

  useEffect(() => {
    if (municipality) {
      // Pre-fill form with municipality data
      setValue('name', municipality.name);
      setValue('state', municipality.state);
      setValue('country', municipality.country);
      setValue('populationData.totalPopulation', municipality.populationData?.totalPopulation);
      setValue('populationData.urbanPopulation', municipality.populationData?.urbanPopulation);
      setValue('populationData.ruralPopulation', municipality.populationData?.ruralPopulation);
      setValue('populationData.lastCensusYear', municipality.populationData?.lastCensusYear);
      setValue('contactInfo.email', municipality.contactInfo?.email || '');
      setValue('contactInfo.phone', municipality.contactInfo?.phone || '');
      setValue('contactInfo.website', municipality.contactInfo?.website || '');
      setValue('contactInfo.address', municipality.contactInfo?.address || '');
    } else {
      reset();
    }
  }, [municipality, setValue, reset]);

  const onSubmit = async (data: MunicipalityFormData) => {
    setIsSubmitting(true);
    try {
    const municipalityData = {
      name: data.name,
      state: data.state,
      country: data.country,
      populationData: data.populationData ? {
        totalPopulation: data.populationData.totalPopulation || undefined,
        lastCensusYear: data.populationData.lastCensusYear || undefined,
        urbanPopulation: data.populationData.urbanPopulation || undefined,
        ruralPopulation: data.populationData.ruralPopulation || undefined,
      } : undefined,
      contactInfo: data.contactInfo ? {
        email: data.contactInfo.email || undefined,
        phone: data.contactInfo.phone || undefined,
        website: data.contactInfo.website || undefined,
        address: data.contactInfo.address || undefined,
      } : undefined,
      adminUser: 'current-user-id' // This should come from auth context
    };      if (municipality) {
        await updateMutation.mutateAsync({
          municipalityId: municipality._id,
          municipalityData: municipalityData,
        });
      } else {
        await createMutation.mutateAsync(municipalityData);
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('Failed to save municipality:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {municipality ? 'Edit Municipality' : 'Add New Municipality'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Municipality Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...register('country')}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Population Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Population Data</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="populationData.totalPopulation">Total Population</Label>
                <Input
                  id="populationData.totalPopulation"
                  type="number"
                  {...register('populationData.totalPopulation', { valueAsNumber: true })}
                  className={errors.populationData?.totalPopulation ? 'border-red-500' : ''}
                />
                {errors.populationData?.totalPopulation && (
                  <p className="mt-1 text-sm text-red-500">{errors.populationData.totalPopulation.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="populationData.lastCensusYear">Last Census Year</Label>
                <Input
                  id="populationData.lastCensusYear"
                  type="number"
                  {...register('populationData.lastCensusYear', { valueAsNumber: true })}
                  className={errors.populationData?.lastCensusYear ? 'border-red-500' : ''}
                />
                {errors.populationData?.lastCensusYear && (
                  <p className="mt-1 text-sm text-red-500">{errors.populationData.lastCensusYear.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="populationData.urbanPopulation">Urban Population</Label>
                <Input
                  id="populationData.urbanPopulation"
                  type="number"
                  {...register('populationData.urbanPopulation', { valueAsNumber: true })}
                  className={errors.populationData?.urbanPopulation ? 'border-red-500' : ''}
                />
                {errors.populationData?.urbanPopulation && (
                  <p className="mt-1 text-sm text-red-500">{errors.populationData.urbanPopulation.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="populationData.ruralPopulation">Rural Population</Label>
                <Input
                  id="populationData.ruralPopulation"
                  type="number"
                  {...register('populationData.ruralPopulation', { valueAsNumber: true })}
                  className={errors.populationData?.ruralPopulation ? 'border-red-500' : ''}
                />
                {errors.populationData?.ruralPopulation && (
                  <p className="mt-1 text-sm text-red-500">{errors.populationData.ruralPopulation.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactInfo.email">Email</Label>
                <Input
                  id="contactInfo.email"
                  type="email"
                  {...register('contactInfo.email')}
                  className={errors.contactInfo?.email ? 'border-red-500' : ''}
                />
                {errors.contactInfo?.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactInfo.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactInfo.phone">Phone</Label>
                <Input
                  id="contactInfo.phone"
                  {...register('contactInfo.phone')}
                  className={errors.contactInfo?.phone ? 'border-red-500' : ''}
                />
                {errors.contactInfo?.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactInfo.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contactInfo.website">Website</Label>
              <Input
                id="contactInfo.website"
                type="url"
                {...register('contactInfo.website')}
                className={errors.contactInfo?.website ? 'border-red-500' : ''}
                placeholder="https://example.com"
              />
              {errors.contactInfo?.website && (
                <p className="mt-1 text-sm text-red-500">{errors.contactInfo.website.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactInfo.address">Address</Label>
              <Input
                id="contactInfo.address"
                {...register('contactInfo.address')}
                className={errors.contactInfo?.address ? 'border-red-500' : ''}
              />
              {errors.contactInfo?.address && (
                <p className="mt-1 text-sm text-red-500">{errors.contactInfo.address.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : municipality
                ? 'Update Municipality'
                : 'Create Municipality'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
