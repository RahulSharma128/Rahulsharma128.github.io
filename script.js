// Mobile Navigation Toggle.
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .project-card, .skill-category, .timeline-item').forEach(el => {
    observer.observe(el);
});

// Initialize EmailJS and reCAPTCHA
(function () {
    if (typeof emailjs !== 'undefined' && window.CONFIG && window.CONFIG.EMAILJS && window.CONFIG.EMAILJS.PUBLIC_KEY) {
        emailjs.init(window.CONFIG.EMAILJS.PUBLIC_KEY);
    }

    // Ensure reCAPTCHA site key is set
    const recaptchaElement = document.getElementById('recaptcha');
    if (recaptchaElement && window.CONFIG && window.CONFIG.RECAPTCHA && window.CONFIG.RECAPTCHA.SITE_KEY) {
        recaptchaElement.setAttribute('data-sitekey', window.CONFIG.RECAPTCHA.SITE_KEY);
    }
})();

// Global reCAPTCHA Modal Callbacks
window.onCaptchaVerified = function (responseToken) {
    if (responseToken) {
        setTimeout(() => {
            closeCaptchaModal();
            sendContactFormEmail();
        }, 400);
    }
};

window.onCaptchaExpired = function () {
    showNotification('reCAPTCHA verification expired. Please verify again.', 'error');
};

