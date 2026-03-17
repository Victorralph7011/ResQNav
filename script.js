// ==================== SCROLL REVEAL ANIMATIONS ====================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
        '.bento-card, .flow-step, .section-label, .section-heading, .map-dashboard, .smart-city-content'
    ).forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ==================== NAVBAR SCROLL BEHAVIOR ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.style.background = 'rgba(10, 10, 10, 0.92)';
            navbar.style.borderBottomColor = 'rgba(255,255,255,0.06)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.7)';
            navbar.style.borderBottomColor = 'rgba(255,255,255,0.08)';
        }
    });
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.getElementById('navbar')?.offsetHeight || 56;
                const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

// ==================== SIDEBAR LINK INTERACTION ====================
function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navActions = document.getElementById('nav-actions');

    if (!btn) return;

    btn.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '56px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.flexDirection = 'column';
        navLinks.style.padding = '16px 24px';
        navLinks.style.background = 'rgba(10,10,10,0.95)';
        navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        navLinks.style.gap = '12px';
        navLinks.style.transform = 'none';

        if (navActions) {
            navActions.style.display = isOpen ? 'none' : 'flex';
            navActions.style.position = 'absolute';
            navActions.style.top = navLinks.scrollHeight + 56 + 'px';
            navActions.style.left = '0';
            navActions.style.right = '0';
            navActions.style.padding = '16px 24px';
            navActions.style.background = 'rgba(10,10,10,0.95)';
            navActions.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        }
    });
}

// ==================== HERO BADGE TYPING EFFECT ====================
function initBadgeGlow() {
    const badge = document.querySelector('.hero-badge');
    if (!badge) return;

    setInterval(() => {
        badge.style.borderColor = 'rgba(129, 140, 248, 0.4)';
        badge.style.boxShadow = '0 0 20px rgba(129, 140, 248, 0.1)';
        setTimeout(() => {
            badge.style.borderColor = 'rgba(129, 140, 248, 0.2)';
            badge.style.boxShadow = 'none';
        }, 1200);
    }, 3000);
}

// ==================== BENTO CARD HOVER GLOW ====================
function initBentoGlow() {
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(129,140,248,0.04), #111111 80%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = '#111111';
        });
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavbar();
    initSmoothScroll();
    initSidebar();
    initMobileMenu();
    initBadgeGlow();
    initBentoGlow();
});
