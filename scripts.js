/* =========================================
   AJB IMPORT JAVASCRIPT
========================================= */


function setMobileMenuState(menuButton, mobileNavigation, isOpen) {
    if (!menuButton || !mobileNavigation) return;

    menuButton.classList.toggle("active", isOpen);
    mobileNavigation.classList.toggle("active", isOpen);
    mobileNavigation.style.opacity = isOpen ? "1" : "0";
    mobileNavigation.style.visibility = isOpen ? "visible" : "hidden";
    mobileNavigation.style.transform = isOpen ? "translateY(0)" : "translateY(-10px)";
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

function initMobileMenu() {
    if (window.__AJB_MOBILE_MENU_INIT__) return;
    window.__AJB_MOBILE_MENU_INIT__ = true;

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNavigation = document.getElementById("mobileNavigation");

    if (!mobileMenuBtn || !mobileNavigation || mobileMenuBtn.dataset.mobileMenuBound === "true") {
        return;
    }

    mobileMenuBtn.dataset.mobileMenuBound = "true";

    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = !mobileMenuBtn.classList.contains("active");
        setMobileMenuState(mobileMenuBtn, mobileNavigation, isOpen);
    });

    mobileNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMobileMenuState(mobileMenuBtn, mobileNavigation, false);
        });
    });

    setMobileMenuState(mobileMenuBtn, mobileNavigation, false);
}

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================
       PRELOADER
    ===================================== */

    const preloader =
        document.querySelector(".preloader");


    window.addEventListener("load", () => {

        setTimeout(() => {

           if (preloader) {
               preloader.classList.add("hide");
           }

       }, 500);

    });



    /* =====================================
       HEADER SCROLL EFFECT
    ===================================== */

    const header =
       document.querySelector(".header");


    const handleHeaderScroll = () => {

       if (!header) return;

       if (window.scrollY > 50) {

           header.classList.add("scrolled");

       } else {

           header.classList.remove("scrolled");

       }

    };


    window.addEventListener(
       "scroll",
       handleHeaderScroll
    );


    handleHeaderScroll();

    initMobileMenu();


    /* =====================================
       CURRENT YEAR
    ===================================== */

    const currentYear =
        document.getElementById(
            "currentYear"
        );


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }



    /* =====================================
       SMOOTH SCROLL
    ===================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                function (event) {

                    const target =
                        document.querySelector(
                            this.getAttribute("href")
                        );

                    if (target) {

                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });



    /* =====================================
       REVEAL ANIMATIONS
    ===================================== */

    const revealElements =
        document.querySelectorAll(
            ".service-card, .feature, .about-content, .about-images, .process-content"
        );


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "revealed"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        element.classList.add("reveal");

        revealObserver.observe(element);

    });

});

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       PRELOADER
    ===================================== */

    const preloader =
        document.querySelector(".preloader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            if (preloader) {
                preloader.classList.add("hide");
            }

        }, 400);

    });

    /* =====================================
       HEADER
    ===================================== */

    const header =
        document.getElementById("header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();


    initMobileMenu();


    /* =====================================
       YEAR
    ===================================== */

    const year =
        document.getElementById("currentYear");

    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    /* =====================================
       SMOOTH SCROLL
    ===================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                function(event) {

                    const targetID =
                        this.getAttribute("href");

                    if (
                        !targetID ||
                        targetID === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetID
                        );

                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        });


    /* =====================================
       QUOTE FORM
    ===================================== */

    const quoteForm =
        document.getElementById("quoteForm");

    const formSuccess =
        document.getElementById("formSuccess");

    const formStatus =
        document.getElementById("formStatus");

    const submitButton =
        document.getElementById("submitQuote");


    if (quoteForm) {


        function clearErrors() {

            quoteForm
                .querySelectorAll(".form-group")
                .forEach(group => {

                    group.classList.remove(
                        "invalid"
                    );

                });

            if (formStatus) {

                formStatus.classList.remove(
                    "show"
                );

            }

        }


        function showError(input, message) {

            const group =
                input.closest(".form-group");

            if (!group) return;

            group.classList.add("invalid");

            const error =
                group.querySelector(".field-error");

            if (error) {

                error.textContent =
                    message;

            }

        }


        function validateForm() {

            clearErrors();

            let valid = true;


            const requiredFields = [
                {
                    id: "fullName",
                    message: "Please enter your name."
                },
                {
                    id: "email",
                    message: "Please enter a valid email."
                },
                {
                    id: "phone",
                    message: "Please enter your phone number."
                },
                {
                    id: "service",
                    message: "Please select a service."
                },
                {
                    id: "origin",
                    message: "Please enter the shipment origin."
                },
                {
                    id: "destination",
                    message: "Please enter the destination."
                },
                {
                    id: "message",
                    message: "Please tell us about your shipment."
                }
            ];


            requiredFields.forEach(field => {

                const input =
                    document.getElementById(
                        field.id
                    );

                if (!input) return;


                if (!input.value.trim()) {

                    showError(
                        input,
                        field.message
                    );

                    valid = false;

                }

            });


            const email =
                document.getElementById("email");


            if (
                email &&
                email.value.trim()
            ) {

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(
                        email.value.trim()
                    )
                ) {

                    showError(
                        email,
                        "Please enter a valid email address."
                    );

                    valid = false;

                }

            }


            return valid;

        }

        // Quote form submit handler
        quoteForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!validateForm()) return;

            const enquiry = {
                fullName: (document.getElementById("fullName") || {}).value || "",
                company: (document.getElementById("company") || {}).value || "",
                email: (document.getElementById("email") || {}).value || "",
                phone: (document.getElementById("phone") || {}).value || "",
                service: (document.getElementById("service") || {}).value || "",
                origin: (document.getElementById("origin") || {}).value || "",
                destination: (document.getElementById("destination") || {}).value || "",
                cargoType: (document.getElementById("cargoType") || {}).value || "",
                cargoWeight: (document.getElementById("cargoWeight") || {}).value || "",
                cargoVolume: (document.getElementById("cargoVolume") || {}).value || "",
                shippingDate: (document.getElementById("shippingDate") || {}).value || "",
                message: (document.getElementById("message") || {}).value || ""
            };

            const isLocalPreview =
                window.location.protocol === "file:" ||
                ((window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1") &&
                    window.location.port !== "3000");

            const apiBaseUrl =
                isLocalPreview
                    ? "http://127.0.0.1:3000"
                    : "";

            if (submitButton) submitButton.disabled = true;
            try {
                const response = await fetch(`${apiBaseUrl}/api/quote`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(enquiry)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Unable to submit your quote request.");
                }

                if (formSuccess) {
                    formSuccess.classList.add("show");
                    formSuccess.textContent = "Your request has been submitted. We will contact you shortly.";
                }

                quoteForm.reset();

            } catch (error) {
                if (formStatus) {
                    formStatus.textContent = isLocalPreview
                        ? "Unable to connect to the quote server. Open the site at http://127.0.0.1:3000 and try again."
                        : ((error && error.message) || "Something went wrong. Please try again.");
                    formStatus.classList.add("show");
                }
            } finally {
                if (submitButton) submitButton.disabled = false;
            }

        });

    }

    /* =====================================
       SCROLL REVEAL
    ===================================== */

    const revealElements =
        document.querySelectorAll(
            ".service-card, " +
            ".service-detail-card, " +
            ".serve-card, " +
            ".value-card, " +
            ".mission-card, " +
            ".contact-info, " +
            ".quote-form-wrapper"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "revealed"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.1
                }
            );


        revealElements.forEach(element => {

            element.classList.add(
                "reveal"
            );

            observer.observe(
                element
            );

        });

    }

});