function openCaptchaModal() {
    const modal = document.getElementById('captchaModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeCaptchaModal() {
    const modal = document.getElementById('captchaModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Dynamic Years of Experience Calculation (Starting May 2024)
function updateDynamicExperience() {
    const startDate = new Date(2024, 4, 1); // May 2024
    const currentDate = new Date();
    
    // Total months difference
    const totalMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
    
    // Convert to years (minimum 1)
    let years = Math.floor(totalMonths / 12);
    if (years < 1) years = 1;
    
    const formattedYears = `${years}+`;
    
    const expText = document.getElementById('years-of-experience-text');
    if (expText) {
        expText.textContent = formattedYears;
    }
    
    const expStat = document.getElementById('years-of-experience-stat');
    if (expStat) {
        expStat.setAttribute('data-target', years);
        expStat.textContent = formattedYears;
    }
}

// Setup event listeners for captcha modal and experience calculation
document.addEventListener('DOMContentLoaded', () => {
    updateDynamicExperience();

    const closeBtn = document.getElementById('closeCaptchaModal');
    const overlay = document.getElementById('captchaModalOverlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCaptchaModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeCaptchaModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCaptchaModal();
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

function sendContactFormEmail() {
    if (!contactForm) return;

    const formData = new FormData(contactForm);
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const subject = (formData.get('subject') || '').trim();
    const message = (formData.get('message') || '').trim();

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : 'Send Message <i class="fas fa-paper-plane"></i>';
    if (submitBtn) {
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
    }

    const templateParams = {
        from_name: name,
        from_email: email,
        reply_to: email,
        user_email: email,
        subject: subject,
        message: message,
        to_name: 'Rahul Sharma'
    };

    if (typeof emailjs === 'undefined') {
        showNotification('EmailJS service is not loaded properly. Please refresh the page.', 'error');
        if (submitBtn) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
        return;
    }

    // Send email using EmailJS
    emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, templateParams)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                try {
                    grecaptcha.reset();
                } catch (err) {
                    console.warn('reCAPTCHA reset warning:', err);
                }
            }
        }, function (error) {
            console.error('EmailJS FAILED:', error);
            let errorMsg = 'Sorry, there was an error sending your message.';
            if (error && error.text) {
                if (error.text.includes('Invalid grant') || error.text.includes('Gmail_API')) {
                    errorMsg = 'Gmail account disconnected in EmailJS. Please log into dashboard.emailjs.com and reconnect your Gmail service.';
                } else {
                    errorMsg += ' (' + error.text + ')';
                }
            }
            showNotification(errorMsg, 'error');
        })
        .finally(function () {
            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });
}

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const subject = (formData.get('subject') || '').trim();
        const message = (formData.get('message') || '').trim();

        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Check if reCAPTCHA is already completed
        let recaptchaResponse = null;
        if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.getResponse === 'function') {
            try {
                recaptchaResponse = grecaptcha.getResponse();
            } catch (err) {
                console.warn('reCAPTCHA check warning:', err);
            }
        }

        if (recaptchaResponse) {
            // Already solved, send message directly
            sendContactFormEmail();
        } else {
            // Open security check captcha modal
            openCaptchaModal();
        }
    });
}

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Particles.js Initialization (High Visibility Full Page)
if (typeof particlesJS !== 'undefined') {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    particlesJS('particles-js', {
        particles: {
            number: { value: 95, density: { enable: true, value_area: 850 } },
            color: { value: isDark ? ['#00f2fe', '#7f5af0', '#4facfe'] : ['#1d4ed8', '#3b82f6', '#0284c7'] },
            shape: { type: 'circle' },
            opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false } },
            size: { value: 3.5, random: true, anim: { enable: true, speed: 2, size_min: 1, sync: false } },
            line_linked: {
                enable: true,
                distance: 140,
                color: isDark ? '#00f2fe' : '#2563eb',
                opacity: isDark ? 0.3 : 0.35,
                width: 1.2
            },
            move: {
                enable: true,
                speed: 1.8,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'window',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            },
            modes: {
                grab: { distance: 180, line_linked: { opacity: 0.5 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}

// Enhanced Parallax System
class ParallaxController {
    constructor() {
        this.elements = [];
        this.isScrolling = false;
        this.ticking = false;
        this.mobileThreshold = 768;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.updateParallax();
    }

    bindElements() {
        // Hero parallax elements
        const heroElements = [
            { selector: '.parallax-bg-1', speed: 0.5 },
            { selector: '.parallax-bg-2', speed: 0.8 },
            { selector: '.parallax-bg-3', speed: 0.3 },
            { selector: '.hero::before', speed: 0.6 }
        ];

        // Section background parallax
        const sectionElements = [
            { selector: '.about::before', speed: 0.4 },
            { selector: '.experience::before', speed: 0.3 },
            { selector: '.contact::before', speed: 0.5 }
        ];

        // Floating elements
        const floatingElements = [
            { selector: '.hero-avatar', speed: 0.2, type: 'translateY' },
            { selector: '.project-card', speed: 0.1, type: 'translateY' },
            { selector: '.skill-category', speed: 0.15, type: 'translateY' },
            { selector: '.timeline-item', speed: 0.08, type: 'translateX' }
        ];

        // Combine all elements
        const allElements = [...heroElements, ...sectionElements, ...floatingElements];

        allElements.forEach(config => {
            const elements = document.querySelectorAll(config.selector);
            elements.forEach(element => {
                this.elements.push({
                    element: element,
                    speed: config.speed,
                    type: config.type || 'translateY',
                    offset: element.getBoundingClientRect().top + window.pageYOffset
                });
            });
        });
    }

    bindEvents() {
        // Use passive event listener for better performance
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateParallax();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    handleResize() {
        // Update offsets on resize
        this.elements.forEach(config => {
            config.offset = config.element.getBoundingClientRect().top + window.pageYOffset;
        });
    }

    updateParallax() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const isMobile = window.innerWidth <= this.mobileThreshold;

        // Disable parallax on mobile for performance
        if (isMobile) {
            this.elements.forEach(config => {
                config.element.style.transform = 'translate3d(0, 0, 0)';
            });
            return;
        }

        this.elements.forEach(config => {
            const element = config.element;
            const speed = config.speed;
            const type = config.type;
            const elementTop = config.offset;
            const elementHeight = element.offsetHeight;

            // Calculate if element is in viewport
            const elementBottom = elementTop + elementHeight;
            const viewportTop = scrollTop;
            const viewportBottom = scrollTop + windowHeight;

            // Only animate if element is in or near viewport
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                let transform = '';

                switch (type) {
                    case 'translateX':
                        const xOffset = (scrollTop - elementTop) * speed;
                        transform = `translate3d(${xOffset}px, 0, 0)`;
                        break;
                    case 'translateY':
                    default:
                        const yOffset = (scrollTop - elementTop) * speed;
                        transform = `translate3d(0, ${yOffset}px, 0)`;
                        break;
                }

                // Apply transform with hardware acceleration
                element.style.transform = transform;
                element.style.willChange = 'transform';
            }
        });
    }
}

// Initialize parallax system
const parallaxController = new ParallaxController();

// Skill tags animation on hover
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.1)';
        this.style.transition = 'transform 0.2s ease';
    });

    tag.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
    });
});

