// ==================== PARTICLE EFFECT ====================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255, ${Math.floor(Math.random() * 140 + 60)}, ${Math.floor(Math.random() * 60)}, ${Math.random() * 0.4 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 4}s;
        `;
        container.appendChild(particle);
    }

    // Add float keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(${Math.random() * 40 - 20}px, -${Math.random() * 40 + 20}px) scale(1.2); opacity: 0.6; }
            50% { transform: translate(${Math.random() * 30 - 15}px, -${Math.random() * 60 + 30}px) scale(0.8); opacity: 0.4; }
            75% { transform: translate(${Math.random() * 20 - 10}px, -${Math.random() * 30 + 10}px) scale(1.1); opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe feature cards and sections
    document.querySelectorAll('.feature-card, .about-content, .contact-form, .section-header').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ==================== NAVBAR SCROLL EFFECT ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 80) {
            navbar.style.padding = '0.7rem 3rem';
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.padding = '1rem 3rem';
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }

        lastScroll = currentScroll;
    });
}

// ==================== CONTACT FORM ====================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        btn.textContent = 'Sending...';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            btn.textContent = '✓ Sent!';
            btn.style.opacity = '1';
            form.reset();

            setTimeout(() => {
                btn.textContent = 'Send Message';
            }, 2500);
        }, 1200);
    });
}

// ==================== SMOOTH SCROLL FOR NAV LINKS ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollAnimations();
    initNavbar();
    initContactForm();
    initSmoothScroll();
});
