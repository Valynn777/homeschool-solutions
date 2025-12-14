/**
 * Faithful Way Homeschool Solutions
 * Booking System JavaScript
 *
 * This file handles:
 * - Calendar rendering and navigation
 * - Time slot selection
 * - Form validation
 * - localStorage for appointment data
 * - PDF export functionality
 * - Email notification
 */

// ==============================================
// CALENDAR FUNCTIONALITY
// ==============================================

let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let availabilityData = {};

// Load availability data from JSON file
async function loadAvailability() {
    try {
        const response = await fetch('/data/availability.json');
        availabilityData = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Error loading availability:', error);
        // Fallback to empty availability if file doesn't load
        availabilityData = {};
        renderCalendar();
    }
}

// Render the calendar for current month
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;

    // Get calendar grid
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get availability key (e.g., "2025-01")
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthAvailability = availabilityData[monthKey] || {};

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        const cellDate = new Date(year, month, day);
        const isPast = cellDate < today.setHours(0, 0, 0, 0);

        // Check if day has availability
        const dayKey = String(day);
        const hasAvailability = monthAvailability[dayKey] && monthAvailability[dayKey].length > 0;

        if (isPast) {
            dayCell.classList.add('disabled');
        } else if (hasAvailability) {
            dayCell.classList.add('available');
            dayCell.addEventListener('click', () => selectDate(year, month, day));
        } else {
            dayCell.classList.add('disabled');
        }

        grid.appendChild(dayCell);
    }
}

// Handle date selection
function selectDate(year, month, day) {
    selectedDate = {year, month, day};

    // Update visual selection
    document.querySelectorAll('.calendar-day').forEach(cell => {
        cell.classList.remove('selected');
    });
    event.target.classList.add('selected');

    // Show time slots for this date
    showTimeSlots(year, month, day);
}

// Display available time slots for selected date
function showTimeSlots(year, month, day) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const dayKey = String(day);
    const slots = availabilityData[monthKey]?.[dayKey] || [];

    const container = document.getElementById('time-slots-container');
    const slotsDiv = document.getElementById('time-slots');
    const dateDisplay = document.getElementById('selected-date-display');

    // Format date for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    dateDisplay.textContent = `${monthNames[month]} ${day}, ${year}`;

    // Clear previous slots
    slotsDiv.innerHTML = '';

    if (slots.length === 0) {
        slotsDiv.innerHTML = '<p style="color: var(--color-text-muted);">No available times for this date.</p>';
    } else {
        slots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            slot.addEventListener('click', () => selectTime(time, year, month, day));
            slotsDiv.appendChild(slot);
        });
    }

    container.classList.add('show');
}

// Handle time slot selection
function selectTime(time, year, month, day) {
    selectedTime = time;

    // Update visual selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    event.target.classList.add('selected');

    // Store in localStorage
    const appointment = {
        date: `${month + 1}/${day}/${year}`,
        time: time,
        year, month, day
    };
    localStorage.setItem('selectedAppointment', JSON.stringify(appointment));

    // Show selected appointment display
    const display = document.getElementById('selected-appointment-display');
    document.getElementById('appointment-date').textContent = appointment.date;
    document.getElementById('appointment-time').textContent = time;
    display.classList.add('show');

    // Update step indicator
    document.getElementById('step1-indicator').classList.remove('active');
    document.getElementById('step2-indicator').classList.add('active');
}

// ==============================================
// FORM VALIDATION & SUBMISSION
// ==============================================

// Form validation
function validateForm() {
    let isValid = true;

    // Required text fields
    const requiredFields = ['parentName', 'clientEmail', 'clientPhone', 'childGrade', 'challenges', 'goals'];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const group = field.closest('.form-group');
        const message = group.querySelector('.validation-message');

        if (!field.value.trim()) {
            group.classList.add('error');
            group.classList.remove('success');
            message.classList.add('show');
            isValid = false;
        } else {
            group.classList.remove('error');
            group.classList.add('success');
            message.classList.remove('show');
        }
    });

    // Email validation
    const email = document.getElementById('clientEmail');
    const emailGroup = email.closest('.form-group');
    const emailMessage = emailGroup.querySelector('.validation-message');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.value)) {
        emailGroup.classList.add('error');
        emailGroup.classList.remove('success');
        emailMessage.classList.add('show');
        isValid = false;
    }

    // Phone validation (basic)
    const phone = document.getElementById('clientPhone');
    const phoneGroup = phone.closest('.form-group');
    const phoneMessage = phoneGroup.querySelector('.validation-message');
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (!phoneRegex.test(phone.value.replace(/\s/g, ''))) {
        phoneGroup.classList.add('error');
        phoneGroup.classList.remove('success');
        phoneMessage.classList.add('show');
        isValid = false;
    }

    // Checkbox validation
    const policies = document.getElementById('policies');
    const policiesGroup = policies.closest('.form-group');
    const policiesMessage = policiesGroup.querySelector('.validation-message');

    if (!policies.checked) {
        policiesGroup.classList.add('error');
        policiesMessage.classList.add('show');
        isValid = false;
    } else {
        policiesGroup.classList.remove('error');
        policiesMessage.classList.remove('show');
    }

    // Check if appointment is selected
    if (!selectedDate || !selectedTime) {
        alert('Please select an appointment date and time before submitting.');
        isValid = false;
    }

    return isValid;
}

// Determine service type based on form (customize as needed)
function getServiceType(grade) {
    // This is a placeholder - customize based on your logic
    return 'Initial Consultation (60 min) - $75';
}

// Show confirmation section (call this after successful payment)
function showConfirmation() {
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('confirmation-section').classList.add('show');
}

// ==============================================
// PDF EXPORT FUNCTIONALITY
// ==============================================

function exportToPDF() {
    const formData = JSON.parse(localStorage.getItem('intakeFormData'));
    const appointment = JSON.parse(localStorage.getItem('selectedAppointment'));

    if (!formData || !appointment) {
        alert('No booking data found.');
        return;
    }

    // Using jsPDF library
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add logo (if you want to include it)
    // doc.addImage('images/logo.png', 'PNG', 15, 10, 30, 30);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 122, 184);
    doc.text('Faithful Way Homeschool Solutions', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Consultation Booking Confirmation', 105, 30, { align: 'center' });

    // Appointment Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Appointment Details:', 20, 50);
    doc.setFontSize(10);
    doc.text(`Date: ${appointment.date}`, 30, 60);
    doc.text(`Time: ${appointment.time}`, 30, 67);

    // Client Information
    doc.setFontSize(12);
    doc.text('Client Information:', 20, 80);
    doc.setFontSize(10);
    doc.text(`Name: ${formData.parentName}`, 30, 90);
    doc.text(`Email: ${formData.email}`, 30, 97);
    doc.text(`Phone: ${formData.phone}`, 30, 104);
    doc.text(`Child's Grade: ${formData.childGrade}`, 30, 111);

    // Challenges & Goals
    doc.setFontSize(12);
    doc.text('Challenges:', 20, 125);
    doc.setFontSize(10);
    const challengesLines = doc.splitTextToSize(formData.challenges, 170);
    doc.text(challengesLines, 30, 135);

    const yPosition = 135 + (challengesLines.length * 7);
    doc.setFontSize(12);
    doc.text('Goals:', 20, yPosition + 10);
    doc.setFontSize(10);
    const goalsLines = doc.splitTextToSize(formData.goals, 170);
    doc.text(goalsLines, 30, yPosition + 20);

    // Footer
    const finalY = yPosition + 20 + (goalsLines.length * 7) + 20;
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('© 2025 Faithful Way Homeschool Solutions', 105, finalY, { align: 'center' });
    doc.text('www.faithfulwayhomeschool.com', 105, finalY + 5, { align: 'center' });

    // Save PDF
    doc.save(`consultation-booking-${formData.parentName.replace(/\s+/g, '-')}.pdf`);
}

// ==============================================
// EMAIL FUNCTIONALITY
// ==============================================

function emailCopy() {
    const formData = JSON.parse(localStorage.getItem('intakeFormData'));
    const appointment = JSON.parse(localStorage.getItem('selectedAppointment'));

    if (!formData || !appointment) {
        alert('No booking data found.');
        return;
    }

    // Create email body
    const subject = encodeURIComponent('Consultation Booking Confirmation - Faithful Way Homeschool Solutions');
    const body = encodeURIComponent(`
Dear ${formData.parentName},

Thank you for booking a consultation with Faithful Way Homeschool Solutions!

APPOINTMENT DETAILS:
Date: ${appointment.date}
Time: ${appointment.time}

CONTACT INFORMATION:
Email: ${formData.email}
Phone: ${formData.phone}
Child's Grade: ${formData.childGrade}

We look forward to supporting your homeschool journey!

Best regards,
Faithful Way Homeschool Solutions
www.faithfulwayhomeschool.com
    `.trim());

    // Open mailto link
    window.location.href = `mailto:${formData.email}?subject=${subject}&body=${body}`;

    alert('Your email client will open with a confirmation message. Please send the email to receive your copy.');
}

// ==============================================
// INITIALIZATION
// ==============================================

// Load availability data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAvailability();

    // Calendar navigation buttons
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Form submission
    const intakeForm = document.getElementById('intakeForm');
    intakeForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Collect form data
        const formData = {
            parentName: document.getElementById('parentName').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            childGrade: document.getElementById('childGrade').value,
            strengths: document.getElementById('strengths').value,
            challenges: document.getElementById('challenges').value,
            goals: document.getElementById('goals').value,
            subjects: document.getElementById('subjects').value,
            additionalNotes: document.getElementById('additionalNotes').value,
            appointment: JSON.parse(localStorage.getItem('selectedAppointment'))
        };

        // Store form data in localStorage
        localStorage.setItem('intakeFormData', JSON.stringify(formData));

        // Update payment section with details
        document.getElementById('confirm-date').textContent = formData.appointment.date;
        document.getElementById('confirm-time').textContent = formData.appointment.time;
        document.getElementById('confirm-service').textContent = getServiceType(formData.childGrade);

        // Show payment section
        document.getElementById('payment-section').style.display = 'block';
        document.getElementById('step2-indicator').classList.remove('active');
        document.getElementById('step3-indicator').classList.add('active');

        // Scroll to payment section
        document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Payment button click handlers
    document.getElementById('stripe-payment').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Stripe payment link goes here. Update the href attribute with your Stripe checkout URL.');
    });

    document.getElementById('paypal-payment').addEventListener('click', function(e) {
        e.preventDefault();
        alert('PayPal payment link goes here. Update the href attribute with your PayPal.me link.');
    });

    document.getElementById('square-payment').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Square payment link goes here. Update the href attribute with your Square payment link.');
    });

    // Check if there's existing appointment data in localStorage
    const savedAppointment = localStorage.getItem('selectedAppointment');
    if (savedAppointment) {
        const apt = JSON.parse(savedAppointment);
        document.getElementById('appointment-date').textContent = apt.date;
        document.getElementById('appointment-time').textContent = apt.time;
        document.getElementById('selected-appointment-display').classList.add('show');
    }
});

// Export functions for use in HTML onclick handlers
window.exportToPDF = exportToPDF;
window.emailCopy = emailCopy;
window.showConfirmation = showConfirmation;
