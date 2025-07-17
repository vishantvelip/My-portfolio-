// API base URLs
const API_BASE_A = 'https://datamanager-8bkl.onrender.com/';
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
  const item = { value: value, expiry: Date.now() + ttl };
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
    localStorage.removeItem(key);
    return null;
  }
}
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
        if (url === endpoints[endpoints.length - 1] && attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  throw lastError || new Error('All fetch attempts failed');
}
function extractTechnologies(description) {
  if (!description) return ['Frontend', 'Backend'];
  const techs = Object.keys(SKILL_ICONS);
  const regex = new RegExp(techs.join('|'), 'gi');
  const matches = description.match(regex) || ['Frontend', 'Backend'];
  return [...new Set(matches.map(tech => tech.charAt(0).toUpperCase() + tech.slice(1).toLowerCase()))];
}
