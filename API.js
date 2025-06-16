// API base URLs
const API_BASE_A = 'https://database-managemet-api.onrender.com';
const API_BASE_B = 'https://database-managemet-api.vercel.app';
const SKILL_ICONS = {
  Html: 'fab fa-html5',
  CSS: 'fab fa-css3-alt',
  JavaScript: 'fab fa-js',
  'Node.js': 'fab fa-node-js',
  MongoDB: 'fas fa-database',
  'Express.js': 'fas fa-server',
  Docker: 'fab fa-docker',
  React: 'fab fa-react',
  GraphQL: 'fas fa-project-diagram',
  SQL: 'fas fa-database'
};
const CACHE_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const MAX_RETRIES = 3; // Max retry attempts

// Save data to localStorage with expiration
function setCache(key, value, ttl) {
  const item = {
    value: value,
    expiry: Date.now() + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get data from localStorage, remove if expired
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
    localStorage.removeItem(key);
    return null;
  }
}

// Fetch with timeout and failover between two APIs
async function fetchWithTimeoutAndFailover(endpoint, options = {}, timeout = 10000) {
  const endpoints = [`${API_BASE_A}/${endpoint}`, `${API_BASE_B}/${endpoint}`];
  let lastError;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`Failed to fetch ${url}: ${error.message}`);
        if (url === endpoints[endpoints.length - 1] && attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  throw lastError || new Error('All fetch attempts failed');
}

// Load about content
async function loadAbout() {
  const container = document.getElementById('about-text');
  container.innerHTML = '<div class="loading">Loading about content...</div>';
  const cacheKey = 'about-content';
  const cached = getCache(cacheKey);
  if (cached) {
    container.innerHTML = cached.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    window.observeFadeIn('#about-text .fade-in');
    return;
  }
  try {
    const response = await fetchWithTimeoutAndFailover('api/about/json');
    const data = await response.json();
    setCache(cacheKey, data, CACHE_TTL);
    container.innerHTML = data.map(item => `<p class="fade-in">${item.content}</p>`).join('');
    window.observeFadeIn('#about-text .fade-in');
  } catch (error) {
    window.renderError(container, `Failed to load about content: ${error.message}`, 'loadAbout');
  }
}

// Load skills
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
            ? `<img src="${skill.image.startsWith('http') ? skill.image : `${API_BASE_A}/${skill.image}`}" alt="${skill.skillName} Icon" onerror="this.src='https://via.placeholder.com/48';">`
            : `<i class="${SKILL_ICONS[skill.skillName] || 'fas fa-code'}"></i>`}
        </div>
        <h3>${skill.skillName}</h3>
        <p>${skill.description || 'No description available.'}</p>
      </div>
    `).join('');
    window.observeFadeIn('.skill-card.fade-in');
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
    window.observeFadeIn('.skill-card.fade-in');
  } catch (error) {
    window.renderError(container, `Failed to load skills: ${error.message}`, 'loadSkills');
  }
}

// Load projects
async function loadProjects() {
  const container = document.getElementById('projects-grid');
  container.innerHTML = '<div class="loading">Loading projects...</div>';
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
    window.observeFadeIn('.project-card.fade-in');
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
    window.observeFadeIn('.project-card.fade-in');
  } catch (error) {
    window.renderError(container, `Failed to load projects: ${error.message}`, 'loadProjects');
  }
}

// Send email via API
async function sendEmail(name, email, message) {
  const container = document.getElementById('form-message');
  container.innerHTML = '<div class="loading">Sending email...</div>';
  container.style.display = 'block';
  try {
    const response = await fetchWithTimeoutAndFailover('api/email/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    container.innerHTML = `<p class="form-message success fade-in">${data.message}</p>`;
    window.observeFadeIn('.form-message.success.fade-in');
    return true;
  } catch (error) {
    container.innerHTML = `<p class="form-message error fade-in">Failed to send email: ${error.message}</p>`;
    window.observeFadeIn('.form-message.error.fade-in');
    return false;
  }
}

// Extract technologies from description
function extractTechnologies(description) {
  if (!description) return ['Frontend', 'Backend'];
  const techs = Object.keys(SKILL_ICONS);
  const regex = new RegExp(techs.join('|'), 'gi');
  const matches = description.match(regex) || ['Frontend', 'Backend'];
  return [...new Set(matches.map(tech => tech.charAt(0).toUpperCase() + tech.slice(1).toLowerCase()))];
}