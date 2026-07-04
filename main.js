/* 
   =============================================
   Clínica Veterinaria Cristo de la Epidemia
   =============================================
*/

gsap.registerPlugin(ScrollTrigger);

// ================= Custom Text Split (Basic SplitText polyfill) =================
function splitTextToLines(element) {
    const html = element.innerHTML;
    // Split by <br> or native text boundaries
    const segments = html.split(/<br\s*\/?>/gi);
    
    element.innerHTML = '';
    
    segments.forEach((segment, index) => {
        const words = segment.trim().split(/\s+/);
        words.forEach(word => {
            if(!word) return;
            const span = document.createElement('span');
            span.innerHTML = word + '&nbsp;';
            span.style.display = 'inline-block';
            element.appendChild(span);
        });
        // Add native <br> back to force manual breaks
        if(index < segments.length - 1) {
            const br = document.createElement('br');
            element.appendChild(br);
        }
    });

    const wordSpans = Array.from(element.querySelectorAll('span'));
    
    let lines = [];
    let lastTop = -1;
    let currentLineSpans = [];

    wordSpans.forEach(span => {
        const top = span.offsetTop;
        if (top !== lastTop) {
            if (currentLineSpans.length > 0) {
                lines.push(currentLineSpans);
            }
            currentLineSpans = [span];
            lastTop = top;
        } else {
            currentLineSpans.push(span);
        }
    });
    if (currentLineSpans.length > 0) lines.push(currentLineSpans);

    element.innerHTML = '';
    
    lines.forEach(lineSpans => {
        const maskDiv = document.createElement('span');
        maskDiv.className = 'line-mask';
        maskDiv.style.display = 'block';
        
        const innerDiv = document.createElement('span');
        innerDiv.className = 'line-inner';
        innerDiv.style.display = 'inline-block';
        
        lineSpans.forEach(span => {
            innerDiv.appendChild(span);
        });
        
        maskDiv.appendChild(innerDiv);
        element.appendChild(maskDiv);
    });

    return element.querySelectorAll('.line-inner');
}

// Check for reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ================= Lenis Smooth Scroll =================
const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ================= Preloader & Initial Reveal =================
const preloader = document.querySelector('.preloader');
const tlPreloader = gsap.timeline();

// Prevent scroll during preloader
lenis.stop();

