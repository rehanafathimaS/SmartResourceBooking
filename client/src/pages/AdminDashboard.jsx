import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectReasonMap, setRejectReasonMap] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAllBookings();
  }, [token, navigate]);

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get('https://smartresourcebooking-1.onrender.com/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch booking requests.'
      });
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Approve Booking?',
      text: "This slot will be reserved for the requested user.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve'
    });

    if (result.isConfirmed) {
      try {
       await axios.put(`https://smartresourcebooking-1.onrender.com/api/bookings/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Approved!', 'Booking request has been approved.', 'success');
        fetchAllBookings();
      } catch (err) {
        Swal.fire('Error', 'Failed to approve booking.', 'error');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = rejectReasonMap[id] || 'Rejected by Admin';
    const result = await Swal.fire({
      title: 'Reject Booking?',
      text: `Reason: "${reason}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Reject'
    });

    if (result.isConfirmed) {
      try {
          await axios.put(`https://smartresourcebooking-1.onrender.com/api/bookings/${id}/reject`, { reason }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Rejected!', 'Booking request has been rejected.', 'success');
        fetchAllBookings();
      } catch (err) {
        Swal.fire('Error', 'Failed to reject booking.', 'error');
      }
    }
  };

  const totalBookings = bookings.length;
  const approvedCount = bookings.filter(b => b.status === 'Approved').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const rejectedCount = bookings.filter(b => b.status === 'Rejected').length;

  // Filter & Search Logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch = 
      (b.resourceId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Navbar */}
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#0f172a', 
          padding: '20px 28px', 
          borderRadius: '16px', 
          color: '#ffffff', 
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)' 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>⚡ Admin Resource Control Portal</h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Real-time Booking Approvals & System Oversight</span>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '10px', 
              border: '1px solid #334155', 
              backgroundColor: '#1e293b', 
              color: '#ffffff', 
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Analytics Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {[
            { label: 'Total Requests', count: totalBookings, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Approved', count: approvedCount, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Pending Review', count: pendingCount, color: '#d97706', bg: '#fffbeb' },
            { label: 'Rejected', count: rejectedCount, color: '#dc2626', bg: '#fef2f2' }
          ].map((card, i) => (
            <div key={i} style={{ 
              backgroundColor: '#ffffff', 
              padding: '22px', 
              borderRadius: '16px', 
              borderLeft: `6px solid ${card.color}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              borderTop: '1px solid #f1f5f9',
              borderRight: '1px solid #f1f5f9',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ color: card.color, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{card.label}</span>
              <h2 style={{ margin: '8px 0 0 0', color: '#0f172a', fontSize: '2.2rem', fontWeight: '800' }}>{card.count}</h2>
            </div>
          ))}
        </div>

        {/* Controls Header: Search & Filter Tabs */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          padding: '20px 24px', 
          borderRadius: '16px', 
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justify: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: filterStatus === status ? '#ffffff' : 'transparent',
                  color: filterStatus === status ? '#0f172a' : '#64748b',
                  boxShadow: filterStatus === status ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Search user, lab or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>

        {/* Requests List Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>
            Booking Requests ({filteredBookings.length})
          </h3>

          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📋</div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No matching booking requests found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filteredBookings.map((b) => (
                <div key={b._id} style={{ 
                  border: '1px solid #e2e8f0', 
                  padding: '20px', 
                  borderRadius: '14px', 
                  backgroundColor: b.status === 'Pending' ? '#ffffff' : '#f8fafc',
                  transition: 'transform 0.2s ease',
                  boxShadow: b.status === 'Pending' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
                        {b.resourceId?.name} &nbsp;
                        <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>({b.resourceId?.location})</span>
                      </h4>
                      <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600' }}>
                        👤 {b.userId?.name} ({b.userId?.department || 'Department'}) &nbsp;•&nbsp; 📧 {b.userId?.email}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '0.78rem', 
                        fontWeight: '800', 
                        letterSpacing: '0.02em',
                        backgroundColor: b.status === 'Approved' ? '#dcfce7' : b.status === 'Rejected' ? '#fee2e2' : '#fef3c7', 
                        color: b.status === 'Approved' ? '#15803d' : b.status === 'Rejected' ? '#b91c1c' : '#b45309' 
                      }}>
                        ● {b.status}
                      </span>
                      {b.priorityScore !== undefined && (
                        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                          Priority Score: <span style={{ color: '#0f172a', fontWeight: '700' }}>{b.priorityScore}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Metadata Badge */}
                  <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', color: '#334155', marginBottom: '14px', lineHeight: '1.6' }}>
                    📅 <b>Date:</b> {b.date} &nbsp;|&nbsp; ⏱️ <b>Slot:</b> {b.startPeriod ? (b.startPeriod === b.endPeriod ? `Period ${b.startPeriod}` : `Period ${b.startPeriod} to Period ${b.endPeriod}`) : `Period ${b.period || 1}`} <br/>
                    📌 <b>Purpose:</b> <i>"{b.purpose}"</i>
                  </div>

                  {b.status === 'Rejected' && b.rejectionReason && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '12px' }}>
                      <b>Rejection Note:</b> {b.rejectionReason}
                    </div>
                  )}

                  {/* Action Bar for Pending Items */}
                  {b.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleApprove(b._id)}
                        style={{ padding: '9px 18px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        ✔ Approve
                      </button>

                      <input
                        type="text"
                        placeholder="Rejection note (Optional)..."
                        value={rejectReasonMap[b._id] || ''}
                        onChange={(e) => setRejectReasonMap({ ...rejectReasonMap, [b._id]: e.target.value })}
                        style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />

                      <button
                        onClick={() => handleReject(b._id)}
                        style={{ padding: '9px 18px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        ✖ Reject
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;