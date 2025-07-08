// Fade-in
function observeFadeIn(selector) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}
function renderError(container, message, origin) {
  container.innerHTML = `<p class="fade-in">${message}</p>`;
  observeFadeIn('.fade-in');
  if (window.console)
    console.error(`[${origin}] ${message}`);
}
window.observeFadeIn = observeFadeIn;
window.renderError = renderError;

// About
async function loadAbout() {
  const container = document.getElementById('about-text');
  container.innerHTML = `<div class="loader"></div>`;
  const cacheKey = 'about-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    observeFadeIn('#about-text .fade-in');
    return;
  }
  try {
    const response = await fetchWithTimeoutAndFailover('api/about/json');
    const data = await response.json();
    setCache(cacheKey, data, CACHE_TTL);
    container.innerHTML = data.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    observeFadeIn('#about-text .fade-in');
  } catch (error) {
    renderError(container, `Failed to load about content: ${error.message}`, 'loadAbout');
  }
}

// Skills
async function loadSkills() {
  const container = document.getElementById('skills-grid');
  container.innerHTML = `<div class="loader"></div>`;
  const cacheKey = 'skills-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(skill => `
      <div class="skill-card fade-in">
        <div class="skill-icon">
          ${skill.image 
            ? `<img src="${skill.image.startsWith('http') ? skill.image : `${API_BASE_A}/${skill.image}`}" alt="${skill.skillName} Icon" onerror="this.src='https://via.placeholder.com/48';">`
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
    const response = await fetchWithTimeoutAndFailover('api/skills/json');
    const skills = await response.json();
    setCache(cacheKey, skills, CACHE_TTL);
    container.innerHTML = skills.map(skill => `
      <div class="skill-card fade-in">
        <div class="skill-icon">
          ${skill.image 
            ? `<img src="${skill.image.startsWith('http') ? skill.image : `${API_BASE_A}/${skill.image}`}" alt="${skill.skillName} Icon" onerror="this.src='https://via.placeholder.com/48';">`
            : `<i class="${SKILL_ICONS[skill.skillName] || 'fas fa-code'}"></i>`}
        </div>
        <h3>${skill.skillName}</h3>
        <p>${skill.description || 'No description available.'}</p>
      </div>
    `).join('');
    observeFadeIn('.skill-card.fade-in');
  } catch (error) {
    renderError(container, `Failed to load skills: ${error.message}`, 'loadSkills');
  }
}

// Projects
async function loadProjects() {
  const container = document.getElementById('projects-grid');
  container.innerHTML = `<div class="loader"></div>`;
  const cacheKey = 'projects-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(project => `
      <div class="project-card fade-in">
        <div class="project-image">
          <img src="${project.projectImg.startsWith('http') ? project.projectImg : `${API_BASE_A}${project.projectImg}`}" alt="${project.title} Image" onerror="this.src='https://via.placeholder.com/350x200';">
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
    const response = await fetchWithTimeoutAndFailover('api/projects/json');
    const projects = await response.json();
    setCache(cacheKey, projects, CACHE_TTL);
    container.innerHTML = projects.map(project => `
      <div class="project-card fade-in">
        <div class="project-image">
          <img src="${project.projectImg.startsWith('http') ? project.projectImg : `${API_BASE_A}${project.projectImg}`}" alt="${project.title} Image" onerror="this.src='https://via.placeholder.com/350x200';">
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
    renderError(container, `Failed to load projects: ${error.message}`, 'loadProjects');
  }
}

// Send email via API
async function sendEmail(name, email, message) {
  const container = document.getElementById('form-message');
  container.innerHTML = '<div class="loader"></div>';
  container.style.display = 'block';
  try {
    const response = await fetchWithTimeoutAndFailover('api/email/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    container.innerHTML = `<p class="form-message success fade-in">${data.message}</p>`;
    observeFadeIn('.form-message.success.fade-in');
    return true;
  } catch (error) {
    container.innerHTML = `<p class="form-message error fade-in">Failed to send email: ${error.message}</p>`;
    observeFadeIn('.form-message.error.fade-in');
    return false;
  }
}

// Typewriter effect
const textArray = ["Web Developer", "Frontend & Backend Developer", "UI/UX Enthusiast"];
let textIndex = 0, charIndex = 0, typing = true;
const typedText = document.getElementById("typed-text");
const cursor = document.getElementById("cursor");
function type() {
  if (typing) {
    if (charIndex < textArray[textIndex].length) {
      typedText.textContent += textArray[textIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, 80);
    } else {
      typing = false;
      setTimeout(type, 1000);
    }
  } else {
    if (charIndex > 0) {
      typedText.textContent = textArray[textIndex].substring(0, --charIndex);
      setTimeout(type, 35);
    } else {
      typing = true;
      textIndex = (textIndex + 1) % textArray.length;
      setTimeout(type, 400);
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  type();
  loadAbout();
  loadSkills();
  loadProjects();
  observeFadeIn('.fade-in');
});
setInterval(() => {
  cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
}, 520);

// Theme toggle
const themeBtn = document.getElementById('theme-toggle');
let dark = true;
themeBtn.onclick = () => {
  dark = !dark;
  if (dark) {
    document.body.style.background = "#0c1624";
    document.body.style.color = "#e6e6e6";
    themeBtn.innerHTML = '<i class="fa-regular fa-moon"></i>';
  } else {
    document.body.style.background = "#fff";
    document.body.style.color = "#1a2237";
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
};

// SPA navigation for content panels
const navLinks = document.querySelectorAll('.nav-links a[data-panel]');
const panels = document.querySelectorAll('.content-panel');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.getAttribute('data-panel');
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + target).classList.add('active');
    // Lazy load each section if needed
    if (target === 'about') loadAbout();
    if (target === 'skills') loadSkills();
    if (target === 'projects') loadProjects();
  });
});
document.getElementById('panel-home').classList.add('active');

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const success = await sendEmail(name, email, message);
    if (success) {
      contactForm.reset();
    }
  });
}