window.addEventListener('load', () => {
    // Split hero text immediately so it's ready for the preloader timeline
    const heroTitleLines = splitTextToLines(document.querySelector('.hero__title'));
    const heroSubLines = splitTextToLines(document.querySelector('.hero__subtitle'));

    tlPreloader
        .to('.preloader__content', {
            y: -50,
            opacity: 0,
            duration: 0.8,
            ease: 'power4.inOut',
            delay: 0.5
        })
        .to(preloader, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1.2,
            ease: 'power4.inOut',
            onComplete: () => {
                preloader.style.display = 'none';
                lenis.start();
                initScrollAnimations();
            }
        })
        // Reveal Hero content smoothly
        .from('.navbar', { y: '-100%', duration: 1, ease: 'power4.out' }, '-=0.6')
        .from('.hero__video-wrapper', { scale: 1.1, opacity: 0, duration: 1.5, ease: 'power4.out' }, '-=1')
        .from(heroTitleLines, { y: '110%', duration: 1, stagger: 0.08, ease: 'power4.out' }, '-=1')
        .from(heroSubLines, { y: '110%', duration: 1, stagger: 0.08, ease: 'power4.out' }, '-=0.8')
        .from('.hero__cta', { y: 40, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.6');
});

function initScrollAnimations() {
    if (prefersReducedMotion) return;

    // Split texts and animate
    const splitTexts = document.querySelectorAll('.split-text');
    splitTexts.forEach(el => {
        const lines = splitTextToLines(el);
        gsap.from(lines, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
            },
            y: '110%',
            duration: 1,
            stagger: 0.08,
            ease: 'power4.out'
        });
    });

    // Reveal standard items
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power4.out'
        });
    });

    // Image Reveals
    const revealImages = document.querySelectorAll('.reveal-image-container');
    revealImages.forEach(container => {
        gsap.fromTo(container, 
            { clipPath: 'inset(100% 0 0 0)' },
            {
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.2,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%'
                }
            }
        );
    });

    // Parallax Images
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    parallaxImgs.forEach(img => {
        gsap.to(img, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // Stats Count Up
    const stats = document.querySelectorAll('.count-up');
    stats.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const decimals = parseInt(stat.getAttribute('data-decimals')) || 0;
        
        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power4.out',
                    onUpdate: function() {
                        if(decimals > 0) {
                            stat.innerText = this.targets()[0].val.toFixed(1).replace('.', ',');
                        } else {
                            stat.innerText = Math.floor(this.targets()[0].val);
                        }
                    }
                });
            }
        });
    });

    // Marquee Double Setup (clone for infinite effect)
    const marquees = document.querySelectorAll('.marquee__inner--double');
    marquees.forEach(marquee => {
        const track = marquee.querySelector('.marquee__track');
        if (track) {
            const clone = track.cloneNode(true);
            marquee.appendChild(clone);
            
            // Get speed from data attribute or use default
            const duration = marquee.closest('.marquee--fast') ? 20 : 15;
            
            gsap.to(marquee, {
                xPercent: -50,
                ease: 'none',
                duration: duration,
                repeat: -1
            });
        }
    });

    // Kinetic Section (Horizontal Scroll)
    const kineticWrapper = document.querySelector('.kinetic__wrapper');
    const kineticContent = document.querySelector('.kinetic__content');
    
    if(kineticWrapper && kineticContent) {
        gsap.to(kineticContent, {
            x: () => -(kineticContent.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: '.kinetic',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            }
        });
        
        // Video Parallax inside kinetic
        gsap.to('.kinetic__bg', {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.kinetic',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Sticky Pillars Logic
    const pillarItems = document.querySelectorAll('.pillar-item');
    pillarItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            start: 'top center',
            end: 'bottom center',
            toggleClass: 'is-active',
        });
    });

    // Footer Parallax
    gsap.to('.footer__wordmark', {
        y: 0,
        opacity: 0.8,
        ease: 'none',
        scrollTrigger: {
            trigger: '.footer',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true
        }
    });
}

// ================= Navbar hide/show on scroll =================
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        navbar.classList.add('is-hidden');
    } else {
        navbar.classList.remove('is-hidden');
    }
    lastScrollY = currentScrollY;
});

// ================= Mobile Menu Toggle =================
const toggleBtn = document.querySelector('.navbar__toggle');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.menu-link');
let menuOpen = false;

toggleBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    
    if (menuOpen) {
        lenis.stop();
        document.querySelector('.navbar__toggle-text').innerText = 'Cerrar';
        gsap.to(menuOverlay, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.inOut' });
        gsap.to(menuLinks, { y: '0%', opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power4.out', delay: 0.4 });
    } else {
        lenis.start();
        document.querySelector('.navbar__toggle-text').innerText = 'Menú';
        gsap.to(menuLinks, { y: '100%', opacity: 0, duration: 0.4, ease: 'power4.in' });
        gsap.to(menuOverlay, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut', delay: 0.2 });
    }
});

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(menuOpen) toggleBtn.click();
    });
});

// ================= FAQ Accordion =================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const content = item.querySelector('.faq-item__content');
    
    trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        
        // Close all others
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('is-open');
            gsap.to(otherItem.querySelector('.faq-item__content'), { height: 0, duration: 0.4, ease: 'power2.out' });
        });

        if (!isOpen) {
            item.classList.add('is-open');
            gsap.set(content, { height: 'auto' });
            const height = content.offsetHeight;
            gsap.fromTo(content, { height: 0 }, { height: height, duration: 0.4, ease: 'power2.out' });
        }
    });
});

// ================= Custom Cursor (Optional) =================
const cursor = document.querySelector('.cursor-dot');

if (cursor && !prefersReducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        // Smooth lerp
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        
        gsap.set(cursor, { x: cursorX, y: cursorY });
    });

    // Hover interactions
    const interactables = document.querySelectorAll('a, button');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
}