/* =====================================================
   TESTIMONIAL CAROUSEL
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const testimonialCards =
            document.querySelectorAll(
                ".testimonial-card"
            );

        const prevButton =
            document.getElementById(
                "testimonialPrev"
            );

        const nextButton =
            document.getElementById(
                "testimonialNext"
            );

        const dotsContainer =
            document.getElementById(
                "testimonialDots"
            );


        // Stop if testimonials aren't
        // on the current page.

        if (
            !testimonialCards.length ||
            !dotsContainer
        ) {

            return;

        }


        let currentSlide = 0;

        let autoplay;


        /* =================================================
           CREATE DOTS
        ================================================= */

        testimonialCards.forEach(
            (card, index) => {

                const dot =
                    document.createElement(
                        "button"
                    );

                dot.className =
                    "testimonial-dot";

                dot.setAttribute(
                    "aria-label",
                    `Go to testimonial ${index + 1}`
                );


                if (index === 0) {

                    dot.classList.add(
                        "active"
                    );

                }


                dot.addEventListener(
                    "click",
                    () => {

                        goToSlide(index);

                        restartAutoplay();

                    }
                );


                dotsContainer.appendChild(
                    dot
                );

            }
        );


        const dots =
            dotsContainer.querySelectorAll(
                ".testimonial-dot"
            );


        /* =================================================
           SHOW SLIDE
        ================================================= */

        function goToSlide(index) {

            if (
                index < 0
            ) {

                index =
                    testimonialCards.length - 1;

            }


            if (
                index >=
                testimonialCards.length
            ) {

                index = 0;

            }


            testimonialCards.forEach(
                (card, cardIndex) => {

                    card.classList.toggle(
                        "active",
                        cardIndex === index
                    );

                }
            );


            dots.forEach(
                (dot, dotIndex) => {

                    dot.classList.toggle(
                        "active",
                        dotIndex === index
                    );

                }
            );


            currentSlide = index;

        }


        /* =================================================
           NEXT
        ================================================= */

        function nextSlide() {

            goToSlide(
                currentSlide + 1
            );

        }


        /* =================================================
           PREVIOUS
        ================================================= */

        function previousSlide() {

            goToSlide(
                currentSlide - 1
            );

        }


        /* =================================================
           BUTTON EVENTS
        ================================================= */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    nextSlide();

                    restartAutoplay();

                }
            );

        }


        if (prevButton) {

            prevButton.addEventListener(
                "click",
                () => {

                    previousSlide();

                    restartAutoplay();

                }
            );

        }


        /* =================================================
           AUTOPLAY
        ================================================= */

        function startAutoplay() {

            autoplay =
                setInterval(
                    () => {

                        nextSlide();

                    },
                    6000
                );

        }


        function restartAutoplay() {

            clearInterval(
                autoplay
            );

            startAutoplay();

        }


        startAutoplay();


        /* =================================================
           PAUSE ON HOVER
        ================================================= */

        const carousel =
            document.querySelector(
                ".testimonial-carousel"
            );


        if (carousel) {

            carousel.addEventListener(
                "mouseenter",
                () => {

                    clearInterval(
                        autoplay
                    );

                }
            );


            carousel.addEventListener(
                "mouseleave",
                () => {

                    startAutoplay();

                }
            );

        }


        /* =================================================
           TOUCH / SWIPE SUPPORT
        ================================================= */

        let touchStartX = 0;

        let touchEndX = 0;


        if (carousel) {

            carousel.addEventListener(
                "touchstart",
                event => {

                    touchStartX =
                        event.changedTouches[0]
                            .screenX;

                },
                {
                    passive: true
                }
            );


            carousel.addEventListener(
                "touchend",
                event => {

                    touchEndX =
                        event.changedTouches[0]
                            .screenX;


                    handleSwipe();

                },
                {
                    passive: true
                }
            );

        }


        function handleSwipe() {

            const swipeDistance =
                touchEndX -
                touchStartX;


            if (
                Math.abs(
                    swipeDistance
                ) < 50
            ) {

                return;

            }


            if (
                swipeDistance < 0
            ) {

                nextSlide();

            } else {

                previousSlide();

            }


            restartAutoplay();

        }

    }
);

