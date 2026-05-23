/**
 * animations.js
 * High-craft animations and interactions using Anime.js
 * Provides fluid transitions and micro-interactions (Design Spells)
 */

window.AppAnimations = {
  /**
   * High-speed page transition — instantly switches screens, then plays entry animations non-blocking.
   */
  async pageTransition(fromScreenId, toScreenId) {
    // Guard: skip if already transitioning (rapid-click prevention)
    if (this._transitioning) return;
    this._transitioning = true;

    const fromScreen = document.getElementById(fromScreenId);
    const toScreen = document.getElementById(toScreenId);

    // Instantly switch screens — no blocking animation
    if (fromScreen) {
      fromScreen.classList.remove('active');
      fromScreen.style.opacity = '';
      fromScreen.style.transform = '';
    }

    if (toScreen) {
      toScreen.classList.add('active');
      window.scrollTo(0, 0);

      // Play entry animations non-blocking (fire & forget)
      this.playScreenAnimations(toScreenId);
    }

    this._transitioning = false;
  },

  /**
   * Route to specific screen entry animations
   */
  playScreenAnimations(screenId) {
    switch (screenId) {
      case 's1':
        this.playScreen1Animations();
        break;
      case 's2':
        this.playScreen2Animations();
        break;
      case 's3':
        this.playScreen3Animations();
        break;
      case 's4':
        this.playScreen4Animations();
        break;
      case 's5':
        this.playScreen5Animations();
        break;
      case 's6':
      case 'sx':
      case 'sy':
        this.playConfirmationAnimations(screenId);
        break;
    }
  },

  playScreen1Animations() {
    // Animate hero elements with staggered spring
    const heroTargets = ['#s1 .hero-college', '#s1 .hero-icon', '#s1 .hero-title', '#s1 .hero-badge', '#s1 .hero-tagline'];
    anime({
      targets: heroTargets,
      translateY: [40, 0],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: anime.stagger(100, { start: 100 }),
      easing: 'spring(1, 80, 10, 0)',
      duration: 1000
    });

    // Animate the welcome card
    anime({
      targets: '#s1 .welcome-card',
      translateY: [30, 0],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: 500,
      easing: 'spring(1, 80, 10, 0)',
      duration: 800
    });
  },

  playScreen2Animations() {
    anime({
      targets: '#s2 .comp-card',
      translateY: [30, 0],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: anime.stagger(120, { start: 200 }),
      easing: 'spring(1, 80, 10, 0)'
    });
  },

  playScreen3Animations() {
    anime({
      targets: '#s3 .input-group',
      translateX: [-20, 0],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: anime.stagger(100, { start: 100 }),
      easing: 'easeOutQuint',
      duration: 800
    });
  },

  playScreen4Animations() {
    const elements = document.querySelectorAll('#s4 .member-card, #s4 .btn-dashed');

    anime({
      targets: elements,
      scale: [0.95, 1],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: anime.stagger(100, { start: 100 }),
      easing: 'spring(1, 80, 10, 0)'
    });
  },

  playScreen5Animations() {
    const elements = document.querySelectorAll('#s5 .review-card, #s5 .chip, #s5 .deadline-chip');

    anime({
      targets: elements,
      translateY: [20, 0],
      opacity: [{value: 0, duration: 0}, {value: 1}],
      delay: anime.stagger(100, { start: 150 }),
      easing: 'easeOutQuad',
      duration: 600
    });
  },

  playConfirmationAnimations(screenId) {
    const checkIcon = document.querySelector(`#${screenId} .success-icon i, #${screenId} .special-icon`);
    const confirmCard = document.querySelector(`#${screenId} .confirm-card`);
    const leafWatermark = document.querySelector(`#${screenId} .confirm-leaf`);

    if (checkIcon) {
      anime({
        targets: checkIcon,
        scale: [0, 1],
        rotate: [-45, 0],
        opacity: [{value: 0, duration: 0}, {value: 1}],
        easing: 'spring(1, 80, 10, 0)',
        delay: 200
      });
    }

    if (confirmCard) {
      anime({
        targets: confirmCard,
        translateY: [50, 0],
        opacity: [{value: 0, duration: 0}, {value: 1}],
        easing: 'spring(1, 80, 10, 0)',
        delay: 400
      });
    }

    if (leafWatermark) {
      anime({
        targets: leafWatermark,
        opacity: [{value: 0, duration: 0}, {value: 0.08}],
        rotate: [-20, 0],
        scale: [0.8, 1],
        easing: 'easeOutSine',
        duration: 1500,
        delay: 800
      });
    }
  },

  /**
   * Ambient continuous animations
   */
  initAmbientAnimations() {
    // Floating leaves in hero
    anime({
      targets: '.hero-leaf',
      translateY: () => anime.random(-15, 15),
      translateX: () => anime.random(-10, 10),
      rotate: () => anime.random(-15, 15),
      duration: () => anime.random(3000, 5000),
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  },

  /**
   * Micro-interactions (Design Spells)
   */
  initMicroInteractions() {
    // 1. Magnetic Buttons
    const magneticButtons = document.querySelectorAll('.btn-primary');
    
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Gentle magnetic pull
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        // Snap back with spring physics
        anime({
          targets: btn,
          translateX: 0,
          translateY: 0,
          easing: 'spring(1, 80, 10, 0)',
          duration: 1000
        });
      });
    });

    // 2. Input Focus Spell (Liquid Inputs)
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const icon = input.previousElementSibling;
        if (icon) {
          anime({
            targets: icon,
            scale: [1, 1.2, 1],
            color: ['#8B6914', '#2D5A27'], // Transition to primary green
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
          });
        }
      });
      
      input.addEventListener('blur', () => {
        const icon = input.previousElementSibling;
        if (icon) {
          anime({
            targets: icon,
            color: '#8B6914', // Back to secondary golden brown
            duration: 300,
            easing: 'easeOutQuad'
          });
        }
      });
    });
    
    // 3. Card Selection Ripple
    const compCards = document.querySelectorAll('.comp-card');
    compCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Create ripple element
        const ripple = document.createElement('div');
        ripple.classList.add('spell-ripple');
        card.appendChild(ripple);
        
        // Position it at click coordinates
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top - size/2;
        
        Object.assign(ripple.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
          background: 'radial-gradient(circle, rgba(45,90,39,0.2) 0%, rgba(45,90,39,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        });
        
        // Animate ripple
        anime({
          targets: ripple,
          scale: [0, 1],
          opacity: [1, 0],
          duration: 600,
          easing: 'easeOutSine',
          complete: () => ripple.remove()
        });
      });
    });
  },
  
  /**
   * Helper to expand/collapse M3 card organically
   */
  toggleMember3(cardElement, show) {
    if (show) {
      cardElement.classList.remove('hidden');
      cardElement.style.height = '0px';
      cardElement.style.opacity = '0';
      cardElement.style.overflow = 'hidden';
      
      anime({
        targets: cardElement,
        height: cardElement.scrollHeight,
        opacity: [0, 1],
        duration: 250,
        easing: 'easeOutQuint',
        complete: () => {
          cardElement.style.height = '';
          cardElement.style.overflow = '';
        }
      });
    } else {
      cardElement.style.overflow = 'hidden';
      anime({
        targets: cardElement,
        height: 0,
        opacity: 0,
        duration: 200,
        easing: 'easeOutQuad',
        complete: () => {
          cardElement.classList.add('hidden');
          cardElement.style.height = '';
          cardElement.style.overflow = '';
        }
      });
    }
  },
  
  /**
   * Submit Button Morph
   */
  morphSubmitButton(btnElement, loading) {
    if (loading) {
      anime({
        targets: btnElement,
        scale: [1, 0.96],
        duration: 150,
        easing: 'easeOutQuad'
      });
    } else {
      anime({
        targets: btnElement,
        scale: [0.96, 1],
        duration: 200,
        easing: 'easeOutElastic(1, .5)'
      });
    }
  }
};

// Initialize ambient effects and spells when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppAnimations.initAmbientAnimations();
  AppAnimations.initMicroInteractions();
  
  // Start Screen 1 animations if we start on S1
  if (document.getElementById('s1').classList.contains('active')) {
    AppAnimations.playScreen1Animations();
  }
});
