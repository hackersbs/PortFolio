/* ============================================
   PORTFOLIO WEBSITE - JAVASCRIPT
   Author: Sangeerth BS
   Version: 1.0
   Purpose: Handle interactivity and functionality
   ============================================ */

'use strict';

/**
 * Initialize the portfolio website
 * Runs when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollAnimations();
    initNavbarScroll();
    init3DMouse();
    initCardHoverEffects();
    initParallaxEffect();
});

/* ============================================
   NAVIGATION FUNCTIONS
   ============================================ */

/**
 * Initialize smooth scrolling for navigation links
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only handle internal anchor links
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                smoothScrollToSection(href);
            }
        });
    });
}

/**
 * Smooth scroll to a section
 * @param {string} selector - CSS selector of the target element
 */
function smoothScrollToSection(selector) {
    const target = document.querySelector(selector);

    if (target) {
        const headerOffset = 80; // Account for fixed navbar
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */

/**
 * Initialize scroll-triggered animations
 * Using Intersection Observer API for better performance
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
        '.skill-card, .requirement-card, .experience-item, .project-card'
    );

    animatableElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Animate an element when it comes into view
 * @param {Element} element - The element to animate
 */
function animateElement(element) {
    element.style.animation = 'fadeInUp 0.8s ease-out forwards';
}

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */

/**
 * Update navbar background opacity on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    if (!navbar) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(30, 30, 30, 0.98)';
        } else {
            navbar.style.background = 'rgba(30, 30, 30, 0.95)';
        }
    });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Get all elements by class name
 * @param {string} className - The class name to search for
 * @returns {NodeList} List of elements with the given class
 */
function getElementsByClass(className) {
    return document.querySelectorAll(`.${className}`);
}

/**
 * Add class to multiple elements
 * @param {NodeList} elements - Elements to add class to
 * @param {string} className - Class name to add
 */
function addClassToElements(elements, className) {
    elements.forEach(element => {
        element.classList.add(className);
    });
}

/**
 * Remove class from multiple elements
 * @param {NodeList} elements - Elements to remove class from
 * @param {string} className - Class name to remove
 */
function removeClassFromElements(elements, className) {
    elements.forEach(element => {
        element.classList.remove(className);
    });
}

/**
 * Toggle class on multiple elements
 * @param {NodeList} elements - Elements to toggle class on
 * @param {string} className - Class name to toggle
 */
function toggleClassOnElements(elements, className) {
    elements.forEach(element => {
        element.classList.toggle(className);
    });
}

/* ============================================
   3D MOUSE TRACKING EFFECTS
   ============================================ */

/**
 * Initialize 3D mouse tracking for interactive elements
 */
function init3DMouse() {
    const cards = document.querySelectorAll('.skill-card, .project-card, .requirement-card, .stat-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            handleCardMouseMove(e, this);
        });

        card.addEventListener('mouseleave', function () {
            handleCardMouseLeave(this);
        });
    });
}

/**
 * Handle mouse move on cards for 3D tilt effect
 * @param {Event} e - Mouse event
 * @param {Element} card - Card element
 */
function handleCardMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = (mouseY - centerY) / 10;
    const rotateY = (centerX - mouseX) / 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
}

/**
 * Reset card position when mouse leaves
 * @param {Element} card - Card element
 */
function handleCardMouseLeave(card) {
    card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
}

/* ============================================
   ENHANCED CARD HOVER EFFECTS
   ============================================ */

/**
 * Initialize enhanced hover effects for all cards
 */
function initCardHoverEffects() {
    const allCards = document.querySelectorAll('.skill-card, .project-card, .requirement-card');

    allCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;

        // Add hover class animation
        card.addEventListener('mouseenter', function () {
            this.classList.add('hover-active');
            createRippleEffect(this);
        });

        card.addEventListener('mouseleave', function () {
            this.classList.remove('hover-active');
        });
    });
}

/**
 * Create ripple effect on card hover
 * @param {Element} element - Element to apply ripple
 */
function createRippleEffect(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');

    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(102, 126, 234, 0.5)';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

/* ============================================
   PARALLAX EFFECT
   ============================================ */

/**
 * Initialize parallax scrolling effect
 */
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        parallaxElements.forEach(element => {
            const scrollPosition = window.scrollY;
            const elementPosition = element.offsetTop;
            const distance = elementPosition - scrollPosition;

            if (distance > -window.innerHeight && distance < window.innerHeight) {
                const offset = (scrollPosition - elementPosition) * 0.5;
                element.style.backgroundPosition = `0px ${offset}px`;
            }
        });
    });
}

/* ============================================
   OPTIONAL: BACKEND INTEGRATION
   ============================================ */

/**
 * Send form data to backend
 * Uncomment and configure as needed
 * @param {Object} formData - The form data to send
 */
/*
function sendFormToBackend(formData) {
    const backendUrl = 'https://your-api-endpoint.com/contact';

    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showAlert('Message sent successfully!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Failed to send message. Please try again.', 'error');
    });
}
*/

/* ============================================
   CONSOLE MESSAGES
   ============================================ */

// Display developer info in console
console.log('%cPortfolio Website', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cAuthor: Sangeerth BS - Python Full Stack Developer', 'color: #764ba2; font-size: 14px;');
console.log('%cVersion: 1.0', 'color: #667eea; font-size: 12px;');
console.log('%cCode Quality: Professional | Optimized | Production-Ready', 'color: #28a745; font-size: 12px; font-weight: bold;');