/* =====================================================
   COASTBRIDGE LOGISTICS GHANA
   LEGAL PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {


    /* =================================================
       ELEMENTS
    ================================================= */

    const header =
        document.getElementById("legalHeader");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileNav =
        document.getElementById("mobileNav");

    const backToTop =
        document.getElementById("backToTop");

    const currentYear =
        document.getElementById("currentYear");


    /* =================================================
       CURRENT YEAR
    ================================================= */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =================================================
       HEADER SCROLL
    ================================================= */

    function handleHeaderScroll() {

        if (!header) return;

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }


    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        { passive: true }
    );


    handleHeaderScroll();


    /* =================================================
       MOBILE MENU
    ================================================= */

    if (
        mobileMenuButton &&
        mobileNav
    ) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileNav.classList.toggle("active");


                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                const icon =
                    mobileMenuButton.querySelector("i");


                if (icon) {

                    icon.className =
                        isOpen
                            ? "fa-solid fa-xmark"
                            : "fa-solid fa-bars";

                }

            }
        );


        mobileNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileNav.classList.remove(
                            "active"
                        );


                        mobileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        const icon =
                            mobileMenuButton.querySelector("i");


                        if (icon) {

                            icon.className =
                                "fa-solid fa-bars";

                        }

                    }
                );

            });

    }


    /* =================================================
       SMOOTH INTERNAL NAVIGATION
    ================================================= */

    document
        .querySelectorAll(
            '.toc a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const targetPosition =
                        target.getBoundingClientRect().top
                        +
                        window.scrollY
                        -
                        headerHeight
                        -
                        20;


                    window.scrollTo({

                        top:
                            targetPosition,

                        behavior:
                            "smooth"

                    });

                }
            );

        });


    /* =================================================
       ACTIVE TABLE OF CONTENTS
    ================================================= */

    const toc =
        document.querySelector(".toc");


    if (toc) {

        const tocLinks =
            Array.from(
                toc.querySelectorAll(
                    'a[href^="#"]'
                )
            );


        const sections =
            tocLinks
                .map(link => {

                    const id =
                        link.getAttribute("href");


                    return document.querySelector(id);

                })
                .filter(Boolean);


        function updateActiveToc() {

            if (!sections.length) {
                return;
            }


            const scrollPosition =
                window.scrollY
                +
                (
                    header
                        ? header.offsetHeight
                        : 0
                )
                +
                100;


            let currentSection =
                sections[0];


            sections.forEach(section => {

                if (
                    section.offsetTop <=
                    scrollPosition
                ) {

                    currentSection =
                        section;

                }

            });


            tocLinks.forEach(link => {

                link.classList.remove(
                    "active"
                );

            });


            const activeLink =
                tocLinks.find(link => {

                    return (
                        link.getAttribute("href")
                        ===
                        `#${currentSection.id}`
                    );

                });


            if (activeLink) {

                activeLink.classList.add(
                    "active"
                );


                /*
                 * Keep the active item
                 * visible inside sidebar.
                 */

                const tocRect =
                    toc.getBoundingClientRect();

                const linkRect =
                    activeLink.getBoundingClientRect();


                if (
                    linkRect.top <
                    tocRect.top
                ) {

                    toc.scrollTop -=
                        tocRect.top -
                        linkRect.top;

                }


                if (
                    linkRect.bottom >
                    tocRect.bottom
                ) {

                    toc.scrollTop +=
                        linkRect.bottom -
                        tocRect.bottom;

                }

            }

        }


        window.addEventListener(
            "scroll",
            updateActiveToc,
            { passive: true }
        );


        updateActiveToc();

    }


    /* =================================================
       SCROLL REVEAL
    ================================================= */

    const sections =
        document.querySelectorAll(
            ".legal-section"
        );


    if (
        "IntersectionObserver"
        in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "revealed"
                                );


                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.08
                }
            );


        sections.forEach(section => {

            revealObserver.observe(
                section
            );

        });

    } else {

        sections.forEach(section => {

            section.classList.add(
                "revealed"
            );

        });

    }


    /* =================================================
       BACK TO TOP
    ================================================= */

    function updateBackToTop() {

        if (!backToTop) {
            return;
        }


        if (window.scrollY > 500) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );


    updateBackToTop();


    if (backToTop) {

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                mobileNav
            ) {

                mobileNav.classList.remove(
                    "active"
                );


                if (mobileMenuButton) {

                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    const icon =
                        mobileMenuButton.querySelector(
                            "i"
                        );


                    if (icon) {

                        icon.className =
                            "fa-solid fa-bars";

                    }

                }

            }

        }
    );


    /* =================================================
       CLOSE MOBILE NAV WHEN CLICKING OUTSIDE
    ================================================= */

    document.addEventListener(
        "click",
        event => {

            if (
                !mobileNav ||
                !mobileMenuButton
            ) {
                return;
            }


            if (
                !mobileNav.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            const clickedInsideNav =
                mobileNav.contains(
                    event.target
                );


            const clickedButton =
                mobileMenuButton.contains(
                    event.target
                );


            if (
                !clickedInsideNav &&
                !clickedButton
            ) {

                mobileNav.classList.remove(
                    "active"
                );


                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    mobileMenuButton.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        "fa-solid fa-bars";

                }

            }

        }
    );


    /* =================================================
       EXTERNAL HASH ON PAGE LOAD
    ================================================= */

    if (
        window.location.hash
    ) {

        setTimeout(() => {

            const target =
                document.querySelector(
                    window.location.hash
                );


            if (target) {

                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                window.scrollTo({

                    top:
                        target.offsetTop
                        -
                        headerHeight
                        -
                        20,

                    behavior:
                        "smooth"

                });

            }

        }, 300);

    }


    /* =================================================
       PRINT SUPPORT
    ================================================= */

    document
        .querySelectorAll(
            "[data-print]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    window.print();

                }
            );

        });


    /* =================================================
       PAGE READY
    ================================================= */

    document.body.classList.add(
        "legal-page-ready"
    );

});

