// Constants
const API_BASE = 'https://database-managemet-api.vercel.app';
const SKILL_ICONS = {
  'Html': 'fab fa-html5',
  'CSS': 'fab fa-css3-alt',
  'JavaScript': 'fab fa-js-square',
  'Node.js': 'fab fa-node-js',
  'MongoDB': 'fas fa-database',
  'Express.js': 'fas fa-server',
  'Docker': 'fab fa-docker',
  'React': 'fab fa-react',
  'GraphQL': 'fas fa-project-diagram',
  'SQL': 'fas fa-database'
};
const CACHE_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

// Cache Utilities
function setCache(key, value, ttl) {
  const now = Date.now();
  const item = {
    value: value,
    expiry: now + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getCache(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    localStorage.removeItem(key); // corrupt
    return null;
  }
}

// Utility: Fetch with Timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Utility: Render Error
function renderError(container, message, retryFn) {
  container.innerHTML = `
    <div class="error">
      <p>${message}</p>
      ${retryFn ? `<button onclick="${retryFn.name}()">Retry</button>` : ''}
    </div>
  `;
}

// Intersection Observer for Fade-in
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

// Load About Content (with cache)
async function loadAbout() {
  const container = document.getElementById('about-text');
  container.innerHTML = '<div class="loading">Loading about content...</div>';
  const cacheKey = 'about-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    observeFadeIn('#about-text .fade-in');
    return;
  }
  try {
    const response = await fetchWithTimeout(`${API_BASE}/about/json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setCache(cacheKey, data, CACHE_TTL);
    container.innerHTML = data.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    observeFadeIn('#about-text .fade-in');
  } catch (error) {
    renderError(container, `Failed to load about content: ${error.message}`, loadAbout);
  }
}

// Load Skills (with cache)
async function loadSkills() {
  const container = document.getElementById('skills-grid');
  container.innerHTML = '<div class="loading">Loading skills...</div>';
  const cacheKey = 'skills-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(skill => `
      <div class="skill-card fade-in">
        <div class="skill-icon">
          ${skill.image 
            ? `<img src="${API_BASE}/${skill.image}" alt="${skill.skillName} Icon" onerror="this.src='https://via.placeholder.com/48';">`
            : `<i class="${SKILL_ICONS[skill.skillName] || 'fas fa-code'}"></i>`}
        </div>
        <h3>${skill.skillName}</h3>
        <p>${skill.description || 'No description available.'}</p>
      </div>
    `).join('');
    observeFadeIn('.skill-card.fade-in');
    return;
  }
  try {
    const response = await fetchWithTimeout(`${API_BASE}/skills/json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const skills = await response.json();
    setCache(cacheKey, skills, CACHE_TTL);
    container.innerHTML = skills.map(skill => `
      <div class="skill-card fade-in">
        <div class="skill-icon">
          ${skill.image 
            ? `<img src="${API_BASE}/${skill.image}" alt="${skill.skillName} Icon" onerror="this.src='https://via.placeholder.com/48';">`
            : `<i class="${SKILL_ICONS[skill.skillName] || 'fas fa-code'}"></i>`}
        </div>
        <h3>${skill.skillName}</h3>
        <p>${skill.description || 'No description available.'}</p>
      </div>
    `).join('');
    observeFadeIn('.skill-card.fade-in');
  } catch (error) {
    renderError(container, `Failed to load skills: ${error.message}`, loadSkills);
  }
}

// Load Projects (with cache)
async function loadProjects() {
  const container = document.getElementById('projects-grid');
  container.innerHTML = '<div class="loading">Loading projects...</div>';
  const cacheKey = 'projects-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(project => `
      <div class="project-card fade-in">
        <div class="project-image">
          <img src="${project.projectImg || 'https://via.placeholder.com/350x200'}" alt="${project.title} Image" onerror="this.src='https://via.placeholder.com/350x200';">
        </div>
        <div class="project-content">
          <h3>${project.title}</h3>
          <p>${project.description || 'No description available.'}</p>
          <div class="project-tech">
            ${extractTechnologies(project.description).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-links">
            ${project.projectsUrl ? `<a href="${project.projectsUrl}" class="project-link" target="_blank">View Project</a>` : ''}
            ${project.projectCodeViewurl ? `<a href="${project.projectCodeViewurl}" class="project-link" target="_blank">View Code</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    observeFadeIn('.project-card.fade-in');
    return;
  }
  try {
    const response = await fetchWithTimeout(`${API_BASE}/projects/json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const projects = await response.json();
    setCache(cacheKey, projects, CACHE_TTL);
    container.innerHTML = projects.map(project => `
      <div class="project-card fade-in">
        <div class="project-image">
          <img src="${project.projectImg || 'https://via.placeholder.com/350x200'}" alt="${project.title} Image" onerror="this.src='https://via.placeholder.com/350x200';">
        </div>
        <div class="project-content">
          <h3>${project.title}</h3>
          <p>${project.description || 'No description available.'}</p>
          <div class="project-tech">
            ${extractTechnologies(project.description).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-links">
            ${project.projectsUrl ? `<a href="${project.projectsUrl}" class="project-link" target="_blank">View Project</a>` : ''}
            ${project.projectCodeViewurl ? `<a href="${project.projectCodeViewurl}" class="project-link" target="_blank">View Code</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    observeFadeIn('.project-card.fade-in');
  } catch (error) {
    renderError(container, `Failed to load projects: ${error.message}`, loadProjects);
  }
}

function extractTechnologies(description) {
  return (description?.match(/node\.js|express|mongodb|html-ejs/gi) || ['Frontend', 'Backend']);
}

// Dark Mode Toggle
function setDarkMode(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  const toggle = document.getElementById('darkModeToggle');
  toggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
  toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  localStorage.setItem('darkMode', isDark);
}

// UI Interactions
function initUI() {
  // Dark Mode
  setDarkMode(localStorage.getItem('darkMode') === 'true');
  document.getElementById('darkModeToggle').addEventListener('click', () => setDarkMode(!document.body.classList.contains('dark-mode')));

  // Navbar Scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(anchor.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-menu').classList.remove('active');
      document.getElementById('mobile-menu').classList.remove('open').setAttribute('aria-expanded', 'false');
    });
  });

  // Mobile Menu
  document.getElementById('mobile-menu').addEventListener('click', () => {
    const menu = document.getElementById('nav-menu');
    const toggle = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
  });

  // Contact Form
  document.getElementById('contact-form').addEventListener('submit', async e => {
    e.preventDefault();
    const formMessage = document.getElementById('form-message');
    const { name, email, message } = Object.fromEntries(new FormData(e.target));
    formMessage.style.display = 'none';

    if (!name.trim() || !email.trim() || !message.trim()) {
      formMessage.textContent = 'Please fill in all fields.';
      formMessage.className = 'form-message error';
      formMessage.style.display = 'block';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMessage.textContent = 'Please enter a valid email.';
      formMessage.className = 'form-message error';
      formMessage.style.display = 'block';
      return;
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE}/email/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const result = await response.json();
      formMessage.textContent = response.ok ? 'Message sent! I\'ll reply soon.' : result.error || 'Failed to send message.';
      formMessage.className = `form-message ${response.ok ? 'success' : 'error'}`;
      formMessage.style.display = 'block';
      if (response.ok) e.target.reset();
    } catch (error) {
      formMessage.textContent = 'Failed to send message.';
      formMessage.className = 'form-message error';
      formMessage.style.display = 'block';
    }
  });

  // Typing Effect
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

  // Hero Parallax
  window.addEventListener('scroll', () => {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) heroVideo.style.transform = `translateY(${window.pageYOffset * -0.5}px)`;
  });

  // CTA Ripple
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

  // Skill Card Hover
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.skill-card');
    if (card) card.style.transform = 'translateY(-10px) scale(1.02)';
  });
  document.addEventListener('mouseout', e => {
    const card = e.target.closest('.skill-card');
    if (card) card.style.transform = 'translateY(0) scale(1)';
  });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  loadAbout();
  loadSkills();
  loadProjects();
  initUI();
  observeFadeIn('.fade-in');
});
