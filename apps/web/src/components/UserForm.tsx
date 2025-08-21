import { X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Municipality {
  _id: string;
  name: string;
  code: string;
}

interface NGO {
  _id: string;
  name: string;
  type: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  riskLevel?: string;
  municipality?: Municipality;
  ngo?: NGO;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalInfo?: {
    bloodType?: string;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    notes?: string;
  };
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
  municipalities?: Municipality[];
  ngos?: NGO[];
}

const UserForm = ({ user = null, onSubmit, onClose, isLoading = false, municipalities = [], ngos = [] }: UserFormProps) => {
  const isEditing = Boolean(user);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: isEditing 
      ? Yup.string().min(8, 'Password must be at least 8 characters')
      : Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    role: Yup.string().required('Role is required'),
    phone: Yup.string()
      .matches(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
    riskLevel: Yup.string().oneOf(['low', 'medium', 'high', 'critical']),
    municipality: Yup.string().when('role', {
      is: (role: string) => role && role.startsWith('municipality_'),
      then: () => Yup.string().required('Municipality is required for municipality roles'),
    }),
    ngo: Yup.string().when('role', {
      is: (role: string) => role && role.startsWith('ngo_'),
      then: () => Yup.string().required('NGO is required for NGO roles'),
    }),
    'address.street': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('Street address is required for high-risk users'),
    }),
    'address.city': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('City is required for high-risk users'),
    }),
    'address.state': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('State is required for high-risk users'),
    }),
    'address.country': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('Country is required for high-risk users'),
    }),
    'emergencyContact.name': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('Emergency contact name is required for high-risk users'),
    }),
    'emergencyContact.phone': Yup.string().when('role', {
      is: 'highrisk_area_user',
      then: () => Yup.string().required('Emergency contact phone is required for high-risk users'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'citizen',
      phone: user?.phone || '',
      riskLevel: user?.riskLevel || 'low',
      municipality: user?.municipality?._id || '',
      ngo: user?.ngo?._id || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        country: user?.address?.country || '',
        postalCode: user?.address?.postalCode || '',
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        phone: user?.emergencyContact?.phone || '',
        relationship: user?.emergencyContact?.relationship || '',
      },
      medicalInfo: {
        bloodType: user?.medicalInfo?.bloodType || 'Unknown',
        conditions: user?.medicalInfo?.conditions?.join(', ') || '',
        medications: user?.medicalInfo?.medications?.join(', ') || '',
        allergies: user?.medicalInfo?.allergies?.join(', ') || '',
        notes: user?.medicalInfo?.notes || '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      // Transform data for API
      const formData = {
        ...values,
        medicalInfo: {
          ...values.medicalInfo,
          conditions: values.medicalInfo.conditions ? 
            values.medicalInfo.conditions.split(',').map(c => c.trim()).filter(c => c) : [],
          medications: values.medicalInfo.medications ? 
            values.medicalInfo.medications.split(',').map(m => m.trim()).filter(m => m) : [],
          allergies: values.medicalInfo.allergies ? 
            values.medicalInfo.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        }
      };

      // Remove empty password for editing
      if (isEditing && !formData.password) {
        const { password, ...formDataWithoutPassword } = formData;
        return onSubmit(formDataWithoutPassword);
      }

      onSubmit(formData);
    }
  });

  const roles = [
    { value: 'admin', label: 'Admin', orgType: null },
    { value: 'ngo_user', label: 'NGO User', orgType: 'ngo' },
    { value: 'ngo_manager', label: 'NGO Manager', orgType: 'ngo' },
    { value: 'ngo_operator', label: 'NGO Operator', orgType: 'ngo' },
    { value: 'ngo_ground_staff', label: 'NGO Ground Staff', orgType: 'ngo' },
    { value: 'municipality_user', label: 'Municipality User', orgType: 'municipality' },
    { value: 'municipality_manager', label: 'Municipality Manager', orgType: 'municipality' },
    { value: 'municipality_operator', label: 'Municipality Operator', orgType: 'municipality' },
    { value: 'municipality_ground_staff', label: 'Municipality Ground Staff', orgType: 'municipality' },
    { value: 'app_user', label: 'App User', orgType: 'app' },
    { value: 'citizen', label: 'Citizen', orgType: 'app' },
    { value: 'highrisk_area_user', label: 'High Risk Area User', orgType: 'app' },
  ];

  const riskLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const bloodTypes = [
    { value: 'Unknown', label: 'Unknown' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const selectedRole = roles.find(r => r.value === formik.values.role);
  const isHighRiskUser = formik.values.role === 'highrisk_area_user';
  const requiresOrganization = selectedRole?.orgType && selectedRole.orgType !== 'app';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...formik.getFieldProps('email')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEditing ? '(leave empty to keep current)' : '*'}
              </label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...formik.getFieldProps('phone')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                {...formik.getFieldProps('role')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.role && formik.errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                {...formik.getFieldProps('riskLevel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {riskLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Organization Selection */}
            {requiresOrganization && selectedRole.orgType === 'municipality' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Municipality *
                </label>
                <select
                  {...formik.getFieldProps('municipality')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.municipality && formik.errors.municipality ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map(municipality => (
                    <option key={municipality._id} value={municipality._id}>
                      {municipality.name} ({municipality.code})
                    </option>
                  ))}
                </select>
                {formik.touched.municipality && formik.errors.municipality && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.municipality}</p>
                )}
              </div>
            )}

            {requiresOrganization && selectedRole.orgType === 'ngo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NGO *
                </label>
                <select
                  {...formik.getFieldProps('ngo')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.ngo && formik.errors.ngo ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select NGO</option>
                  {ngos.map(ngo => (
                    <option key={ngo._id} value={ngo._id}>
                      {ngo.name} ({ngo.type})
                    </option>
                  ))}
                </select>
                {formik.touched.ngo && formik.errors.ngo && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.ngo}</p>
                )}
              </div>
            )}

            {/* Address Information for High-Risk Users */}
            {isHighRiskUser && (
              <>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4 mt-6">Address Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address.street')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.address?.street && formik.errors.address?.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.address?.street && formik.errors.address?.street && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address.city')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.address?.city && formik.errors.address?.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.address?.city && formik.errors.address?.city && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address.state')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.address?.state && formik.errors.address?.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.address?.state && formik.errors.address?.state && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address.country')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.address?.country && formik.errors.address?.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.address?.country && formik.errors.address?.country && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address.postalCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Emergency Contact for High-Risk Users */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4 mt-6">Emergency Contact</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('emergencyContact.name')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.emergencyContact?.name && formik.errors.emergencyContact?.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.emergencyContact?.name && formik.errors.emergencyContact?.name && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.emergencyContact.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    {...formik.getFieldProps('emergencyContact.phone')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.emergencyContact?.phone && formik.errors.emergencyContact?.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.emergencyContact?.phone && formik.errors.emergencyContact?.phone && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.emergencyContact.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('emergencyContact.relationship')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>

                {/* Medical Information for High-Risk Users */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4 mt-6">Medical Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <select
                    {...formik.getFieldProps('medicalInfo.bloodType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {bloodTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('medicalInfo.conditions')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma-separated list of conditions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medications
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('medicalInfo.medications')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma-separated list of medications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('medicalInfo.allergies')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma-separated list of allergies"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Notes
                  </label>
                  <textarea
                    {...formik.getFieldProps('medicalInfo.notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional medical information or notes"
                  />
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading || !formik.isValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
