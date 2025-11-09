// Calendar functionality
class ChurchCalendar {
    constructor() {
        this.currentDate = new Date();
        this.events = [
            {
                date: '2025-10-15',
                title: 'Youth Group Meeting',
                time: '6:00 PM',
                description: 'Weekly youth group gathering'
            },
            {
                date: '2025-10-20',
                title: 'Community Outreach',
                time: '9:00 AM',
                description: 'Serving our local community'
            }
            // Add more events here
        ];

        this.initializeCalendar();
        this.bindEvents();
    }

    initializeCalendar() {
        this.updateCalendarHeader();
        this.renderCalendar();
        this.displayEvents();
    }

    updateCalendarHeader() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startingDay = firstDay.getDay();

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // Add blank days from previous month
        for (let i = 0; i < startingDay; i++) {
            const blankDay = document.createElement('div');
            blankDay.className = 'calendar-day empty';
            grid.appendChild(blankDay);
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            const dateStr = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i));
            
            if (this.events.some(event => event.date === dateStr)) {
                day.classList.add('has-event');
                day.innerHTML = `<span class="day-number">${i}</span><span class="event-dot"></span>`;
            } else {
                day.innerHTML = `<span class="day-number">${i}</span>`;
            }

            day.setAttribute('data-date', dateStr);
            grid.appendChild(day);
        }
    }

    displayEvents() {
        const eventList = document.getElementById('eventList');
        eventList.innerHTML = '';

        const monthEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === this.currentDate.getMonth() &&
                   eventDate.getFullYear() === this.currentDate.getFullYear();
        });

        monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        monthEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <div class="event-date">${this.formatDisplayDate(event.date)} - ${event.time}</div>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
            `;
            eventList.appendChild(eventItem);
        });
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDisplayDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
            this.initializeCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
            this.initializeCalendar();
        });
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChurchCalendar();
});