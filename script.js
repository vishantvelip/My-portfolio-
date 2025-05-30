// Smooth scrolling for nav links
        document.querySelectorAll('.nav-links a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
                document.querySelector('.nav-links').classList.remove('active');
            });
        });

        // Theme toggle
        const themeBtn = document.getElementById('theme-btn');
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });

        // Mobile menu toggle
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });

        // Particles.js configuration
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#48cae4' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#48cae4', opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: 'none', random: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
                modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });
