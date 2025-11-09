// Service Registration System
class ServiceRegistration {
    constructor() {
        this.upcomingEvents = [
            {
                id: 1,
                title: "Christmas Eve Service",
                date: "2025-12-24",
                time: "7:00 PM",
                maxAttendees: 200,
                currentRegistered: 45,
                description: "Special Christmas Eve candlelight service",
                type: "special"
            },
            {
                id: 2,
                title: "CrossOver Service",
                date: "2025-12-31",
                time: "10:00 PM",
                maxAttendees: 150,
                currentRegistered: 30,
                description: "Special CrossOver Service to welcome the New Year",
                type: "special"
            }
        ];

        this.initializeRegistration();
    }

    initializeRegistration() {
        this.displayUpcomingEvents();
        this.setupEventListeners();
    }

    displayUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;

        container.innerHTML = this.upcomingEvents.map(event => `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <span class="event-capacity">
                        <i class="fas fa-users"></i>
                        ${event.currentRegistered}/${event.maxAttendees} registered
                    </span>
                </div>
                <div class="event-details">
                    <p><i class="far fa-calendar"></i> ${this.formatDate(event.date)}</p>
                    <p><i class="far fa-clock"></i> ${event.time}</p>
                    <p>${event.description}</p>
                </div>
                <button class="register-btn" onclick="serviceRegistration.openRegistrationForm(${event.id})">
                    Register Now
                </button>
            </div>
        `).join('');
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    openRegistrationForm(eventId) {
        const event = this.upcomingEvents.find(e => e.id === eventId);
        if (!event) return;

        showModal('registration', `
            <h2>Register for ${event.title}</h2>
            <p class="event-date">${this.formatDate(event.date)} at ${event.time}</p>
            <form id="registrationForm" onsubmit="serviceRegistration.handleRegistration(event, ${eventId})">
                <div class="form-group">
                    <label for="regName">Full Name *</label>
                    <input type="text" id="regName" required>
                </div>
                <div class="form-group">
                    <label for="regEmail">Email *</label>
                    <input type="email" id="regEmail" required>
                </div>
                <div class="form-group">
                    <label for="regPhone">Phone *</label>
                    <input type="tel" id="regPhone" required>
                </div>
                <div class="form-group">
                    <label for="regAttendees">Number of Attendees *</label>
                    <input type="number" id="regAttendees" min="1" max="10" value="1" required>
                </div>
                <div class="form-group">
                    <label for="regNotes">Special Notes (optional)</label>
                    <textarea id="regNotes" rows="3"></textarea>
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="regNewcomer">
                    <label for="regNewcomer">I'm new to the church</label>
                </div>
                <button type="submit" class="submit-btn">Confirm Registration</button>
            </form>
        `);
    }

    handleRegistration(event, eventId) {
        event.preventDefault();
        const formData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            attendees: document.getElementById('regAttendees').value,
            notes: document.getElementById('regNotes').value,
            isNewcomer: document.getElementById('regNewcomer').checked
        };

        // Here you would typically send this data to your server
        // For demo purposes, we'll just show a success message
        showModal('confirmation', `
            <div class="registration-confirmation">
                <i class="fas fa-check-circle"></i>
                <h2>Registration Successful!</h2>
                <p>Thank you for registering, ${formData.name}!</p>
                <p>We've sent a confirmation email to ${formData.email} with all the details.</p>
                <p>If you're new to our church, we look forward to welcoming you!</p>
                <button onclick="closeModal()" class="cta-button">Close</button>
            </div>
        `);

        // Update the display
        this.upcomingEvents = this.upcomingEvents.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    currentRegistered: event.currentRegistered + parseInt(formData.attendees)
                };
            }
            return event;
        });
        this.displayUpcomingEvents();
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }
}

// Initialize the service registration system
let serviceRegistration;
document.addEventListener('DOMContentLoaded', () => {
    serviceRegistration = new ServiceRegistration();
});