// Environment Configuration
const API_TOKEN = process.env.VITE_API_TOKEN || 'your_token_here';
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

// Initialize mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-container')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Get Started button handler
function handleGetStarted() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        showNotification('Ready to start learning? Explore our features!');
    }
}

// Contact form handler with API integration
function handleContact(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    
    if (!emailInput || !messageInput) return;

    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Validation
    if (!email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Contact data
    const contactData = {
        email: email,
        message: message,
        timestamp: new Date().toISOString()
    };

    // Get submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Make API call
    fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(contactData)
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        })
        .then(data => {
            showNotification('Thank you! We\'ll get back to you soon.', 'success');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Contact form error:', error);
            showNotification('Failed to send message. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    // Determine colors based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#6366f1'
    };

    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    const bgColor = colors[type] || colors.info;

    notification.style.cssText = `
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        background-color: ${bgColor};
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-weight: 500;
        z-index: 1000;
        max-width: 90%;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Intersection Observer for fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const elementsToObserve = document.querySelectorAll('.feature-card, .about-card, .contact-form');
    elementsToObserve.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Codify loaded successfully!');
    console.log('📡 API URL:', API_URL);
    
    addAnimationStyles();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
});

// Handle window resize to close mobile menu
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});
