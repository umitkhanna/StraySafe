import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api";
import Layout from "../layouts/Layout";
import usePageTitle from "../hooks/usePageTitle";

const TICKET_TYPES = {
  dogBite: "Dog Bite",
  dogChasing: "Dog Chasing",
  aggressiveDog: "Aggressive Dog",
  strayDogFeeding: "Stray Dog Feeding",
  dogInDistress: "Dog in Distress",
  other: "Other"
};

const STATUS_COLORS = {
  open: "bg-red-100 text-red-800",
  inProgress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800"
};

const PRIORITY_COLORS = {
  urgent: "bg-red-200 text-red-900",
  high: "bg-orange-200 text-orange-900",
  medium: "bg-yellow-200 text-yellow-900",
  low: "bg-green-200 text-green-900"
};

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    priority: "all"
  });

  usePageTitle("Ticket Management");

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.priority !== "all") params.append("priority", filters.priority);
      
      const response = await api.get(`/tickets?${params}`);
      setTickets(response.data.tickets || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/tickets/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleStatusUpdate = async (ticketId, status, resolutionNotes = "") => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, {
        status,
        resolutionNotes
      });
      
      // Update the ticket in the list
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? response.data : ticket
      ));
      
      // Update selected ticket if it's the same one
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(response.data);
      }
      
      fetchStats(); // Refresh stats
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update ticket");
    }
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/assign`, {});
      
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? response.data : ticket
      ));
      
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(response.data);
      }
      
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to assign ticket");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "inProgress":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "resolved":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationString = (ticket) => {
    if (ticket.address?.fullAddress) {
      return ticket.address.fullAddress;
    }
    
    const parts = [];
    if (ticket.address?.street) parts.push(ticket.address.street);
    if (ticket.address?.city) parts.push(ticket.address.city);
    if (ticket.address?.state) parts.push(ticket.address.state);
    
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  return (
    <Layout 
      title="Ticket Management" 
      subtitle="Manage incident reports and service requests"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.open || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-lg">
                <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgent || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="inProgress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                {Object.entries(TICKET_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-600">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">#{ticket.ticketNumber}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace(/([A-Z])/g, ' $1')}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h4>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{TICKET_TYPES[ticket.type]}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{getLocationString(ticket)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Reported by: {ticket.reportedBy?.name || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>

                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span>{ticket.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowDetails(true);
                        }}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium"
                      >
                        View Details
                      </button>

                      {!ticket.assignedTo && (user.role.toLowerCase() === 'operators' || user.role.toLowerCase() === 'groundstaff') && (
                        <button
                          onClick={() => handleAssignToMe(ticket._id)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                        >
                          Assign to Me
                        </button>
                      )}

                      {ticket.assignedTo?._id === user._id && ticket.status === 'open' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, 'inProgress')}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-sm font-medium"
                        >
                          Start Work
                        </button>
                      )}

                      {ticket.assignedTo?._id === user._id && ticket.status === 'inProgress' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, 'resolved')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details Modal */}
        {showDetails && selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket Details - #{selectedTicket.ticketNumber}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedTicket.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Type</p>
                    <p className="text-sm text-gray-900">{TICKET_TYPES[selectedTicket.type]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Priority</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTicket.status]}`}>
                      {selectedTicket.status.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Urgency Level</p>
                    <p className="text-sm text-gray-900">{selectedTicket.urgencyLevel}/10</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-900">{getLocationString(selectedTicket)}</p>
                  {selectedTicket.location?.coordinates && (
                    <p className="text-xs text-gray-500">
                      Coordinates: {selectedTicket.location.coordinates[1]}, {selectedTicket.location.coordinates[0]}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Reported By</p>
                  <p className="text-sm text-gray-900">
                    {selectedTicket.reportedBy?.name} ({selectedTicket.reportedBy?.email})
                  </p>
                  <p className="text-xs text-gray-500">Role: {selectedTicket.reportedBy?.role}</p>
                </div>

                {selectedTicket.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned To</p>
                    <p className="text-sm text-gray-900">
                      {selectedTicket.assignedTo.name} ({selectedTicket.assignedTo.email})
                    </p>
                  </div>
                )}

                {selectedTicket.victimInjured && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-800">⚠️ Victim Injured</p>
                    {selectedTicket.medicalAttentionRequired && (
                      <p className="text-sm text-red-700">Medical attention required</p>
                    )}
                  </div>
                )}

                {selectedTicket.animalDescription && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Animal Description</p>
                    <div className="text-sm text-gray-900 space-y-1">
                      {selectedTicket.animalDescription.breed && <p>Breed: {selectedTicket.animalDescription.breed}</p>}
                      {selectedTicket.animalDescription.color && <p>Color: {selectedTicket.animalDescription.color}</p>}
                      {selectedTicket.animalDescription.size && <p>Size: {selectedTicket.animalDescription.size}</p>}
                      <p>Collar: {selectedTicket.animalDescription.collar ? 'Yes' : 'No'}</p>
                      {selectedTicket.animalDescription.tags && <p>Tags: {selectedTicket.animalDescription.tags}</p>}
                    </div>
                  </div>
                )}

                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <div key={index} className="border rounded-lg p-2">
                          <p className="text-xs text-gray-600">{attachment.type}</p>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.resolutionNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resolution Notes</p>
                    <p className="text-sm text-gray-900">{selectedTicket.resolutionNotes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <p className="font-medium">Created</p>
                    <p>{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  {selectedTicket.resolvedAt && (
                    <div>
                      <p className="font-medium">Resolved</p>
                      <p>{formatDate(selectedTicket.resolvedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
