/**
 * Romantic Experience - script.js
 * Best Practices & Production Grade Logic
 * 🌻 Para el Día de las Flores Amarillas
 */

"use strict";

(function() {
    // --- 1. CONFIGURATION ---
    const CONFIG = {
        START_DATE: new Date('2020-06-30T00:00:00'),
        SPOTIFY_URI: 'spotify:track:4yNk9iz9WVJikRFle3XEvn', // JVKE - Golden Hour
        PETAL: {
            BASE_COUNT: 45,
            MOBILE_COUNT: 25,
            FALL_DURATION: [10, 18],
            SWAY_DURATION: [2, 4]
        },
        REVEAL_ANIM: {
            DUR: 1.5,
            EASE: "power3.inOut"
        }
    };

    const STATE = {
        isStarted: false,
        spotifyController: null,
        isMusicEnded: false
    };

    const DOM = {
        splash: document.getElementById('splash'),
        main: document.getElementById('main-container'),
        flowers: document.getElementById('main-flowers'),
        canvas: document.getElementById('petals-canvas'),
        spotify: document.getElementById('spotify-container'),
        modal: document.getElementById('poem-modal'),
        currentDate: document.getElementById('current-date-full'),
        timer: {
            years: document.getElementById('years'),
            months: document.getElementById('months'),
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        }
    };

    // --- 2. SPOTIFY LOGIC ---
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const options = {
            width: '100%',
            height: '152',
            uri: CONFIG.SPOTIFY_URI
        };

        const callback = (EmbedController) => {
            STATE.spotifyController = EmbedController;
            
            EmbedController.on('playback_update', (e) => {
                const { position, duration } = e.data;
                if (position > 0 && duration > 0 && position >= duration - 500) {
                    if (!STATE.isMusicEnded) {
                        STATE.isMusicEnded = true;
                        handleSongEnd();
                    }
                }
            });
        };

        IFrameAPI.createController(document.getElementById('embed-iframe'), options, callback);
    };

    function handleSongEnd() {
        if (!DOM.spotify) return;
        gsap.to(DOM.spotify, { opacity: 0, duration: 2, ease: "power2.inOut", onComplete: () => DOM.spotify.classList.add('hidden') });
    }

    // --- 3. EXPERIENCE FLOW ---
    window.startExperienceAndMusic = () => {
        if (STATE.isStarted) return;
        STATE.isStarted = true;

        if (STATE.spotifyController) {
            STATE.spotifyController.play();
            DOM.spotify.classList.remove('hidden-no-show');
            DOM.spotify.style.opacity = '1';
        }

        gsap.to(DOM.splash, {
            opacity: 0, 
            duration: CONFIG.REVEAL_ANIM.DUR, 
            ease: CONFIG.REVEAL_ANIM.EASE,
            onComplete: () => {
                DOM.splash.classList.add('hidden');
                DOM.main.classList.remove('hidden');
                DOM.main.setAttribute('aria-hidden', 'false');
                
                gsap.to(DOM.flowers, {
                    opacity: 1,
                    scale: 1,
                    duration: 2.5,
                    ease: "power2.out",
                    onStart: () => DOM.flowers.classList.add('visible-visual')
                });

                initNature();
            }
        });
    };

    // --- 4. ENGINE LOGIC ---
    function initNature() {
        const count = window.innerWidth < 600 ? CONFIG.PETAL.MOBILE_COUNT : CONFIG.PETAL.BASE_COUNT;
        for (let i = 0; i < count; i++) {
            spawnPetal(true);
        }
    }

    function spawnPetal(initial = false) {
        if (!STATE.isStarted) return;
        
        const petal = document.createElement('div');
        petal.className = 'petal';
        const size = 12 + Math.random() * 20;
        
        Object.assign(petal.style, {
            width: `${size}px`,
            height: `${size * 1.5}px`,
            left: `${Math.random() * 100}%`,
            top: initial ? `-${Math.random() * 100}vh` : `-50px`,
            backgroundColor: `hsl(${45 + Math.random() * 15}, 100%, 50%)`,
        });

        DOM.canvas.appendChild(petal);

        gsap.to(petal, {
            y: window.innerHeight + 150,
            rotation: Math.random() * 720,
            duration: CONFIG.PETAL.FALL_DURATION[0] + Math.random() * (CONFIG.PETAL.FALL_DURATION[1] - CONFIG.PETAL.FALL_DURATION[0]),
            ease: "none",
            onComplete: () => {
                petal.remove();
                spawnPetal();
            }
        });

        gsap.to(petal, {
            x: (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 60),
            duration: CONFIG.PETAL.SWAY_DURATION[0] + Math.random() * (CONFIG.PETAL.SWAY_DURATION[1] - CONFIG.PETAL.SWAY_DURATION[0]),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    function formatCurrentDate() {
        if (!DOM.currentDate) return;
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('es-ES', options);
        DOM.currentDate.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }

    function updateCounter() {
        const now = new Date();
        const start = CONFIG.START_DATE;
        const diff = now - start;
        
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const pad = (n) => String(n).padStart(2, '0');
        
        if (DOM.timer.years) DOM.timer.years.textContent = pad(years);
        if (DOM.timer.months) DOM.timer.months.textContent = pad(months);
        if (DOM.timer.days) DOM.timer.days.textContent = pad(days);

        if (DOM.timer.hours) DOM.timer.hours.textContent = pad(Math.floor((diff / 3600000) % 24));
        if (DOM.timer.minutes) DOM.timer.minutes.textContent = pad(Math.floor((diff / 60000) % 60));
        if (DOM.timer.seconds) DOM.timer.seconds.textContent = pad(Math.floor((diff / 1000) % 60));

        formatCurrentDate();
    }

    // --- 5. UI HANDLERS ---
    window.showFullPoem = () => {
        DOM.modal.classList.remove('hidden');
        DOM.modal.style.display = 'flex';
        gsap.fromTo(DOM.modal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    };

    function closeModal() {
        gsap.to(DOM.modal, { opacity: 0, duration: 0.3, onComplete: () => { DOM.modal.classList.add('hidden'); DOM.modal.style.display = 'none'; }});
    }

    const init = () => {
        const closer = document.querySelector('.close-modal');
        if (closer) closer.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === DOM.modal) closeModal(); });

        setInterval(updateCounter, 1000);
        updateCounter();
    };

    document.addEventListener('DOMContentLoaded', init);
})();
