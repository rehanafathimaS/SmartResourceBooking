const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail'); // Nodemailer helper

// 1. Submit New Booking Request (Student -> Admin Mail)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { resourceId, date, startPeriod, endPeriod, purpose } = req.body;
    const userId = req.user._id || req.user.id || req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User authorization failed: userId missing in token' });
    }

    const newBooking = new Booking({
      userId,
      resourceId,
      date,
      startPeriod,
      endPeriod,
      purpose
    });

    await newBooking.save();

    // Populate user and resource details to get real email and facility name
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('userId', 'name email department')
      .populate('resourceId', 'name location');

    // EMAIL 1: Send Notification to ADMIN when student submits a request
    try {
      // Updated Code:
      const adminEmail = 'rehanashaj4@gmail.com'; // Your real Admin Email ID
      const mailSubject = `New Booking Request from ${populatedBooking.userId.name}`;
      const mailText = `Hello Admin,\n\nA new booking request has been submitted:\n\nStudent: ${populatedBooking.userId.name} (${populatedBooking.userId.email})\nResource: ${populatedBooking.resourceId ? populatedBooking.resourceId.name : 'Facility'}\nDate: ${date}\nPeriods: ${startPeriod} to ${endPeriod}\nPurpose: ${purpose}\n\nPlease log in to Admin Dashboard to Accept or Reject.\n\nRegards,\nSmart Resource Portal`;

      await sendEmail(adminEmail, mailSubject, mailText);
      console.log('Admin notification email sent successfully!');
    } catch (emailErr) {
      console.error('Error sending email to Admin:', emailErr.message);
    }

    res.status(201).json({ message: 'Booking request submitted successfully', booking: newBooking });
  } catch (err) {
    console.error("Booking Creation Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// 2. Get All Bookings (For Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email department')
      .populate('resourceId', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get User's Own Bookings History
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const bookings = await Booking.find({ userId }).populate('resourceId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get Slot Availability Status
router.get('/slots-status', authMiddleware, async (req, res) => {
  try {
    const { resourceId, date } = req.query;
    if (!resourceId || !date) {
      return res.status(400).json({ message: 'resourceId and date are required query parameters' });
    }

    const bookings = await Booking.find({
      resourceId,
      date,
      status: { $in: ['Approved', 'Pending'] }
    });

    const slots = {};
    for (let p = 1; p <= 8; p++) {
      slots[p] = 'Available';
    }

    bookings.forEach((b) => {
      const start = Number(b.startPeriod || b.period || 1);
      const end = Number(b.endPeriod || b.startPeriod || b.period || 1);
      const statusText = b.status === 'Approved' ? 'Booked' : 'Pending';

      for (let p = start; p <= end; p++) {
        slots[p] = statusText;
      }
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Approve Booking Request (Admin -> Student Mail)
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    ).populate('userId', 'name email').populate('resourceId', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // EMAIL 2: Send Approval Email to STUDENT's REAL EMAIL ID
    try {
      const studentEmail = booking.userId.email; // e.g., rakshanasamsudeen@gmail.com
      const mailSubject = `Booking Request Approved - Smart Resource Portal`;
      const mailText = `Hello ${booking.userId.name},\n\nYour booking request for ${booking.resourceId ? booking.resourceId.name : 'Resource'} on ${booking.date} (Periods: ${booking.startPeriod}-${booking.endPeriod}) has been APPROVED by Admin.\n\nThank you,\nSmart Resource Portal`;

      await sendEmail(studentEmail, mailSubject, mailText);
      console.log(`Approval email sent to student: ${studentEmail}`);
    } catch (emailErr) {
      console.error('Error sending approval email to student:', emailErr.message);
    }

    res.json({ message: 'Booking approved successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Reject Booking Request (Admin -> Student Mail)
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', rejectionReason: reason || 'Rejected by Admin' },
      { new: true }
    ).populate('userId', 'name email').populate('resourceId', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // EMAIL 3: Send Rejection Email to STUDENT's REAL EMAIL ID
    try {
      const studentEmail = booking.userId.email;
      const mailSubject = `Booking Request Status Update - Smart Resource Portal`;
      const mailText = `Hello ${booking.userId.name},\n\nYour booking request for ${booking.resourceId ? booking.resourceId.name : 'Resource'} on ${booking.date} has been REJECTED.\nReason: ${reason || 'Slot unavailable'}\n\nRegards,\nSmart Resource Portal`;

      await sendEmail(studentEmail, mailSubject, mailText);
      console.log(`Rejection email sent to student: ${studentEmail}`);
    } catch (emailErr) {
      console.error('Error sending rejection email to student:', emailErr.message);
    }

    res.json({ message: 'Booking rejected successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Cancel / Delete Booking
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;