// Enhanced 3D tilt effect for project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        // Add parallax movement
        const parallaxX = (x - centerX) / 20;
        const parallaxY = (y - centerY) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${parallaxX}px, ${parallaxY}px, 10px)`;
        this.style.transition = 'none';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translate3d(0, 0, 0)';
        this.style.transition = 'transform 0.5s ease';
    });
});

// Mouse parallax for hero section
document.addEventListener('mousemove', function (e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Apply subtle parallax to hero elements
    const heroAvatar = document.querySelector('.hero-avatar');
    if (heroAvatar) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        heroAvatar.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }

    // Apply parallax to background elements
    const parallaxBgs = document.querySelectorAll('.parallax-bg-1, .parallax-bg-2, .parallax-bg-3');
    parallaxBgs.forEach((bg, index) => {
        const speed = (index + 1) * 0.5;
        const moveX = (mouseX - 0.5) * speed * 10;
        const moveY = (mouseY - 0.5) * speed * 10;
        bg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
});

// Enhanced skill category hover with parallax
document.querySelectorAll('.skill-category').forEach(category => {
    category.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
        this.style.transition = 'none';
    });

    category.addEventListener('mouseleave', function () {
        this.style.transform = 'perspective(500px) rotateX(0) rotateY(0) translateZ(0)';
        this.style.transition = 'transform 0.3s ease';
    });
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    updateCounter();
}

// Animate counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target.querySelector('h3');
            const target = parseInt(counter.getAttribute('data-target') || counter.textContent);
            animateCounter(counter, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    counterObserver.observe(stat);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Preloader
const preloader = document.createElement('div');
preloader.innerHTML = `
    <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #060611;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    ">
        <div style="
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0, 242, 254, 0.2);
            border-top: 3px solid #00f2fe;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
`;

document.body.appendChild(preloader);

window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }, 1000);
});

// Add active class to current section in navigation
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Theme Toggle & System Device Theme Preference Logic
(function initThemeSystem() {
    function getSystemTheme() {
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    function getActiveTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || getSystemTheme();
    }

    function updateToggleUI(theme) {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
                themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                icon.className = 'fas fa-moon';
                themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
                themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
    }

    function updateParticlesForTheme(theme) {
        if (typeof particlesJS !== 'undefined' && window.pJSDom && window.pJSDom[0]) {
            try {
                const pJS = window.pJSDom[0].pJS;
                if (theme === 'dark') {
                    pJS.particles.color.value = ['#00f2fe', '#7f5af0', '#4facfe'];
                    pJS.particles.line_linked.color = '#00f2fe';
                    pJS.particles.line_linked.opacity = 0.15;
                } else {
                    pJS.particles.color.value = ['#2563eb', '#6366f1', '#0284c7'];
                    pJS.particles.line_linked.color = '#2563eb';
                    pJS.particles.line_linked.opacity = 0.25;
                }
                pJS.fn.particlesRefresh();
            } catch (e) {
                // Particles loading or refreshing
            }
        }
    }

    function applyTheme(theme, saveUserPreference = false) {
        document.documentElement.setAttribute('data-theme', theme);
        updateToggleUI(theme);
        if (saveUserPreference) {
            localStorage.setItem('theme', theme);
        }
        updateParticlesForTheme(theme);
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        const currentTheme = getActiveTheme();
        applyTheme(currentTheme, false);

        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const activeTheme = document.documentElement.getAttribute('data-theme') || getActiveTheme();
                const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

                themeToggleBtn.classList.add('theme-toggle-spin');
                setTimeout(() => {
                    themeToggleBtn.classList.remove('theme-toggle-spin');
                }, 500);

                applyTheme(newTheme, true);
            });
        }

        // Listen for device theme changes if user hasn't set a manual preference
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleDeviceThemeChange = (e) => {
                if (!localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    applyTheme(newTheme, false);
                }
            };
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleDeviceThemeChange);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleDeviceThemeChange);
            }
        }
    });

    window.addEventListener('load', () => {
        const currentTheme = getActiveTheme();
        updateParticlesForTheme(currentTheme);
    });
})();

// SPA Single Page View Router Handler
function navigateToView(viewId, event) {
    if (event) event.preventDefault();

    const heroSection = document.getElementById('home');
    const appViewContainer = document.getElementById('app-view-container');
    const breadcrumbLabel = document.getElementById('breadcrumbCurrentLabel');
    const viewTabs = document.querySelectorAll('.view-tab-btn');
    const sections = document.querySelectorAll('.view-section-page');

    if (!viewId || viewId === 'home') {
        // Show Clean Hero Home
        if (appViewContainer) {
            appViewContainer.classList.remove('active-view');
            setTimeout(() => {
                appViewContainer.style.display = 'none';
            }, 300);
        }
        if (heroSection) {
            heroSection.style.display = 'flex';
            setTimeout(() => {
                heroSection.style.opacity = '1';
            }, 50);
        }
        history.pushState(null, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Hide Hero, Show Section View Container
    if (heroSection) {
        heroSection.style.opacity = '0';
        setTimeout(() => {
            heroSection.style.display = 'none';
        }, 300);
    }

    if (appViewContainer) {
        appViewContainer.style.display = 'block';
        setTimeout(() => {
            appViewContainer.classList.add('active-view');
        }, 50);
    }

    // Show specified section, hide others
    sections.forEach(sec => {
        if (sec.id === viewId) {
            sec.classList.add('active-section');
        } else {
            sec.classList.remove('active-section');
        }
    });

    // Update Breadcrumb Label
    if (breadcrumbLabel) {
        const labels = {
            'about': 'Overview & Education',
            'skills': 'Skills & Technologies',
            'experience': 'Work Experience',
            'projects': 'Featured Projects',
            'contact': 'Get In Touch'
        };
        breadcrumbLabel.innerText = labels[viewId] || (viewId.charAt(0).toUpperCase() + viewId.slice(1));
    }

    // Update Active Tab Highlight
    viewTabs.forEach(tab => {
        if (tab.getAttribute('data-target') === viewId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update URL hash smoothly
    history.pushState(null, '', `#${viewId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global AI Search Bar Handler (Stitch Screen 2)
