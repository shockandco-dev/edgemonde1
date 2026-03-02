document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Smart-hide header
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('header-hidden')) {
            // Scroll down
            header.classList.add('header-hidden');
        } else if (currentScroll < lastScroll && header.classList.contains('header-hidden')) {
            // Scroll up
            header.classList.remove('header-hidden');
        }

        lastScroll = currentScroll;
    });

    // Video Modal Logic
    const modal = document.querySelector('.modal-overlay');
    const modalIframe = modal?.querySelector('iframe');
    const modalClose = document.querySelector('.modal-close');
    const videoBtns = document.querySelectorAll('.video-trigger');

    videoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const videoUrl = btn.getAttribute('data-video');
            if (modalIframe && videoUrl) {
                modalIframe.src = videoUrl;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
            if (modalIframe) modalIframe.src = '';
            document.body.style.overflow = '';
        }
    };

    modalClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Cortex Deep Dive Challenge Selector Logic
    const challengeTabs = document.querySelectorAll('.challenge-tab');
    const productCards = document.querySelectorAll('.product-focus-card');

    if (challengeTabs.length > 0) {
        challengeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);

                // Update tab state
                challengeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Dim others and highlight target
                productCards.forEach(card => {
                    if (card.id === targetId) {
                        card.classList.remove('dimmed');
                        card.style.transform = 'scale(1.02)';
                    } else {
                        card.classList.add('dimmed');
                        card.style.transform = 'scale(0.98)';
                    }
                });

                // Smooth scroll to target with offset for header
                if (targetEl) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // HubSpot Form Submission
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const data = {
                fields: [
                    { name: 'firstname', value: formData.get('firstname') },
                    { name: 'lastname', value: formData.get('lastname') },
                    { name: 'email', value: formData.get('email') },
                    { name: 'interest', value: formData.get('interest') }
                ],
                context: {
                    hutk: document.cookie.match(/hubspotutk=([^;]+)/)?.[1] || '',
                    pageUri: window.location.href,
                    pageName: document.title
                }
            };

            try {
                const response = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/342719804/a3f8fcb8-ac03-4f46-91bf-bde6eefcc261', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    formSuccess.classList.add('reveal');
                } else {
                    const errorData = await response.json();
                    console.error('HubSpot Error:', errorData);
                    alert('There was an error submitting the form. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } catch (error) {
                console.error('Submission Error:', error);
                alert('An unexpected error occurred. Please check your connection and try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

