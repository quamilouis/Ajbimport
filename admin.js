/* =========================================================
   AJB IMPORTS ADMIN JAVASCRIPT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           LOGIN
        ================================================= */

        const loginForm =
            document.getElementById(
                "adminLoginForm"
            );


        if (loginForm) {

            const password =
                document.getElementById(
                    "password"
                );

            const togglePassword =
                document.getElementById(
                    "togglePassword"
                );

            const loginButton =
                document.getElementById(
                    "loginButton"
                );

            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );


            /* =============================================
               PASSWORD VISIBILITY
            ============================================= */

            if (togglePassword) {

                togglePassword.addEventListener(
                    "click",
                    () => {

                        if (
                            password.type ===
                            "password"
                        ) {

                            password.type =
                                "text";

                            togglePassword.innerHTML =
                                '<i class="fa-solid fa-eye-slash"></i>';

                        } else {

                            password.type =
                                "password";

                            togglePassword.innerHTML =
                                '<i class="fa-solid fa-eye"></i>';

                        }

                    }
                );

            }


            /* =============================================
               LOGIN
            ============================================= */

            loginForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const email =
                        document
                            .getElementById("email")
                            .value
                            .trim();

                    const passwordValue =
                        password.value;


                    if (loginMessage) {

                        loginMessage.classList.remove(
                            "show"
                        );

                    }


                    loginButton.classList.add(
                        "loading"
                    );


                    loginButton.innerHTML =
                        `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Signing in...</span>
                        `;


                    try {

                        const response =
                            await fetch(
                                "/api/admin/login",
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email,
                                            password:
                                                passwordValue
                                        })
                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                result.message ||
                                "Login failed."
                            );

                        }


                        window.location.href =
                            result.redirect ||
                            "/admin/dashboard";


                    } catch (error) {

                        if (loginMessage) {

                            loginMessage.textContent =
                                error.message;

                            loginMessage.classList.add(
                                "show"
                            );

                        }


                        loginButton.classList.remove(
                            "loading"
                        );


                        loginButton.innerHTML =
                            `
                            <span>Sign In</span>
                            <i class="fa-solid fa-arrow-right"></i>
                            `;

                    }

                }
            );

            return;

        }



        /* =================================================
           DASHBOARD
        ================================================= */

        const dashboardSection =
            document.getElementById(
                "dashboardSection"
            );


        if (!dashboardSection) {

            return;

        }


        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const sidebarToggle =
            document.getElementById(
                "sidebarToggle"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        let quotes = [];



        /* =================================================
           VERIFY SESSION
        ================================================= */

        async function verifyAdmin() {

            try {

                const response =
                    await fetch(
                        "/api/admin/me"
                    );


                if (!response.ok) {

                    window.location.href =
                        "/admin/login";

                    return false;

                }


                const result =
                    await response.json();


                const email =
                    document.getElementById(
                        "adminEmail"
                    );


                if (email) {

                    email.textContent =
                        result.admin.email;

                }


                return true;

            } catch (error) {

                window.location.href =
                    "/admin/login";

                return false;

            }

        }



        /* =================================================
           NAVIGATION
        ================================================= */

        const navItems =
            document.querySelectorAll(
                ".nav-item[data-section]"
            );


        navItems.forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const section =
                        item.dataset.section;


                    navItems.forEach(nav => {

                        nav.classList.remove(
                            "active"
                        );

                    });


                    item.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".admin-section"
                        )
                        .forEach(sectionElement => {

                            sectionElement.classList.remove(
                                "active"
                            );

                        });


                    const target =
                        document.getElementById(
                            `${section}Section`
                        );


                    if (target) {

                        target.classList.add(
                            "active"
                        );

                    }


                    const pageTitle =
                        document.getElementById(
                            "pageTitle"
                        );


                    if (pageTitle) {

                        pageTitle.textContent =
                            section === "dashboard"
                                ? "Dashboard"
                                : section === "quotes"
                                ? "Quote Requests"
                                : "Services";

                    }


                    if (
                        window.innerWidth <=
                        800
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                    }

                }
            );

        });



        /* =================================================
           MOBILE SIDEBAR
        ================================================= */

        if (sidebarToggle) {

            sidebarToggle.addEventListener(
                "click",
                () => {

                    sidebar.classList.toggle(
                        "open"
                    );

                }
            );

        }



        /* =================================================
           LOAD QUOTES
        ================================================= */

        async function loadQuotes() {

            try {

                const response =
                    await fetch(
                        "/api/admin/quotes"
                    );


                if (
                    response.status ===
                    401
                ) {

                    window.location.href =
                        "/admin/login";

                    return;

                }


                const result =
                    await response.json();


                quotes =
                    result.quotes ||
                    [];


                renderRecentQuotes();

                renderQuotes();

                updateSidebarCount();

                loadStats();


            } catch (error) {

                console.error(
                    "Unable to load quotes:",
                    error
                );

            }

        }



        /* =================================================
           LOAD STATISTICS
        ================================================= */

        async function loadStats() {

            try {

                const response =
                    await fetch(
                        "/api/admin/stats"
                    );


                if (!response.ok) return;


                const result =
                    await response.json();


                const stats =
                    result.stats;


                document.getElementById(
                    "totalQuotes"
                ).textContent =
                    stats.total;


                document.getElementById(
                    "newQuotes"
                ).textContent =
                    stats.new;


                document.getElementById(
                    "contactedQuotes"
                ).textContent =
                    stats.contacted;


                document.getElementById(
                    "processingQuotes"
                ).textContent =
                    stats.processing;


                document.getElementById(
                    "completedQuotes"
                ).textContent =
                    stats.completed;


            } catch (error) {

                console.error(
                    error
                );

            }

        }



        /* =================================================
           RECENT QUOTES
        ================================================= */

        function renderRecentQuotes() {

            const table =
                document.getElementById(
                    "recentQuotesTable"
                );


            if (!table) return;


            const recent =
                quotes.slice(0, 5);


            if (!recent.length) {

                table.innerHTML =
                    `
                    <tr>
                        <td colspan="5">
                            No quote requests yet.
                        </td>
                    </tr>
                    `;

                return;

            }


            table.innerHTML =
                recent.map(
                    quote => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    quote.id
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                quote.fullName
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                quote.service
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                quote.origin
                            )}
                            →
                            ${escapeHTML(
                                quote.destination
                            )}
                        </td>

                        <td>

                            <span
                                class="status-select status-${escapeHTML(
                                    quote.status
                                )}"
                            >
                                ${escapeHTML(
                                    quote.status
                                )}
                            </span>

                        </td>

                    </tr>

                `
                )
                .join("");

        }



        /* =================================================
           ALL QUOTES
        ================================================= */

        function renderQuotes() {

            const table =
                document.getElementById(
                    "quotesTable"
                );


            if (!table) return;


            const searchInput =
                document.getElementById(
                    "quoteSearch"
                );


            const statusFilter =
                document.getElementById(
                    "statusFilter"
                );


            const search =
                searchInput
                    ? searchInput.value
                        .toLowerCase()
                    : "";


            const filter =
                statusFilter
                    ? statusFilter.value
                    : "all";


            const filtered =
                quotes.filter(
                    quote => {

                        const matchesSearch =
                            (
                                quote.fullName +
                                " " +
                                quote.id +
                                " " +
                                quote.service
                            )
                            .toLowerCase()
                            .includes(
                                search
                            );


                        const matchesStatus =
                            filter ===
                            "all" ||
                            quote.status ===
                            filter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );


            if (!filtered.length) {

                table.innerHTML =
                    `
                    <tr>
                        <td colspan="7">
                            No matching requests found.
                        </td>
                    </tr>
                    `;

                return;

            }


            table.innerHTML =
                filtered.map(
                    quote => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    quote.id
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                quote.fullName
                            )}
                            <br>

                            <small>
                                ${escapeHTML(
                                    quote.company ||
                                    ""
                                )}
                            </small>
                        </td>

                        <td>

                            ${escapeHTML(
                                quote.email
                            )}

                            <br>

                            ${escapeHTML(
                                quote.phone
                            )}

                        </td>

                        <td>
                            ${escapeHTML(
                                quote.service
                            )}
                        </td>

                        <td>

                            ${escapeHTML(
                                quote.origin
                            )}

                            →

                            ${escapeHTML(
                                quote.destination
                            )}

                        </td>

                        <td>
                            ${formatDate(
                                quote.createdAt
                            )}
                        </td>

                        <td>

                            <select
                                class="status-select status-${escapeHTML(
                                    quote.status
                                )}"
                                data-id="${escapeHTML(
                                    quote.id
                                )}"
                            >

                                ${statusOptions(
                                    quote.status
                                )}

                            </select>

                        </td>

                    </tr>

                `
                )
                .join("");


            table
                .querySelectorAll(
                    ".status-select"
                )
                .forEach(select => {

                    select.addEventListener(
                        "change",
                        () => {

                            updateStatus(
                                select.dataset.id,
                                select.value
                            );

                        }
                    );

                });

        }



        /* =================================================
           STATUS OPTIONS
        ================================================= */

        function statusOptions(
            current
        ) {

            const statuses = [
                "New",
                "Contacted",
                "Processing",
                "Completed",
                "Cancelled"
            ];


            return statuses.map(
                status => `

                    <option
                        value="${status}"
                        ${status === current
                            ? "selected"
                            : ""}
                    >
                        ${status}
                    </option>

                `
            ).join("");

        }



        /* =================================================
           UPDATE STATUS
        ================================================= */

        async function updateStatus(
            id,
            status
        ) {

            try {

                const response =
                    await fetch(
                        `/api/admin/quotes/${encodeURIComponent(id)}`,
                        {
                            method:
                                "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    status
                                })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to update status."
                    );

                }


                const quote =
                    quotes.find(
                        item =>
                            item.id == id
                    );


                if (quote) {

                    quote.status =
                        status;

                }


                renderQuotes();

                renderRecentQuotes();

                updateSidebarCount();

                loadStats();


            } catch (error) {

                alert(
                    error.message
                );

            }

        }



        /* =================================================
           SIDEBAR COUNT
        ================================================= */

        function updateSidebarCount() {

            const count =
                document.getElementById(
                    "sidebarQuoteCount"
                );


            if (!count) return;


            count.textContent =
                quotes.filter(
                    quote =>
                        quote.status ===
                        "New"
                ).length;

        }



        /* =================================================
           SEARCH
        ================================================= */

        const quoteSearch =
            document.getElementById(
                "quoteSearch"
            );


        if (quoteSearch) {

            quoteSearch.addEventListener(
                "input",
                renderQuotes
            );

        }


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderQuotes
            );

        }



        /* =================================================
           VIEW ALL
        ================================================= */

        const viewAll =
            document.getElementById(
                "viewAllQuotes"
            );


        if (viewAll) {

            viewAll.addEventListener(
                "click",
                () => {

                    document
                        .querySelector(
                            '[data-section="quotes"]'
                        )
                        .click();

                }
            );

        }



        /* =================================================
           LOGOUT
        ================================================= */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        await fetch(
                            "/api/admin/logout",
                            {
                                method:
                                    "POST"
                            }
                        );

                    } finally {

                        window.location.href =
                            "/admin/login";

                    }

                }
            );

        }



        /* =================================================
           SECURITY HELPER
        ================================================= */

        function escapeHTML(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }



        /* =================================================
           DATE FORMAT
        ================================================= */

        function formatDate(
            date
        ) {

            if (!date) return "-";


            return new Date(date)
                .toLocaleDateString(
                    "en-GH",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }



        /* =================================================
           START DASHBOARD
        ================================================= */

        verifyAdmin()
            .then(
                authenticated => {

                    if (
                        authenticated
                    ) {

                        loadQuotes();

                    }

                }
            );

    }
);