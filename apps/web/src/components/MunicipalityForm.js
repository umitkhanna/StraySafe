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

/**
 * MunicipalityForm Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onClose - Close dialog function
 * @param {Object} [props.municipality] - Municipality to edit
 */
const MunicipalityForm = ({ isOpen, onClose, municipality = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateMunicipality();
  const updateMutation = useUpdateMunicipality();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      state: '',
      country: 'India',
      populationData: {
        totalPopulation: '',
        urbanPopulation: '',
        ruralPopulation: '',
        lastCensusYear: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        website: '',
        address: '',
      },
    },
  });

  // Set form values when editing municipality
  useEffect(() => {
    if (municipality && isOpen) {
      setValue('name', municipality.name || '');
      setValue('state', municipality.state || '');
      setValue('country', municipality.country || 'India');
      setValue('populationData.totalPopulation', municipality.populationData?.totalPopulation || '');
      setValue('populationData.urbanPopulation', municipality.populationData?.urbanPopulation || '');
      setValue('populationData.ruralPopulation', municipality.populationData?.ruralPopulation || '');
      setValue('populationData.lastCensusYear', municipality.populationData?.lastCensusYear || '');
      setValue('contactInfo.email', municipality.contactInfo?.email || '');
      setValue('contactInfo.phone', municipality.contactInfo?.phone || '');
      setValue('contactInfo.website', municipality.contactInfo?.website || '');
      setValue('contactInfo.address', municipality.contactInfo?.address || '');
    }
  }, [municipality, isOpen, setValue]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const municipalityData = {
        name: data.name,
        state: data.state,
        country: data.country,
        populationData: {
          totalPopulation: data.populationData.totalPopulation ? Number(data.populationData.totalPopulation) : undefined,
          lastCensusYear: data.populationData.lastCensusYear ? Number(data.populationData.lastCensusYear) : undefined,
          urbanPopulation: data.populationData.urbanPopulation ? Number(data.populationData.urbanPopulation) : undefined,
          ruralPopulation: data.populationData.ruralPopulation ? Number(data.populationData.ruralPopulation) : undefined,
        },
        contactInfo: {
          email: data.contactInfo.email || undefined,
          phone: data.contactInfo.phone || undefined,
          website: data.contactInfo.website || undefined,
          address: data.contactInfo.address || undefined,
        },
        adminUser: 'current-user-id' // This should come from auth context
      };

      if (municipality) {
        await updateMutation.mutateAsync({ id: municipality._id, data: municipalityData });
      } else {
        await createMutation.mutateAsync(municipalityData);
      }

      onClose();
      reset();
    } catch (error) {
      console.error('Error saving municipality:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {municipality ? 'Edit Municipality' : 'Create New Municipality'}
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
                {...register('name', { required: 'Municipality name is required' })}
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
                  {...register('state', { required: 'State is required' })}
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
                  {...register('country', { required: 'Country is required' })}
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
                  {...register('populationData.totalPopulation')}
                  placeholder="Enter total population"
                />
              </div>

              <div>
                <Label htmlFor="populationData.lastCensusYear">Last Census Year</Label>
                <Input
                  id="populationData.lastCensusYear"
                  type="number"
                  {...register('populationData.lastCensusYear')}
                  placeholder="Enter census year"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="populationData.urbanPopulation">Urban Population</Label>
                <Input
                  id="populationData.urbanPopulation"
                  type="number"
                  {...register('populationData.urbanPopulation')}
                  placeholder="Enter urban population"
                />
              </div>

              <div>
                <Label htmlFor="populationData.ruralPopulation">Rural Population</Label>
                <Input
                  id="populationData.ruralPopulation"
                  type="number"
                  {...register('populationData.ruralPopulation')}
                  placeholder="Enter rural population"
                />
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
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="contactInfo.phone">Phone</Label>
                <Input
                  id="contactInfo.phone"
                  {...register('contactInfo.phone')}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactInfo.website">Website</Label>
              <Input
                id="contactInfo.website"
                type="url"
                {...register('contactInfo.website')}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="contactInfo.address">Address</Label>
              <Input
                id="contactInfo.address"
                {...register('contactInfo.address')}
                placeholder="Enter physical address"
              />
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
};

export default MunicipalityForm;
