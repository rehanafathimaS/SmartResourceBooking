import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Dashboard() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [date, setDate] = useState('');
  const [startPeriod, setStartPeriod] = useState(1);
  const [endPeriod, setEndPeriod] = useState(1);
  
  // Dynamic Purpose State
  const [purposeCategory, setPurposeCategory] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');

  const [slotsStatus, setSlotsStatus] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchResources();
    fetchMyBookings();
  }, [token, navigate]);

  useEffect(() => {
    if (selectedResource && date) {
      fetchSlotStatus();
    }
  }, [selectedResource, date]);

 const fetchResources = async () => {
    try {
      const res = await axios.get('https://smartresourcebooking-1.onrender.com/api/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('https://smartresourcebooking-1.onrender.com/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch my bookings:', err);
    }
  };

  const fetchSlotStatus = async () => {
    try {
      const res = await axios.get(`https://smartresourcebooking-1.onrender.com/api/bookings/slots-status?resourceId=${selectedResource}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlotsStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine final purpose text
    const finalPurpose = purposeCategory === 'Other' ? customPurpose : purposeCategory;

    if (!selectedResource || !date || !finalPurpose) {
      Swal.fire('Incomplete Form', 'Please select a facility, date, and specify the purpose.', 'warning');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        resourceId: selectedResource,
        date,
        startPeriod: Number(startPeriod),
        endPeriod: Number(endPeriod),
        purpose: finalPurpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success!', 'Your booking request has been submitted to Admin.', 'success');
      setPurposeCategory('');
      setCustomPurpose('');
      fetchMyBookings();
      if (selectedResource && date) fetchSlotStatus();
    } catch (err) {
      Swal.fire('Booking Failed', err.response?.data?.message || 'Conflict detected or error occurred', 'error');
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel Booking?',
      text: "Are you sure you want to withdraw this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Cancel It'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Cancelled', 'Booking request has been removed.', 'success');
        fetchMyBookings();
        if (selectedResource && date) fetchSlotStatus();
      } catch (err) {
        Swal.fire('Error', 'Failed to cancel booking.', 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredHistory = myBookings.filter(b => {
    if (historyFilter === 'All') return true;
    return b.status === historyFilter;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#0f172a', 
          padding: '20px 28px', 
          borderRadius: '16px', 
          color: '#ffffff', 
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)' 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>🎓 Smart Resource Booking Portal</h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Welcome, <b>{user.name || 'User'}</b> ({user.department || 'General'})</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                ⚡ Admin Panel
              </button>
            )}
            <button onClick={handleLogout} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Reserve Form */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '28px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>
            📅 Reserve Resource Slot
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Select Facility / Resource</label>
                <select 
                  value={selectedResource} 
                  onChange={(e) => setSelectedResource(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">-- Choose Resource --</option>
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} ({r.type}) — {r.location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Select Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Live Availability Status */}
            {selectedResource && date && (
              <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '12px' }}>
                  📊 Live Availability for Selected Date (Periods 1 to 8):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                    const status = slotsStatus[p] || 'Available';
                    const isBooked = status === 'Booked';
                    const isPending = status === 'Pending';
                    return (
                      <div key={p} style={{ 
                        textAlign: 'center', 
                        padding: '10px 4px', 
                        borderRadius: '8px', 
                        fontSize: '0.78rem', 
                        fontWeight: '800',
                        backgroundColor: isBooked ? '#fee2e2' : isPending ? '#fef3c7' : '#dcfce7',
                        color: isBooked ? '#b91c1c' : isPending ? '#b45309' : '#15803d',
                        border: isBooked ? '1px solid #fecaca' : isPending ? '1px solid #fde68a' : '1px solid #bbf7d0'
                      }}>
                        P{p}<br/>
                        <span style={{ fontSize: '0.68rem', fontWeight: '600' }}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>From Period</label>
                <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>To Period</label>
                <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
            </div>

            {/* Purpose Selection with Options + Custom Input */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Purpose / Remarks
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select 
                  value={purposeCategory} 
                  onChange={(e) => setPurposeCategory(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">-- Select Purpose --</option>
                  <option value="General Student Practice / Free Hour">General Student Practice / Free Hour</option>
                  <option value="Practical Exam / Lab Audit">Practical Exam / Lab Audit</option>
                  <option value="Final Year Project Work">Final Year Project Work</option>
                  <option value="Department Seminar / Guest Lecture">Department Seminar / Guest Lecture</option>
                  <option value="Club Activity / Workshop">Club Activity / Workshop</option>
                  <option value="Other">Other Reason (Specify below)...</option>
                </select>

                {purposeCategory === 'Other' && (
                  <input 
                    type="text" 
                    placeholder="Type your specific purpose here..." 
                    value={customPurpose} 
                    onChange={(e) => setCustomPurpose(e.target.value)} 
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#f8fafc' }} 
                  />
                )}
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>
              🚀 Submit Booking Request
            </button>
          </form>
        </div>

        {/* My Booking History */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '28px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>📋 My Booking History</h3>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              {['All', 'Approved', 'Pending', 'Rejected'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setHistoryFilter(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: historyFilter === s ? '#ffffff' : 'transparent',
                    color: historyFilter === s ? '#0f172a' : '#64748b'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>No booking history found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredHistory.map((b) => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>{b.resourceId?.name || 'Resource'}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📅 {b.date} &nbsp;|&nbsp; ⏱️ Period {b.startPeriod} to {b.endPeriod} &nbsp;|&nbsp; 📌 {b.purpose}</span>
                    {b.status === 'Rejected' && b.rejectionReason && (
                      <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>Note: {b.rejectionReason}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '5px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      backgroundColor: b.status === 'Approved' ? '#dcfce7' : b.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: b.status === 'Approved' ? '#15803d' : b.status === 'Rejected' ? '#b91c1c' : '#b45309'
                    }}>
                      ● {b.status}
                    </span>
                    {b.status === 'Pending' && (
                      <button onClick={() => handleCancel(b._id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;