/* =========================================
   AJB IMPORT
   BLOG + SUBSCRIPTION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const blogGrid =
        document.getElementById("blogGrid");

    const featuredArticle =
        document.getElementById("featuredArticle");

    const searchInput =
        document.getElementById("blogSearch");

    const categoryButtons =
        document.querySelectorAll(".category-btn");

    const noArticles =
        document.getElementById("noArticles");

    const newsletterForm =
        document.getElementById("newsletterForm");

    const subscriptionMessage =
        document.getElementById(
            "subscriptionMessage"
        );

    const subscribeBtn =
        document.getElementById("subscribeBtn");


    let articles = [];

    let currentCategory = "all";


    initMobileMenu();


    /* =====================================
       LOAD BLOG
    ===================================== */

    async function loadArticles() {

        try {

            const response =
                await fetch("/api/blog");

            if (!response.ok) {
                throw new Error(
                    "Unable to load articles."
                );
            }

            articles =
                await response.json();

            renderArticles();

        } catch (error) {

            console.error(error);

            blogGrid.innerHTML = `
                <div class="blog-loading">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <p>
                        Unable to load articles.
                        Please try again later.
                    </p>
                </div>
            `;

        }

    }


    /* =====================================
       RENDER
    ===================================== */

    function renderArticles() {

        const search =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        let filtered =
            articles.filter(article => {

                const matchesCategory =
                    currentCategory === "all" ||
                    article.category ===
                        currentCategory;

                const matchesSearch =
                    !search ||
                    article.title
                        .toLowerCase()
                        .includes(search) ||
                    article.excerpt
                        .toLowerCase()
                        .includes(search);

                return (
                    matchesCategory &&
                    matchesSearch
                );

            });


        renderFeatured(filtered);

        renderGrid(filtered);

    }


    /* =====================================
       FEATURED
    ===================================== */

    function renderFeatured(list) {

        const featured =
            list.find(
                article => article.featured
            ) || list[0];


        if (!featured) {

            featuredArticle.innerHTML = "";

            return;

        }


        featuredArticle.innerHTML = `

            <article class="featured-card">

                <div
                    class="featured-image"
                    style="
                        background-image:
                        url('${escapeHTML(
                            featured.image
                        )}')
                    "
                ></div>

                <div class="featured-content">

                    <span class="article-category">
                        ${escapeHTML(
                            featured.categoryLabel
                        )}
                    </span>

                    <h2>
                        ${escapeHTML(
                            featured.title
                        )}
                    </h2>

                    <p class="article-excerpt">
                        ${escapeHTML(
                            featured.excerpt
                        )}
                    </p>

                    <div class="article-meta">

                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${formatDate(
                                featured.date
                            )}
                        </span>

                        <span>
                            <i class="fa-regular fa-user"></i>
                            ${escapeHTML(
                                featured.author
                            )}
                        </span>

                    </div>

                    <a
                        class="read-more"
                        href="
                            article.html?slug=
                            ${encodeURIComponent(
                                featured.slug
                            )}
                        "
                    >
                        Read Full Article
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>

                </div>

            </article>

        `;

    }


    /* =====================================
       GRID
    ===================================== */

    function renderGrid(list) {

        const nonFeatured =
            list.filter(
                article =>
                    !article.featured
            );


        if (!nonFeatured.length) {

            blogGrid.innerHTML = "";

            noArticles.style.display =
                list.length
                    ? "none"
                    : "block";

            return;

        }


        noArticles.style.display = "none";


        blogGrid.innerHTML =
            nonFeatured.map(
                article => `

                <article class="blog-card">

                    <div
                        class="blog-image"
                        style="
                            background-image:
                            url('${escapeHTML(
                                article.image
                            )}')
                        "
                    ></div>

                    <div class="blog-card-content">

                        <span class="article-category">
                            ${escapeHTML(
                                article.categoryLabel
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                article.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                article.excerpt
                            )}
                        </p>

                        <div class="article-meta">

                            <span>
                                ${formatDate(
                                    article.date
                                )}
                            </span>

                        </div>

                        <a
                            href="
                                article.html?slug=
                                ${encodeURIComponent(
                                    article.slug
                                )}
                            "
                            class="read-more"
                        >
                            Read More
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>

                    </div>

                </article>

            `
            ).join("");

    }


    /* =====================================
       CATEGORY FILTER
    ===================================== */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add("active");

                currentCategory =
                    button.dataset.category;

                renderArticles();

            }
        );

    });


    /* =====================================
       SEARCH
    ===================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderArticles
        );

    }


    /* =====================================
       SUBSCRIBE
    ===================================== */

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const formData =
                    new FormData(
                        newsletterForm
                    );


                const data = {

                    name:
                        formData.get("name"),

                    email:
                        formData.get("email")

                };


                subscribeBtn.disabled = true;


                const buttonText =
                    subscribeBtn.querySelector(
                        "span"
                    );

                if (buttonText) {
                    buttonText.textContent =
                        "Subscribing...";
                }


                try {

                    const response =
                        await fetch(
                            "/api/subscribe",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Subscription failed."
                        );

                    }


                    newsletterForm.reset();


                    subscriptionMessage.textContent =
                        result.message ||
                        "You have successfully subscribed to AJB Import.";

                    subscriptionMessage.style.display =
                        "block";


                } catch (error) {

                    subscriptionMessage.textContent =
                        error.message;

                    subscriptionMessage.style.display =
                        "block";

                } finally {

                    subscribeBtn.disabled =
                        false;

                    if (buttonText) {

                        buttonText.textContent =
                            "Subscribe";

                    }

                }

            }
        );

    }


    /* =====================================
       HELPERS
    ===================================== */

    function formatDate(date) {

        return new Date(date)
            .toLocaleDateString(
                "en-GH",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    function escapeHTML(value) {

        if (!value) return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    loadArticles();

    const articleDetail = document.getElementById("articleDetail");

    if (articleDetail) {
        loadArticleDetail();
    }

});

async function loadArticleDetail() {
    const articleDetail = document.getElementById("articleDetail");
    const articleBreadcrumb = document.getElementById("articleBreadcrumb");

    if (!articleDetail) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        articleDetail.innerHTML = `
            <div class="article-not-found">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h2>Article not found</h2>
                <p>The requested article could not be loaded.</p>
                <a href="blog.html" class="article-back-link">Back to blog</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`);

        if (!response.ok) {
            throw new Error("Article not found.");
        }

        const article = await response.json();

        if (articleBreadcrumb) {
            articleBreadcrumb.textContent = article.title || "Article";
        }

        const content = article.content || "";
        const formattedContent = content
            .replace(/\n{3,}/g, "</p><p>")
            .replace(/\n/g, "<br>")
            .trim();

        articleDetail.innerHTML = `
            <div class="article-hero-image" style="background-image: url('${escapeHTML(article.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=80')}')"></div>

            <header class="article-header">
                <span class="article-category">${escapeHTML(article.categoryLabel || 'Company News')}</span>
                <h1>${escapeHTML(article.title || 'AJB Import Article')}</h1>
                <div class="article-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${formatDate(article.date || article.createdAt || new Date().toISOString())}</span>
                    <span><i class="fa-regular fa-user"></i> ${escapeHTML(article.author || 'AJB Imports')}</span>
                </div>
            </header>

            <div class="article-body">
                <div class="article-summary">
                    <p>${escapeHTML(article.excerpt || 'Read more from AJB Imports.')}</p>
                </div>

                <div class="article-content">
                    ${formattedContent ? `<p>${formattedContent}</p>` : '<p>Read the latest update from AJB Imports.</p>'}
                </div>

                <div class="article-actions">
                    <a href="blog.html" class="article-back-link">
                        <i class="fa-solid fa-arrow-left"></i>
                        Back to blog
                    </a>
                </div>
            </div>
        `;

    } catch (error) {
        articleDetail.innerHTML = `
            <div class="article-not-found">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h2>Article not found</h2>
                <p>${escapeHTML(error.message || 'The requested article could not be loaded.')}</p>
                <a href="blog.html" class="article-back-link">Back to blog</a>
            </div>
        `;
    }
}

