// Mobile Navigation Toggle
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
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
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
(function() {
    emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
    
    // Set reCAPTCHA site key dynamically
    const recaptchaElement = document.getElementById('recaptcha');
    if (recaptchaElement) {
        recaptchaElement.setAttribute('data-sitekey', CONFIG.RECAPTCHA.SITE_KEY);
    }
})();

// Contact form handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
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
    
    // reCAPTCHA validation
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        showNotification('Please complete the reCAPTCHA verification', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Prepare email parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_name: 'Rahul Sharma'
    };
    
    // Send email using EmailJS
    emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            grecaptcha.reset(); // Reset reCAPTCHA
        }, function(error) {
            console.log('FAILED...', error);
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        })
        .finally(function() {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
});

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

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        typeWriter(heroTitle, originalText, 50);
    }
});

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
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.transition = 'transform 0.2s ease';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Enhanced 3D tilt effect for project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
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
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translate3d(0, 0, 0)';
        this.style.transition = 'transform 0.5s ease';
    });
});

// Mouse parallax for hero section
document.addEventListener('mousemove', function(e) {
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
    category.addEventListener('mousemove', function(e) {
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
    
    category.addEventListener('mouseleave', function() {
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
            const target = parseInt(counter.textContent);
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    ">
        <div style="
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
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

// Add CSS for active navigation link
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #2563eb !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);
