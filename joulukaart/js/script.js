// ============================================
// CHRISTMAS CARD - MAIN SCRIPT
// ============================================
// This script handles:
// - Snow animation
// - Lottie eye animation
// - Iris cursor tracking
// - Slide transitions
// - Keyword selection logic
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  
  // ============================================
  // SNOW ANIMATION
  // ============================================
  
  (function makeSnow() {
    const snowContainer = document.querySelector(".snow");
    if (!snowContainer) {
      return;
    }
    
    // Reduce snow particles on mobile for better performance
    const isMobile = window.innerWidth <= 480;
    const flakes = isMobile ? 100 : 300;
    
    for (let i = 0; i < flakes; i += 1) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      const size = Math.random() * 4 + 2;
      flake.style.width = size + "px";
      flake.style.height = size + "px";
      flake.style.left = Math.random() * 100 + "%";
      const duration = Math.random() * 12 + 12;
      const delay = Math.random() * -duration + "s";
      flake.style.animationDuration = duration + "s";
      flake.style.animationDelay = delay;
      flake.style.opacity = Math.random() * 0.6 + 0.4;
      snowContainer.appendChild(flake);
    }
  })();
  
  // ============================================
  // LOTTIE ANIMATION SETUP
  // ============================================
  
  // This creates a new Lottie player - think of it like setting up a DVD player
  const lottieContainer = document.getElementById('lottie-animation');
  
  // Load the animation JSON file (like putting a DVD in the player)
  const animation = lottie.loadAnimation({
    container: lottieContainer,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'assets/1920x1920.json'
  });
  
  // Reference to the iris element (will be set after animation loads)
  let irisElement = null;
  let highlightElement = null; // The white circle (light reflection)
  
  // Wait for animation to load before setting up states
  animation.addEventListener('DOMLoaded', function() {
    // Slow down the animation! The original is 100fps which is TOO FAST
    // Think of it like: changing the speed on a record player from 100rpm to 30rpm
    animation.setSpeed(1);  // Keep at normal speed, the segments are timed correctly
    
    // Start with idleDefault state (SECONDS 0-3, which is FRAMES 0-300 at 100fps)
    // Think of it like: playing the first scene of a movie on repeat
    animation.playSegments([0, 300], true);  // Frames 0-300 (0-3 seconds)
    
    // ============================================
    // FIND AND MARK THE IRIS ELEMENT
    // ============================================
    
    // Find the iris (the black circle) in the SVG
    // Looking for: black circle (fill="rgb(0,0,0)") with specific size
    setTimeout(() => {
      const svgElement = lottieContainer.querySelector('svg');
      if (svgElement) {
        // Find all path elements (shapes in the animation)
        const paths = svgElement.querySelectorAll('path');
        
        // The iris is the black circle with these characteristics:
        // - fill="rgb(0,0,0)" (black color)
        // - Inside a group with specific transform
        paths.forEach((path, index) => {
          const fill = path.getAttribute('fill');
          
          // If this is the black circle (iris)
          if (fill === 'rgb(0,0,0)') {
            // Add a class so we can target it with CSS or JavaScript!
            path.classList.add('iris');
            
            // Also add a class to its parent group for easier targeting
            const parentG = path.closest('g');
            if (parentG) {
              parentG.classList.add('iris-container');
            }
            
            // Save reference so we can modify it later!
            irisElement = path;
            
            console.log('✅ Found iris at index:', index);
          }
          
          // If this is the white circle (highlight/reflection)
          if (fill === 'rgb(255,255,255)') {
            // Find the parent <g> element to check its transform
            const parentG = path.closest('g');
            if (parentG) {
              const transform = parentG.getAttribute('transform');
              console.log('Found white circle at index:', index, 'transform:', transform);
              
              // The highlight is the one near the iris (around x:1093, y:771)
              if (transform && transform.includes('1093')) {
                // Add a class to the white highlight
                path.classList.add('highlight');
                
                // Also add a class to its parent group
                parentG.classList.add('highlight-container');
                
                // Save reference so we can move it with the iris!
                highlightElement = path;
                
                console.log('✅ Found and marked the correct highlight element!');
              }
            }
          }
        });
        
        if (irisElement && highlightElement) {
          console.log('👁️ Iris and highlight will now follow your cursor together!');
        }
      }
    }, 100); // Wait 100ms for SVG to fully render
  });
  
  // ============================================
  // IRIS CURSOR TRACKING
  // ============================================
  
  // Helper function to update iris position (works for both mouse and touch)
  function updateIrisPosition(clientX, clientY) {
    if (!irisElement) return;
    
    const irisContainer = irisElement.closest('.iris-container');
    if (!irisContainer) return;
    
    const rect = irisContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    
    const distance = Math.min(60, Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 8);
    
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    
    irisContainer.setAttribute('transform', `matrix(1,0,0,1,${1004.001953125 + moveX},${725.4998779296875 + moveY})`);
    
    if (highlightElement) {
      const highlightContainer = highlightElement.closest('.highlight-container');
      if (highlightContainer) {
        highlightContainer.setAttribute('transform', `matrix(1,0,0,1,${1093.326171875 + moveX},${771.1597900390625 + moveY})`);
      }
    }
  }
  
  // Mouse tracking for desktop
  document.addEventListener('mousemove', (event) => {
    updateIrisPosition(event.clientX, event.clientY);
  });
  
  // Touch tracking for mobile
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      updateIrisPosition(touch.clientX, touch.clientY);
    }
  }, { passive: true });
  
  // Track touch position on tap
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      updateIrisPosition(touch.clientX, touch.clientY);
    }
  }, { passive: true });
  
  // ============================================
  // ANIMATION STATE CONTROLLER
  // ============================================
  
  // This function switches between different animation states
  // Think of it like: changing TV channels - each state is a different channel
  const switchAnimationState = (stateName) => {
    if (stateName === 'idleDefault') {
      // Default state: character waiting (loops forever)
      // Seconds 0-3 = Frames 0-300 (at 100fps)
      animation.loop = true;                      // Turn looping ON
      animation.playSegments([0, 300], true);     // Play frames 0-300
    } 
    else if (stateName === 'transitionToHat') {
      // Transition: hat appearing (plays once, then switches to idleHat)
      // Seconds 4-4.25 = Frames 400-425 (at 100fps)
      animation.loop = false;                     // Turn looping OFF (play once)
      animation.playSegments([400, 425], true);   // Play frames 400-425
      
      // When transition finishes, automatically switch to idleHat
      // Think of it like: when the commercial ends, show the next scene
      animation.addEventListener('complete', function switchToIdleHat() {
        animation.loop = true;                    // Turn looping back ON
        animation.playSegments([500, 800], true); // Play frames 500-800 (hat state, 5-8 seconds)
        animation.removeEventListener('complete', switchToIdleHat); // Clean up (remove this listener)
      });
    }
    else if (stateName === 'idleHat') {
      // Hat state: character with hat on (loops forever)
      // Seconds 5-8 = Frames 500-800 (at 100fps)
      animation.loop = true;                      // Turn looping ON
      animation.playSegments([500, 800], true);   // Play frames 500-800
    }
  };
  
  // ============================================
  // DOM ELEMENT REFERENCES
  // ============================================
  
  const headingPrimary = document.querySelector(".section.--top h1");
  const headingSecondary = document.querySelector(".section.--top h2");
  const headingFinal = document.querySelector(".section.--top h4");
  const keywordsContainer = document.querySelector(".keywords");
  const keywordElements = Array.from(document.querySelectorAll(".keyword"));
  const slideMessage = document.querySelector(".section.--bottom h3");
  const logo = document.querySelector(".section.--bottom .logo");
  
  // ============================================
  // LOAD MESSAGES FROM JSON
  // ============================================
  
  let keywordMessages = new Map();
  let defaultSlideText = slideMessage.textContent.trim();
  
  // Load messages from external JSON file
  fetch('data/messages.json')
    .then(response => response.json())
    .then(data => {
      // Convert JSON object to Map for easy lookup
      keywordMessages = new Map(Object.entries(data.combinations));
      // Update default text if provided in JSON
      if (data.defaultMessage) {
        defaultSlideText = data.defaultMessage;
      }
      console.log('✅ Messages loaded:', keywordMessages.size, 'combinations');
    })
    .catch(error => {
      console.error('❌ Failed to load messages:', error);
      // Keep using empty Map and existing default text
    });
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const selectedKeywords = new Set();
  let slideStage = 1;
  let slideTimer = null;
  
  // Get fade duration from CSS variable for consistency
  const FADE_DURATION = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fade-duration')) || 1000;
  const SLIDE_THREE_DELAY = 4000;
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const showElement = (element) => {
    if (!element) {
      return;
    }

    element.hidden = false;
    element.classList.remove("is-visible");

    void element.offsetWidth; // force reflow so transition always fires

    requestAnimationFrame(() => {
      element.classList.add("is-visible");
    });
  };

  const hideElement = (element) => {
    if (!element || element.hidden) {
      return;
    }

    element.classList.remove("is-visible");
    setTimeout(() => {
      element.hidden = true;
    }, FADE_DURATION);
  };
  
  // ============================================
  // SLIDE TRANSITION FUNCTIONS
  // ============================================
  
  const transitionToSlideThree = () => {
    slideStage = 3;
    hideElement(slideMessage);
    setTimeout(() => {
      showElement(headingFinal);
      showElement(logo);
    }, FADE_DURATION);
    slideTimer = null;
  };

  const showSlideTwo = () => {
    const selectionKey = Array.from(selectedKeywords).sort().join("|");
    const message = keywordMessages.get(selectionKey) || defaultSlideText;

    hideElement(headingPrimary);
    hideElement(headingSecondary);
    hideElement(keywordsContainer);
    hideElement(headingFinal);
    hideElement(logo);

    slideMessage.textContent = message;
    slideStage = 2;

    clearTimeout(slideTimer);

    setTimeout(() => {
      showElement(slideMessage);
      slideTimer = setTimeout(transitionToSlideThree, SLIDE_THREE_DELAY);
    }, FADE_DURATION);
  };
  
  // ============================================
  // KEYWORD SELECTION HANDLER
  // ============================================
  
  const handleKeywordClick = (keyword) => {
    if (slideStage !== 1) {
      return;
    }

    const keywordId = keyword.id;

    if (selectedKeywords.has(keywordId)) {
      selectedKeywords.delete(keywordId);
      keyword.classList.remove("active");
      return;
    }

    if (selectedKeywords.size === 3) {
      return;
    }

    selectedKeywords.add(keywordId);
    keyword.classList.add("active");

    // When 3 keywords are selected, trigger the hat animation!
    if (selectedKeywords.size === 3) {
      // Switch animation from idleDefault → transitionToHat → idleHat
      // Think of it like: user completed the task, so character celebrates with a hat!
      switchAnimationState('transitionToHat');
      
      showSlideTwo();
    }
  };
  
  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  keywordElements.forEach((keyword) => {
    keyword.addEventListener("click", () => handleKeywordClick(keyword));
  });
  
});