function handleAISearch(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('aiInput');
    const toast = document.getElementById('aiToast');
    if (!input || !toast) return;

    const q = input.value.trim().toLowerCase();
    if (!q) return;

    let reply = "Rahul is a Full-Stack Engineer skilled in React, Node.js, MERN, microservices, and cloud solutions!";
    let targetView = null;

    if (q.includes('skill') || q.includes('tech') || q.includes('stack')) {
        reply = "Rahul's stack: MERN (MongoDB, Express, React, Node), TypeScript, Next.js, AWS, Docker, Microservices.";
        targetView = 'skills';
    } else if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('app')) {
        reply = "Featured projects: Drone Fleet GCS, PathSynq PWA Pothole Detector, Admin & Partner Dashboards.";
        targetView = 'projects';
    } else if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('reach')) {
        reply = "Get in touch with Rahul: shrahul520@gmail.com | +91-8955102520.";
        targetView = 'contact';
    } else if (q.includes('experience') || q.includes('job') || q.includes('company') || q.includes('role')) {
        reply = "Rahul has worked at JPloft, Emvirt Solutions, and Smartgenx / Volyo Solutions as a Full-Stack Engineer.";
        targetView = 'experience';
    } else if (q.includes('about') || q.includes('who') || q.includes('education') || q.includes('college')) {
        reply = "Rahul Sharma — CS Engineering graduate (JECRC College, CGPA 7.94) with 2+ years full-stack experience.";
        targetView = 'about';
    }

    toast.innerText = reply;
    toast.style.display = 'block';

    if (targetView) {
        setTimeout(() => {
            navigateToView(targetView);
        }, 1200);
    }

    setTimeout(() => {
        toast.style.display = 'none';
    }, 6000);
}

// Initial Hash and Popstate Routing Listeners
window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['about', 'skills', 'experience', 'projects', 'contact'].includes(hash)) {
        navigateToView(hash);
    }
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['about', 'skills', 'experience', 'projects', 'contact'].includes(hash)) {
        navigateToView(hash);
    } else {
        navigateToView('home');
    }
});