/* =========================================
   BLOG HERO IMAGE CAROUSEL
========================================= */

const heroSlides =
    document.querySelectorAll(
        ".blog-hero-slide"
    );

const heroDots =
    document.querySelectorAll(
        ".hero-dot"
    );

let heroCurrentSlide = 0;

let heroAutoplay;


/* =========================================
   SHOW HERO SLIDE
========================================= */

function showHeroSlide(index) {

    if (!heroSlides.length) {
        return;
    }

    if (index >= heroSlides.length) {
        index = 0;
    }

    if (index < 0) {
        index = heroSlides.length - 1;
    }


    heroSlides.forEach(
        (slide, slideIndex) => {

            slide.classList.toggle(
                "active",
                slideIndex === index
            );

        }
    );


    heroDots.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === index
            );

        }
    );


    heroCurrentSlide = index;

}


/* =========================================
   NEXT SLIDE
========================================= */

function nextHeroSlide() {

    showHeroSlide(
        heroCurrentSlide + 1
    );

}


/* =========================================
   AUTOPLAY
========================================= */

function startHeroAutoplay() {

    heroAutoplay =
        setInterval(
            nextHeroSlide,
            5000
        );

}


/* =========================================
   RESTART AUTOPLAY
========================================= */

function restartHeroAutoplay() {

    clearInterval(heroAutoplay);

    startHeroAutoplay();

}


/* =========================================
   DOT NAVIGATION
========================================= */

heroDots.forEach(
    (dot, index) => {

        dot.addEventListener(
            "click",
            () => {

                showHeroSlide(index);

                restartHeroAutoplay();

            }
        );

    }
);


/* =========================================
   START
========================================= */

if (heroSlides.length) {

    showHeroSlide(0);

    startHeroAutoplay();

}