/**
 * Romantic Experience - script.js
 * Best Practices & Production Grade Logic
 * 🌻 Para el Día de las Flores Amarillas - Enhanced Animations Edition
 */

"use strict";

(function() {
    // --- 1. CONFIGURATION ---
    const CONFIG = {
        START_DATE: new Date('2020-06-30T00:00:00'),
        SPOTIFY_URI: 'spotify:track:4yNk9iz9WVJikRFle3XEvn', // JVKE - Golden Hour
        PETAL: {
            BASE_COUNT: 48,
            MOBILE_COUNT: 28,
            FALL_DURATION: [12, 22],
            SWAY_DURATION: [3, 5]
        },
        REVEAL: {
            DUR: 1.6,
            STAGGER: 0.3,
            EASE: "expo.inOut"
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
        cards: document.querySelectorAll('.glass-card'),
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
        const isMobile = window.innerWidth < 600;
        const options = {
            width: '100%',
            height: isMobile ? '80' : '152',
            uri: CONFIG.SPOTIFY_URI
        };

        const callback = (EmbedController) => {
            STATE.spotifyController = EmbedController;
            
            EmbedController.on('playback_update', (e) => {
                const { position, duration } = e.data;
                if (position > 0 && duration > 0 && position >= duration - 500) {
                    if (!STATE.isMusicEnded) {
                        STATE.isMusicEnded = true;
                        gsap.to(DOM.spotify, { opacity: 0, duration: 2, onComplete: () => DOM.spotify.style.display = 'none' });
                    }
                }
            });
        };

        IFrameAPI.createController(document.getElementById('embed-iframe'), options, callback);
    };

    // --- 3. EXPERIENCE FLOW ---
    window.startExperienceAndMusic = () => {
        if (STATE.isStarted) return;
        STATE.isStarted = true;

        // Music Start
        if (STATE.spotifyController) {
            STATE.spotifyController.play();
            DOM.spotify.classList.remove('hidden-no-show');
            DOM.spotify.style.opacity = '1';
        }

        // Screen Transition
        gsap.to(DOM.splash, {
            opacity: 0, 
            duration: CONFIG.REVEAL.DUR, 
            ease: CONFIG.REVEAL.EASE,
            onComplete: () => {
                DOM.splash.classList.add('hidden');
                DOM.main.classList.remove('hidden');
                DOM.main.setAttribute('aria-hidden', 'false');
                
                // --- Premium Reveal Sequence ---
                const tl = gsap.timeline();

                // 1. Flower Bloom & Float
                tl.to(DOM.flowers, {
                    opacity: 1,
                    scale: 1,
                    duration: 2.5,
                    ease: "back.out(1.2)",
                    onStart: () => DOM.flowers.classList.add('visible-visual')
                });

                // Infinite Floating Animation for Flowers
                gsap.to(DOM.flowers, {
                    y: "-=15",
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                // 2. Staggered Cards Entrance
                tl.from(DOM.cards, {
                    y: 60,
                    opacity: 0,
                    duration: 1.2,
                    stagger: CONFIG.REVEAL.STAGGER,
                    ease: "power3.out"
                }, "-=1.5");

                initNature();
            }
        });
    };

    // --- 4. NATURE ENGINE (PETALS) ---
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
            x: (Math.random() > 0.5 ? 2 : -2) * (30 + Math.random() * 40),
            duration: CONFIG.PETAL.SWAY_DURATION[0] + Math.random() * (CONFIG.PETAL.SWAY_DURATION[1] - CONFIG.PETAL.SWAY_DURATION[0]),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // --- 5. TIME ENGINE (PRECISE) ---
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

    // --- 6. UI HANDLERS ---
    window.showFullPoem = () => {
        DOM.modal.classList.remove('hidden');
        DOM.modal.style.display = 'flex';
        
        // Premium Modal Entrance
        gsap.fromTo(DOM.modal, 
            { opacity: 0, backgroundColor: "rgba(0,0,0,0)" }, 
            { opacity: 1, backgroundColor: "rgba(0,0,0,0.5)", duration: 0.6 }
        );
        
        gsap.fromTo(DOM.modal.querySelector('.modal-content'), 
            { y: 50, scale: 0.9, opacity: 0 }, 
            { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
        );
    };

    function closeModal() {
        const content = DOM.modal.querySelector('.modal-content');
        gsap.to(content, { y: 30, opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" });
        gsap.to(DOM.modal, { 
            opacity: 0, 
            duration: 0.5, 
            onComplete: () => { 
                DOM.modal.classList.add('hidden'); 
                DOM.modal.style.display = 'none'; 
            }
        });
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
