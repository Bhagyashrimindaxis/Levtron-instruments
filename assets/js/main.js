/* ==========================================================================
   LEVTRON INSTRUMENTS PVT LTD - INTERACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// 0. Dynamic Header & Footer Component Loader
async function loadHeaderAndFooter() {
  const headerPlaceholder = document.getElementById('header-placeholder') || document.getElementById('site-header');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    try {
      const response = await fetch('header.html');
      if (response.ok) {
        const html = await response.text();
        headerPlaceholder.innerHTML = html;
      }
    } catch (e) {
      console.warn('Could not load header.html via fetch:', e);
    }
  }

  if (footerPlaceholder) {
    try {
      const response = await fetch('footer.html');
      if (response.ok) {
        const html = await response.text();
        footerPlaceholder.innerHTML = html;
      }
    } catch (e) {
      console.warn('Could not load footer.html via fetch:', e);
    }
  }

  initNavEvents();
}

// 1. Navigation & Dropdown Event Handlers
function initNavEvents() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const productsDropdown = document.getElementById('productsDropdown');
  const productsDropdownToggle = document.getElementById('productsDropdownToggle');

  // Mobile Menu Toggle
  if (mobileToggle && navLinks) {
    mobileToggle.onclick = function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    };

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  // Dropdown Toggle (for mobile / touch)
  if (productsDropdownToggle && productsDropdown) {
    productsDropdownToggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        productsDropdown.classList.toggle('open');
        productsDropdown.classList.toggle('active');
      }
    });
  }

  // All Submenu Items Toggle (for mobile / touch)
  const hasSubItems = document.querySelectorAll('.nav-menu-item.has-sub');
  hasSubItems.forEach(item => {
    const link = item.querySelector('.nav-menu-link');
    if (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          hasSubItems.forEach(other => {
            other.classList.remove('open', 'active');
          });
          if (!isOpen) {
            item.classList.add('open', 'active');
          }
        }
      });
    }
  });

  // Set Active Nav Link based on Current Page URL & Query Params
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const pageParams = new URLSearchParams(window.location.search);
  const currentCategory = pageParams.get('category');
  const navItems = document.querySelectorAll('.nav-links .nav-item, .nav-links a');

  navItems.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('?')[0];

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
      if (linkPath === 'products.html' && productsDropdownToggle) {
        productsDropdownToggle.classList.add('active');
      }
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight specific dropdown item if category query param is matched
  if (currentCategory) {
    const dropdownItems = document.querySelectorAll('.nav-dropdown-item');
    dropdownItems.forEach(item => {
      const itemCat = item.getAttribute('data-category');
      if (itemCat === currentCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

// Initialize navigation on load with singleton guard
let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  loadHeaderAndFooter();
  initPageScripts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 2. Main Page Scripts & Interactive Features
function initPageScripts() {
  const urlParams = new URLSearchParams(window.location.search);

  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      this.classList.add('active');
      const contentElem = document.getElementById(targetTab);
      if (contentElem) {
        contentElem.classList.add('active');
      }
    });
  });

  // Products Filtering Search & Category Filter (for products.html)
  const searchInput = document.getElementById('productSearch');
  const categoryFilter = document.getElementById('categorySelect');
  const productCards = document.querySelectorAll('.product-card, .product-card-item');

  function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : 'all';

    productCards.forEach(card => {
      const title = card.getAttribute('data-title') ? card.getAttribute('data-title').toLowerCase() : '';
      const category = card.getAttribute('data-category') ? card.getAttribute('data-category').toLowerCase() : '';
      const text = card.textContent.toLowerCase();

      const matchesSearch = searchTerm === '' || title.includes(searchTerm) || text.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  // Auto-select category from URL parameter on products.html
  const initialCategory = urlParams.get('category');
  if (initialCategory && categoryFilter) {
    categoryFilter.value = initialCategory;
    filterProducts();
    const catalogGrid = document.getElementById('catalogGrid') || document.getElementById('productGrid');
    if (catalogGrid) {
      setTimeout(() => {
        catalogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }

  // Auto-populate inquiry on contact.html
  const initialProduct = urlParams.get('product') || urlParams.get('category');
  const subjectInput = document.getElementById('subject');
  const productSelect = document.getElementById('productInterest');

  if (initialProduct) {
    const cleanName = decodeURIComponent(initialProduct);
    if (subjectInput && !subjectInput.value) {
      subjectInput.value = `Inquiry regarding: ${cleanName}`;
    }
    if (productSelect) {
      for (let opt of productSelect.options) {
        if (opt.value.toLowerCase() === cleanName.toLowerCase() || opt.text.toLowerCase().includes(cleanName.toLowerCase())) {
          productSelect.value = opt.value;
          break;
        }
      }
    }
  }

  // Contact Form Submission Simulation
  const contactForm = document.getElementById('inquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
      }

      setTimeout(() => {
        alert('Thank you for contacting Levtron Instruments! Our engineering team will reach out to you within 24 hours.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }, 1000);
    });
  }

  // Hero Section Auto Slider
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const sliderSection = document.querySelector('.hero-slider-section');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let slideTimer = null;

    function goToSlide(index) {
      if (index >= heroSlides.length) currentSlide = 0;
      else if (index < 0) currentSlide = heroSlides.length - 1;
      else currentSlide = index;

      heroSlides.forEach((slide, i) => {
        if (i === currentSlide) slide.classList.add('active');
        else slide.classList.remove('active');
      });

      heroDots.forEach((dot, i) => {
        if (i === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    function autoNextSlide() {
      goToSlide(currentSlide + 1);
    }

    function startAutoSlide() {
      if (!slideTimer) slideTimer = setInterval(autoNextSlide, 1230);
    }

    function stopAutoSlide() {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide + 1); startAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide - 1); startAutoSlide(); });

    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => { stopAutoSlide(); goToSlide(index); startAutoSlide(); });
    });

    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', stopAutoSlide);
      sliderSection.addEventListener('mouseleave', startAutoSlide);
    }

    startAutoSlide();
  }

  // Flagship Products Carousel - Seamless Infinite Loop & Auto-scroll
  const track = document.getElementById('productsTrack');
  const carouselWrapper = document.querySelector('.products-carousel-wrapper');
  const pPrevBtn = document.getElementById('productPrev');
  const pNextBtn = document.getElementById('productNext');
  const pDotsContainer = document.getElementById('productDots');

  if (track && !track.dataset.carouselInit) {
    track.dataset.carouselInit = 'true';
    const originalSlides = Array.from(track.children);
    const totalOriginals = originalSlides.length;

    if (totalOriginals > 0) {
      // Create cloned sets before and after for seamless infinite wrapping
      const fragmentBefore = document.createDocumentFragment();
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentBefore.appendChild(clone);
      });
      track.insertBefore(fragmentBefore, track.firstChild);

      const fragmentAfter = document.createDocumentFragment();
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentAfter.appendChild(clone);
      });
      track.appendChild(fragmentAfter);

      let pCurrentIndex = totalOriginals; // Start at the first original slide
      let isTransitioning = false;
      let transitionSafetyTimer = null;
      let pTimer = null;

      function getCardsPerPage() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
      }

      function updateTrackPosition(withAnimation = true) {
        const perPage = getCardsPerPage();
        const cardWidth = 100 / perPage;
        if (withAnimation) {
          track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          track.style.transition = 'none';
        }
        track.style.transform = `translateX(-${pCurrentIndex * cardWidth}%)`;
        updateProductDots();
      }

      function updateProductDots() {
        if (!pDotsContainer) return;
        const normalizedIndex = ((pCurrentIndex - totalOriginals) % totalOriginals + totalOriginals) % totalOriginals;
        let dotsHtml = '';
        for (let i = 0; i < totalOriginals; i++) {
          dotsHtml += `<span class="dot ${i === normalizedIndex ? 'active' : ''}" data-pindex="${i}"></span>`;
        }
        pDotsContainer.innerHTML = dotsHtml;

        const dots = pDotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
          dot.addEventListener('click', function () {
            if (isTransitioning) return;
            const targetIndex = parseInt(this.getAttribute('data-pindex'), 10);
            stopProductAuto();
            isTransitioning = true;
            pCurrentIndex = totalOriginals + targetIndex;
            updateTrackPosition(true);
            setTransitionSafety();
            startProductAuto();
          });
        });
      }

      function setTransitionSafety() {
        clearTimeout(transitionSafetyTimer);
        transitionSafetyTimer = setTimeout(() => {
          isTransitioning = false;
          handleWrap();
        }, 650);
      }

      function handleWrap() {
        if (pCurrentIndex >= totalOriginals * 2) {
          pCurrentIndex = pCurrentIndex - totalOriginals;
          updateTrackPosition(false);
        } else if (pCurrentIndex < totalOriginals) {
          pCurrentIndex = pCurrentIndex + totalOriginals;
          updateTrackPosition(false);
        }
      }

      function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        pCurrentIndex++;
        updateTrackPosition(true);
        setTransitionSafety();
      }

      function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        pCurrentIndex--;
        updateTrackPosition(true);
        setTransitionSafety();
      }

      track.addEventListener('transitionend', () => {
        isTransitioning = false;
        clearTimeout(transitionSafetyTimer);
        handleWrap();
      });

      function startProductAuto() {
        if (!pTimer) {
          pTimer = setInterval(() => {
            nextSlide();
          }, 1700);
        }
      }

      function stopProductAuto() {
        if (pTimer) {
          clearInterval(pTimer);
          pTimer = null;
        }
      }

      if (pNextBtn) {
        pNextBtn.addEventListener('click', () => {
          stopProductAuto();
          nextSlide();
          startProductAuto();
        });
      }

      if (pPrevBtn) {
        pPrevBtn.addEventListener('click', () => {
          stopProductAuto();
          prevSlide();
          startProductAuto();
        });
      }

      // Pause auto-scroll ONLY when mouse hovers over carousel / images
      if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopProductAuto);
        carouselWrapper.addEventListener('mouseleave', startProductAuto);
      }

      // Also attach hover pause directly to all card elements and images
      track.addEventListener('mouseenter', stopProductAuto);
      track.addEventListener('mouseleave', startProductAuto);

      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopProductAuto();
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 40) {
          nextSlide();
        } else if (touchEndX - touchStartX > 40) {
          prevSlide();
        }
        startProductAuto();
      }, { passive: true });

      // Handle visibility changes (browser tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopProductAuto();
        } else {
          startProductAuto();
        }
      });

      window.addEventListener('resize', () => {
        updateTrackPosition(false);
      });

      // Initial start
      updateTrackPosition(false);
      startProductAuto();
    }
  }

  // Client Reviews Carousel - Seamless Infinite Loop & Auto-scroll
  const reviewTrack = document.getElementById('reviewsTrack');
  const reviewWrapper = document.querySelector('.reviews-carousel-wrapper');
  const rPrevBtn = document.getElementById('reviewPrev');
  const rNextBtn = document.getElementById('reviewNext');
  const rDotsContainer = document.getElementById('reviewDots');

  if (reviewTrack && !reviewTrack.dataset.carouselInit) {
    reviewTrack.dataset.carouselInit = 'true';
    const originalReviewSlides = Array.from(reviewTrack.children);
    const totalOriginalReviews = originalReviewSlides.length;

    if (totalOriginalReviews > 0) {
      // Create cloned sets before and after for seamless infinite wrapping
      const fragmentBefore = document.createDocumentFragment();
      originalReviewSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentBefore.appendChild(clone);
      });
      reviewTrack.insertBefore(fragmentBefore, reviewTrack.firstChild);

      const fragmentAfter = document.createDocumentFragment();
      originalReviewSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentAfter.appendChild(clone);
      });
      reviewTrack.appendChild(fragmentAfter);

      let rCurrentIndex = totalOriginalReviews; // Start at first original slide
      let rIsTransitioning = false;
      let rTransitionSafetyTimer = null;
      let rTimer = null;

      function getReviewsPerPage() {
        if (window.innerWidth <= 992) return 1;
        return 2;
      }

      function updateReviewTrackPosition(withAnimation = true) {
        const perPage = getReviewsPerPage();
        const cardWidth = 100 / perPage;
        if (withAnimation) {
          reviewTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          reviewTrack.style.transition = 'none';
        }
        reviewTrack.style.transform = `translateX(-${rCurrentIndex * cardWidth}%)`;
        updateReviewDots();
      }

      function updateReviewDots() {
        if (!rDotsContainer) return;
        const normalizedIndex = ((rCurrentIndex - totalOriginalReviews) % totalOriginalReviews + totalOriginalReviews) % totalOriginalReviews;
        let dotsHtml = '';
        for (let i = 0; i < totalOriginalReviews; i++) {
          dotsHtml += `<span class="dot ${i === normalizedIndex ? 'active' : ''}" data-rindex="${i}"></span>`;
        }
        rDotsContainer.innerHTML = dotsHtml;

        const dots = rDotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
          dot.addEventListener('click', function () {
            if (rIsTransitioning) return;
            const targetIndex = parseInt(this.getAttribute('data-rindex'), 10);
            stopReviewAuto();
            rIsTransitioning = true;
            rCurrentIndex = totalOriginalReviews + targetIndex;
            updateReviewTrackPosition(true);
            setReviewTransitionSafety();
            startReviewAuto();
          });
        });
      }

      function setReviewTransitionSafety() {
        clearTimeout(rTransitionSafetyTimer);
        rTransitionSafetyTimer = setTimeout(() => {
          rIsTransitioning = false;
          handleReviewWrap();
        }, 650);
      }

      function handleReviewWrap() {
        if (rCurrentIndex >= totalOriginalReviews * 2) {
          rCurrentIndex = rCurrentIndex - totalOriginalReviews;
          updateReviewTrackPosition(false);
        } else if (rCurrentIndex < totalOriginalReviews) {
          rCurrentIndex = rCurrentIndex + totalOriginalReviews;
          updateReviewTrackPosition(false);
        }
      }

      function nextReviewSlide() {
        if (rIsTransitioning) return;
        rIsTransitioning = true;
        rCurrentIndex++;
        updateReviewTrackPosition(true);
        setReviewTransitionSafety();
      }

      function prevReviewSlide() {
        if (rIsTransitioning) return;
        rIsTransitioning = true;
        rCurrentIndex--;
        updateReviewTrackPosition(true);
        setReviewTransitionSafety();
      }

      reviewTrack.addEventListener('transitionend', () => {
        rIsTransitioning = false;
        clearTimeout(rTransitionSafetyTimer);
        handleReviewWrap();
      });

      function startReviewAuto() {
        if (!rTimer) {
          rTimer = setInterval(() => {
            nextReviewSlide();
          }, 2400);
        }
      }

      function stopReviewAuto() {
        if (rTimer) {
          clearInterval(rTimer);
          rTimer = null;
        }
      }

      if (rNextBtn) {
        rNextBtn.addEventListener('click', () => {
          stopReviewAuto();
          nextReviewSlide();
          startReviewAuto();
        });
      }

      if (rPrevBtn) {
        rPrevBtn.addEventListener('click', () => {
          stopReviewAuto();
          prevReviewSlide();
          startReviewAuto();
        });
      }

      // Pause auto-scroll ONLY when mouse hovers over review carousel / cards
      if (reviewWrapper) {
        reviewWrapper.addEventListener('mouseenter', stopReviewAuto);
        reviewWrapper.addEventListener('mouseleave', startReviewAuto);
      }
      reviewTrack.addEventListener('mouseenter', stopReviewAuto);
      reviewTrack.addEventListener('mouseleave', startReviewAuto);

      // Touch swipe support
      let rTouchStartX = 0;
      let rTouchEndX = 0;

      reviewTrack.addEventListener('touchstart', (e) => {
        rTouchStartX = e.changedTouches[0].screenX;
        stopReviewAuto();
      }, { passive: true });

      reviewTrack.addEventListener('touchend', (e) => {
        rTouchEndX = e.changedTouches[0].screenX;
        if (rTouchStartX - rTouchEndX > 40) {
          nextReviewSlide();
        } else if (rTouchEndX - rTouchStartX > 40) {
          prevReviewSlide();
        }
        startReviewAuto();
      }, { passive: true });

      window.addEventListener('resize', () => {
        updateReviewTrackPosition(false);
      });

      // Initial start
      updateReviewTrackPosition(false);
      startReviewAuto();
    }
  }

  // 3. Initialize Scroll Reveal & Count Up Animations
  initScrollAnimations();
  initCountUpStats();
}

// Scroll-Triggered Reveal Animations Engine
function initScrollAnimations() {
  const targets = document.querySelectorAll(`
    .section-title,
    .about-image-wrapper,
    .about-grid-responsive > div,
    .stat-card,
    .product-card-slide,
    .review-card-slide,
    .glass-card,
    .feature-item,
    .gallery-item
  `);

  targets.forEach((el) => {
    if (!el.classList.contains('reveal-fade-up') &&
        !el.classList.contains('reveal-fade-left') &&
        !el.classList.contains('reveal-fade-right') &&
        !el.classList.contains('reveal-zoom-in')) {
      el.classList.add('reveal-fade-up');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    targets.forEach(el => el.classList.add('revealed'));
  }
}

// Executive Stat Numbers Dynamic Count-Up Animation
function initCountUpStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const hasPlus = text.includes('+');
          const numVal = parseInt(text.replace(/[^0-9]/g, ''), 10);

          if (!isNaN(numVal) && !el.dataset.animated) {
            el.dataset.animated = 'true';
            const duration = 1800;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic function
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentNum = Math.floor(easeProgress * numVal);
              el.textContent = currentNum.toLocaleString() + (hasPlus ? '+' : '');

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = text;
              }
            }

            requestAnimationFrame(updateCount);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    statNumbers.forEach(num => observer.observe(num));
  }
}

// Quick View Modal helpers
window.openProductModal = function (title, description, specs) {
  const modalBackdrop = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (modalBackdrop && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = `
      <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 1.05rem;">${description}</p>
      <div style="background: rgba(7,12,26,0.6); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-glass);">
        <h4 style="color: var(--primary-cyan); margin-bottom: 0.75rem; font-size: 1.1rem;">Technical Specifications:</h4>
        <ul style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.8;">
          ${specs ? specs.split('|').map(s => `<li>• ${s.trim()}</li>`).join('') : '<li>• High precision microprocessor-based logic</li><li>• Heavy-duty SS316 sensing elements</li><li>• IP66 Enclosures</li>'}
        </ul>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <a href="contact.html?product=${encodeURIComponent(title)}" class="btn btn-primary btn-sm">Request Instant Quote</a>
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Close</button>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }
};

window.closeModal = function () {
  const modalBackdrop = document.getElementById('productModal');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
};

// Mission & Vision Card Scroll Animation (Left-to-Right & Right-to-Left)
function initMissionVisionAnimation() {
  const missionCard = document.querySelector('.mission-poly-card');
  const visionCard = document.querySelector('.vision-poly-card');
  const container = document.querySelector('.mv-polygon-cards-grid');

  if (!container || !missionCard || !visionCard) return;

  if ('IntersectionObserver' in window) {
    // Reset and trigger when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          missionCard.style.animation = 'none';
          visionCard.style.animation = 'none';
          // Trigger reflow
          void missionCard.offsetWidth;
          void visionCard.offsetWidth;
          missionCard.style.animation = 'slideInFromLeft 1s cubic-bezier(0.16, 1, 0.3, 1) both';
          visionCard.style.animation = 'slideInFromRight 1s cubic-bezier(0.16, 1, 0.3, 1) both';
        }
      });
    }, { threshold: 0.15 });

    observer.observe(container);
  }
}

// Call on startup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMissionVisionAnimation);
} else {
  initMissionVisionAnimation();
}

