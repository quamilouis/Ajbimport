/* =========================================
   AJB IMPORT JAVASCRIPT
========================================= */


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



    /* =====================================
       MOBILE MENU
    ===================================== */

    const mobileMenuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );


    const mobileNavigation =
        document.getElementById(
            "mobileNavigation"
        );


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


    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const mobileNavigation =
        document.getElementById("mobileNavigation");


    if (menuButton && mobileNavigation) {

        menuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileNavigation.classList.toggle("active");

                menuButton.classList.toggle("active", isOpen);
                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
                menuButton.setAttribute(
                    "aria-label",
                    isOpen ? "Close navigation" : "Open navigation"
                );

            }
        );


        mobileNavigation
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileNavigation.classList.remove(
                            "active"
                        );

                        menuButton.classList.remove(
                            "active"
                        );

                    }
                );

            });

    }


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
