// Display error messages
function renderError(container, message, retryFn) {
  container.innerHTML = `
    <div class="error">
      <p>${message}</p>
      ${retryFn ? `<button onclick="window.${retryFn}()">Retry</button>` : ''}
    </div>
  `;
  container.style.display = 'block';
}

// Fade-in animation for elements
const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

function observeFadeIn(selector) {
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// Toggle dark mode
function setDarkMode(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  const toggle = document.getElementById('darkModeToggle');
  toggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
  toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  localStorage.setItem('darkMode', isDark);
}

// Initialize UI interactions
function initUI() {
  // Dark mode toggle
  setDarkMode(localStorage.getItem('darkMode') === 'true');
  document.getElementById('darkModeToggle').addEventListener('click', () => setDarkMode(!document.body.classList.contains('dark-mode')));

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });

  // Smooth scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(anchor.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-menu').classList.remove('active');
      document.getElementById('mobile-menu').classList.remove('open').setAttribute('aria-expanded', 'false');
    });
  });

  // Mobile menu toggle
  document.getElementById('mobile-menu').addEventListener('click', () => {
    const menu = document.getElementById('nav-menu');
    const toggle = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
  });

  // Contact form submission
  document.getElementById('contact-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const success = await window.sendEmail(name, email, message);
    if (success) {
      document.getElementById('contact-form').reset();
      setTimeout(() => {
        document.getElementById('form-message').style.display = 'none';
      }, 5000); // Hide success message after 5 seconds
    }
  });

  // Typing effect for subtitle
  const subtitle = document.querySelector('.hero .subtitle');
  if (subtitle) {
    let i = 0;
    const text = subtitle.textContent;
    subtitle.textContent = '';
    const type = () => {
      if (i < text.length) {
        subtitle.textContent += text[i++];
        setTimeout(type, 150);
      }
    };
    type();
  }

  // Hero video parallax
  window.addEventListener('scroll', () => {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) heroVideo.style.transform = `translateY(${window.pageYOffset * -0.5}px)`;
  });

  // CTA button ripple effect
  document.querySelector('.cta-button')?.addEventListener('click', e => {
    const ripple = document.createElement('span');
    const rect = e.target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    Object.assign(ripple.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top: `${e.clientY - rect.top - size / 2}px`,
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(0)',
      animation: 'ripple 0.6s linear'
    });
    e.target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Skill card hover effect
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.skill-card');
    if (card) card.style.transform = 'translateY(-10px) scale(1.02)';
  });
  document.addEventListener('mouseout', e => {
    const card = e.target.closest('.skill-card');
    if (card) card.style.transform = 'translateY(0) scale(1)';
  });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.loadAbout();
  window.loadSkills();
  window.loadProjects();
  initUI();
  observeFadeIn('.fade-in');
});