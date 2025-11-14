// Sermon archive functionality
class SermonArchive {
    constructor() {
        this.sermons = [
            {
                title: 'Walking in Faith',
                date: '2025-10-06',
                speaker: 'Pastor Johnson',
                category: 'faith',
                thumbnail: 'assets/sermon1.jpg',
                videoUrl: 'https://youtube.com/watch?v=example1',
                audioUrl: 'assets/sermons/sermon1.mp3',
                description: 'A powerful message about walking in faith through difficult times.',
                featured: true
            },
            {
                title: 'Building Strong Families',
                date: '2025-10-13',
                speaker: 'Pastor Johnson',
                category: 'family',
                thumbnail: 'assets/sermon2.jpg',
                videoUrl: 'https://youtube.com/watch?v=example2',
                audioUrl: 'assets/sermons/sermon2.mp3',
                description: 'Learning biblical principles for strong family relationships.',
                featured: false
            },
            {
                title: 'The Power of Worship',
                date: '2025-10-20',
                speaker: 'Pastor M.A Bankole',
                category: 'worship',
                thumbnail: 'assets/sermon3.jpg',
                videoUrl: 'https://youtube.com/watch?v=example3',
                audioUrl: 'assets/sermons/sermon3.mp3',
                description: 'Discover the transformative power of worship in your daily life.',
                featured: false
            },
            {
                title: 'Grace and Mercy',
                date: '2025-10-27',
                speaker: 'Pastor M.A Bankole',
                category: 'faith',
                thumbnail: 'assets/sermon4.jpg',
                videoUrl: 'https://youtube.com/watch?v=example4',
                audioUrl: 'assets/sermons/sermon4.mp3',
                description: 'Understanding God\'s grace and mercy in our lives.',
                featured: false
            }
            // Add more sermons here
        ];

        this.currentPage = 1;
        this.sermonsPerPage = 6;
        this.currentCategory = 'all';
        this.currentSort = 'date-desc';
        this.initializeSermonArchive();
        this.bindEvents();
        this.initializeLiveStream();
    }

    initializeSermonArchive() {
        this.renderFeaturedSermon();
        this.renderCategoryTabs();
        this.renderSermons();
    }

    renderSermons(filtered = null) {
        const grid = document.getElementById('sermonsGrid');
        grid.innerHTML = '';

        const sermonsToShow = filtered || this.sermons;
        const start = (this.currentPage - 1) * this.sermonsPerPage;
        const end = start + this.sermonsPerPage;
        const pageSermons = sermonsToShow.slice(start, end);

        pageSermons.forEach(sermon => {
            const sermonCard = document.createElement('div');
            sermonCard.className = 'sermon-card';
            sermonCard.innerHTML = `
                <img src="${sermon.thumbnail}" alt="${sermon.title}" class="sermon-thumbnail">
                <div class="sermon-content">
                    <div class="sermon-meta">
                        <span>${sermon.date}</span>
                        <span>${sermon.speaker}</span>
                    </div>
                    <h3 class="sermon-title">${sermon.title}</h3>
                    <p>${sermon.description}</p>
                    <div class="sermon-links">
                        <a href="${sermon.videoUrl}" target="_blank">
                            <i class="fab fa-youtube"></i> Watch
                        </a>
                        <a href="${sermon.audioUrl}" download>
                            <i class="fas fa-download"></i> Download Audio
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(sermonCard);
        });

        // Update load more button visibility
        const loadMoreBtn = document.getElementById('loadMoreSermons');
        if (end >= sermonsToShow.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    filterSermons() {
        const searchTerm = document.getElementById('sermonSearch').value.toLowerCase();
        const category = document.getElementById('sermonCategory').value;

        const filtered = this.sermons.filter(sermon => {
            const matchesSearch = sermon.title.toLowerCase().includes(searchTerm) ||
                                sermon.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || sermon.category === category;
            return matchesSearch && matchesCategory;
        });

        this.currentPage = 1;
        this.renderSermons(filtered);
    }

    renderFeaturedSermon() {
        const featuredSermon = this.sermons.find(sermon => sermon.featured);
        if (featuredSermon) {
            const featuredCard = document.getElementById('featuredCard');
            featuredCard.innerHTML = `
                <div class="featured-content">
                    <img src="${featuredSermon.thumbnail}" alt="${featuredSermon.title}" class="featured-thumbnail">
                    <div class="featured-details">
                        <div class="featured-meta">
                            <span class="featured-date">${featuredSermon.date}</span>
                            <span class="featured-speaker">${featuredSermon.speaker}</span>
                            <span class="featured-category">${featuredSermon.category}</span>
                        </div>
                        <h3 class="featured-title">${featuredSermon.title}</h3>
                        <p class="featured-description">${featuredSermon.description}</p>
                        <div class="featured-links">
                            <a href="${featuredSermon.videoUrl}" target="_blank" class="cta-button">
                                <i class="fab fa-youtube"></i> Watch Now
                            </a>
                            <a href="${featuredSermon.audioUrl}" download class="cta-button secondary">
                                <i class="fas fa-download"></i> Download Audio
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderCategoryTabs() {
        const categories = ['all', ...new Set(this.sermons.map(sermon => sermon.category))];
        const tabsContainer = document.getElementById('categoryTabs');
        tabsContainer.innerHTML = categories.map(category => `
            <button class="category-tab ${category === this.currentCategory ? 'active' : ''}" data-category="${category}">
                ${category === 'all' ? 'All Sermons' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `).join('');

        // Bind tab events
        tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.updateActiveTab();
                this.filterSermons();
            });
        });
    }

    updateActiveTab() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === this.currentCategory);
        });
    }

    filterSermons() {
        const searchTerm = document.getElementById('sermonSearch').value.toLowerCase();
        const category = this.currentCategory;

        let filtered = this.sermons.filter(sermon => {
            const matchesSearch = sermon.title.toLowerCase().includes(searchTerm) ||
                                sermon.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || sermon.category === category;
            return matchesSearch && matchesCategory;
        });

        // Apply sorting
        filtered = this.sortSermons(filtered);

        this.currentPage = 1;
        this.renderSermons(filtered);
    }

    sortSermons(sermons) {
        return sermons.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    initializeLiveStream() {
        // Simulate checking live stream status
        setTimeout(() => {
            const statusIndicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            const isLive = Math.random() > 0.5; // Random for demo

            if (isLive) {
                statusIndicator.classList.add('live');
                statusText.textContent = 'Live Now';
            } else {
                statusIndicator.classList.add('offline');
                statusText.textContent = 'Next Service: Sunday 10:00 AM';
            }
        }, 2000);
    }

    bindEvents() {
        document.getElementById('sermonSearch').addEventListener('input', () => this.filterSermons());
        document.getElementById('sermonCategory').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.updateActiveTab();
            this.filterSermons();
        });
        document.getElementById('sermonSort').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.filterSermons();
        });
        document.getElementById('loadMoreSermons').addEventListener('click', () => {
            this.currentPage++;
            this.filterSermons();
        });

        // Live stream events
        document.getElementById('watchLiveBtn').addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to stream player
            document.getElementById('streamPlayer').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('setReminderBtn').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Reminder set for next service!');
        });
    }
}

// Initialize sermon archive when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SermonArchive();
});