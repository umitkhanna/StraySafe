// Simplified type definitions for JavaScript
// These are mainly for documentation purposes

/**
 * @typedef {Object} Municipality
 * @property {string} _id - Unique identifier
 * @property {string} name - Municipality name
 * @property {string} state - State name
 * @property {string} country - Country name
 * @property {PopulationData} [populationData] - Population information
 * @property {ContactInfo} [contactInfo] - Contact details
 * @property {boolean} isActive - Whether municipality is active
 * @property {string} adminUser - Admin user identifier
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} PopulationData
 * @property {number} [totalPopulation] - Total population
 * @property {number} [urbanPopulation] - Urban population
 * @property {number} [ruralPopulation] - Rural population
 * @property {number} [lastCensusYear] - Last census year
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} [email] - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [website] - Website URL
 * @property {string} [address] - Physical address
 */

/**
 * @typedef {Object} CreateMunicipalityData
 * @property {string} name - Municipality name
 * @property {string} state - State name
 * @property {string} country - Country name
 * @property {PopulationData} [populationData] - Population information
 * @property {ContactInfo} [contactInfo] - Contact details
 * @property {string} adminUser - Admin user identifier
 */

/**
 * @typedef {Object} NGO
 * @property {string} _id - Unique identifier
 * @property {string} name - NGO name
 * @property {string} registrationNumber - Registration number
 * @property {string} category - NGO category
 * @property {ContactInfo} contactInfo - Contact details
 * @property {boolean} isActive - Whether NGO is active
 * @property {string} adminUser - Admin user identifier
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total pages
 * @property {number} totalItems - Total items
 * @property {number} itemsPerPage - Items per page
 * @property {boolean} hasNextPage - Whether has next page
 * @property {boolean} hasPrevPage - Whether has previous page
 */

/**
 * @typedef {Object} ApiResponse
 * @property {string} status - Response status
 * @property {Object} data - Response data
 */

/**
 * @typedef {Object} MunicipalitiesResponse
 * @property {string} status - Response status
 * @property {Object} data - Response data
 * @property {Municipality[]} data.municipalities - Array of municipalities
 * @property {PaginationInfo} data.pagination - Pagination information
 */

/**
 * @typedef {Object} NGOsResponse
 * @property {string} status - Response status
 * @property {Object} data - Response data
 * @property {NGO[]} data.ngos - Array of NGOs
 * @property {PaginationInfo} data.pagination - Pagination information
 */

export default {};
