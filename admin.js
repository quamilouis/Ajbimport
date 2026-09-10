/* =========================================================
   AJB IMPORTS ADMIN JAVASCRIPT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


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

        let statusChart = null;

        let activityChart = null;

        let servicesChart = null;

        let routesChart = null;



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


                const text =
                    await response.text();


                if (!text.trim()) {

                    window.location.href =
                        "/admin/login";

                    return false;

                }


                let result;

                try {

                    result =
                        JSON.parse(text);

                } catch (parseError) {

                    console.error(
                        "Invalid admin response:",
                        text
                    );

                    window.location.href =
                        "/admin/login";

                    return false;

                }


                const email =
                    document.getElementById(
                        "adminEmail"
                    );


                if (email) {

                    email.textContent =
                        result.admin?.email ||
                        "Administrator";

                }


                return true;

            } catch (error) {

                console.error(
                    "Admin verification failed:",
                    error
                );

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
                                : section === "blog"
                                ? "Blog Posts"
                                : section === "subscribers"
                                ? "Newsletter Subscribers"
                                : "Services";

                    }

                    if (section === "subscribers") {

                        loadSubscribers();

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


                const text =
                    await response.text();


                if (!text.trim()) {

                    quotes = [];

                    renderRecentQuotes();

                    renderQuotes();

                    updateSidebarCount();

                    loadStats();

                    calculateMetrics();

                    updateCharts();

                    return;

                }


                let result;

                try {

                    result =
                        JSON.parse(text);

                } catch (parseError) {

                    console.error(
                        "Invalid quotes response:",
                        text
                    );

                    quotes = [];

                    renderRecentQuotes();

                    renderQuotes();

                    updateSidebarCount();

                    loadStats();

                    calculateMetrics();

                    updateCharts();

                    return;

                }


                quotes =
                    result.quotes ||
                    [];


                renderRecentQuotes();

                renderQuotes();

                updateSidebarCount();

                loadStats();

                calculateMetrics();

                updateCharts();


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


                const text =
                    await response.text();


                if (!text.trim()) return;


                let result;

                try {

                    result =
                        JSON.parse(text);

                } catch (parseError) {

                    console.error(
                        "Invalid stats response:",
                        text
                    );

                    return;

                }


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
                            <div class="quote-message-preview">
                                ${escapeHTML(
                                    (quote.message || "No message provided.").slice(0, 90)
                                )}${(quote.message || "").length > 90 ? "..." : ""}
                            </div>
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
                            <div class="quote-message-preview">
                                ${escapeHTML(
                                    (quote.message || "No message provided.").slice(0, 120)
                                )}${(quote.message || "").length > 120 ? "..." : ""}
                            </div>
                            <a
                                href="mailto:${escapeHTML(
                                    quote.email
                                )}?subject=${encodeURIComponent(`Re: Quote Request #${quote.id}`)}"
                                class="quote-reply-link"
                            >
                                Reply
                            </a>
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

                calculateMetrics();

                updateCharts();


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
           CHARTS
        ================================================= */

        function initCharts() {

            const statusCtx =
                document.getElementById(
                    "statusChart"
                );


            if (statusCtx) {

                statusChart =
                    new Chart(statusCtx, {

                        type: "doughnut",

                        data: {

                            labels: [
                                "New",
                                "Contacted",
                                "Processing",
                                "Completed",
                                "Cancelled"
                            ],

                            datasets: [{

                                data: [0, 0, 0, 0, 0],

                                backgroundColor: [
                                    "#f4b400",
                                    "#0d3552",
                                    "#4285f4",
                                    "#188038",
                                    "#b42318"
                                ],

                                borderWidth: 2,

                                borderColor: "#fff"

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio: false,

                            plugins: {

                                legend: {

                                    position: "bottom",

                                    labels: {

                                        padding: 16,

                                        usePointStyle: true,

                                        font: {

                                            size: 12

                                        }

                                    }

                                }

                            }

                        }

                    });

            }


            const activityCtx =
                document.getElementById(
                    "activityChart"
                );


            if (activityCtx) {

                activityChart =
                    new Chart(activityCtx, {

                        type: "line",

                        data: {

                            labels: [],

                            datasets: [{

                                label:
                                    "Submissions",

                                data: [],

                                borderColor:
                                    "#f4b400",

                                backgroundColor:
                                    "rgba(244, 180, 0, 0.1)",

                                fill: true,

                                tension: 0.4,

                                pointRadius: 4,

                                pointBackgroundColor:
                                    "#f4b400"

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            scales: {

                                x: {

                                    grid: {

                                        display: false

                                    },

                                    ticks: {

                                        font: {

                                            size: 11

                                        }

                                    }

                                },

                                y: {

                                    beginAtZero: true,

                                    ticks: {

                                        stepSize: 1,

                                        font: {

                                            size: 11

                                        }

                                    }

                                }

                            },

                            plugins: {

                                legend: {

                                    display: false

                                }

                            }

                        }

                    });

            }


            const servicesCtx =
                document.getElementById(
                    "servicesChart"
                );


            if (servicesCtx) {

                servicesChart =
                    new Chart(servicesCtx, {

                        type: "bar",

                        data: {

                            labels: [],

                            datasets: [{

                                label:
                                    "Requests",

                                data: [],

                                backgroundColor:
                                    "#0d3552",

                                borderRadius: 6

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            indexAxis: "y",

                            scales: {

                                x: {

                                    beginAtZero: true,

                                    ticks: {

                                        stepSize: 1,

                                        font: {

                                            size: 11

                                        }

                                    }

                                },

                                y: {

                                    grid: {

                                        display: false

                                    },

                                    ticks: {

                                        font: {

                                            size: 11

                                        }

                                    }

                                }

                            },

                            plugins: {

                                legend: {

                                    display: false

                                }

                            }

                        }

                    });

            }


            const routesCtx =
                document.getElementById(
                    "routesChart"
                );


            if (routesCtx) {

                routesChart =
                    new Chart(routesCtx, {

                        type: "bar",

                        data: {

                            labels: [],

                            datasets: [{

                                label:
                                    "Requests",

                                data: [],

                                backgroundColor:
                                    "#f4b400",

                                borderRadius: 6

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            scales: {

                                x: {

                                    grid: {

                                        display: false

                                    },

                                    ticks: {

                                        font: {

                                            size: 11

                                        }

                                    }

                                },

                                y: {

                                    beginAtZero: true,

                                    ticks: {

                                        stepSize: 1,

                                        font: {

                                            size: 11

                                        }

                                    }

                                }

                            },

                            plugins: {

                                legend: {

                                    display: false

                                }

                            }

                        }

                    });

            }

        }


        function updateCharts() {

            if (statusChart) {

                const counts = {

                    "New": 0,

                    "Contacted": 0,

                    "Processing": 0,

                    "Completed": 0,

                    "Cancelled": 0

                };


                quotes.forEach(quote => {

                    if (counts[quote.status] !==
                        undefined) {

                        counts[quote.status]++;

                    }

                });


                statusChart.data.datasets[0].data =
                    Object.values(counts);

                statusChart.update();

            }


            if (activityChart) {

                const dayMap =
                    new Map();


                const sorted =
                    [...quotes]
                        .sort(
                            (a, b) =>
                                new Date(
                                    a.createdAt
                                ) -
                                new Date(
                                    b.createdAt
                                )
                        );


                sorted.forEach(quote => {

                    const date =
                        new Date(
                            quote.createdAt
                        );


                    const label =
                        date.toLocaleDateString(
                            "en-GH",
                            {
                                day: "2-digit",
                                month: "short"
                            }
                        );


                    dayMap.set(
                        label,
                        (dayMap.get(label) ||
                            0) + 1
                    );

                });


                const last7 =
                    Array.from(
                        dayMap.entries()
                    )
                        .slice(-7);


                activityChart.data.labels =
                    last7.map(
                        entry =>
                            entry[0]
                    );

                activityChart.data.datasets[0].data =
                    last7.map(
                        entry =>
                            entry[1]
                    );

                activityChart.update();

            }


            if (servicesChart) {

                const serviceMap =
                    new Map();


                quotes.forEach(quote => {

                    const key =
                        quote.service ||
                        "Other";


                    serviceMap.set(
                        key,
                        (serviceMap.get(key) ||
                            0) + 1
                    );

                });


                const sortedServices =
                    Array.from(
                        serviceMap.entries()
                    )
                        .sort(
                            (a, b) =>
                                b[1] -
                                a[1]
                        )
                        .slice(0, 6);


                servicesChart.data.labels =
                    sortedServices.map(
                        entry =>
                            entry[0]
                    );

                servicesChart.data.datasets[0].data =
                    sortedServices.map(
                        entry =>
                            entry[1]
                    );

                servicesChart.update();

            }


            if (routesChart) {

                const routeMap =
                    new Map();


                quotes.forEach(quote => {

                    const key =
                        `${quote.origin || "?"} → ${quote.destination || "?"}`;


                    routeMap.set(
                        key,
                        (routeMap.get(key) ||
                            0) + 1
                    );

                });


                const sortedRoutes =
                    Array.from(
                        routeMap.entries()
                    )
                        .sort(
                            (a, b) =>
                                b[1] -
                                a[1]
                        )
                        .slice(0, 6);


                routesChart.data.labels =
                    sortedRoutes.map(
                        entry =>
                            entry[0]
                    );

                routesChart.data.datasets[0].data =
                    sortedRoutes.map(
                        entry =>
                            entry[1]
                    );

                routesChart.update();

            }

        }


        /* =================================================
           KEY METRICS
        ================================================= */

        function calculateMetrics() {

            const total =
                quotes.length;

            const completed =
                quotes.filter(
                    quote =>
                        quote.status ===
                        "Completed"
                ).length;


            const completionRate =
                total > 0
                    ? Math.round(
                        (completed /
                            total) *
                        100
                    ) +
                    "%"
                    : "-";


            const uniqueDates =
                new Set(
                    quotes.map(
                        quote =>
                            new Date(
                                quote.createdAt
                            )
                                .toDateString()
                    )
                ).size;


            const avgPerDay =
                uniqueDates > 0
                    ? (
                        total /
                        uniqueDates
                    ).toFixed(1)
                    : "-";


            const serviceCounts =
                {};

            const routeCounts =
                {};


            quotes.forEach(quote => {

                const service =
                    quote.service ||
                    "Other";

                const route =
                    `${quote.origin || "?"} → ${quote.destination || "?"}`;


                serviceCounts[service] =
                    (serviceCounts[service] ||
                        0) + 1;

                routeCounts[route] =
                    (routeCounts[route] ||
                        0) + 1;

            });


            const topService =
                Object.keys(
                    serviceCounts
                ).length > 0
                    ? Object.entries(
                        serviceCounts
                    )
                        .sort(
                            (a, b) =>
                                b[1] -
                                a[1]
                        )[0][0]
                    : "-";


            const topRoute =
                Object.keys(
                    routeCounts
                ).length > 0
                    ? Object.entries(
                        routeCounts
                    )
                        .sort(
                            (a, b) =>
                                b[1] -
                                a[1]
                        )[0][0]
                    : "-";


            const completionEl =
                document.getElementById(
                    "completionRate"
                );

            const avgEl =
                document.getElementById(
                    "avgPerDay"
                );

            const serviceEl =
                document.getElementById(
                    "topService"
                );

            const routeEl =
                document.getElementById(
                    "topRoute"
                );

            const updatedEl =
                document.getElementById(
                    "lastUpdated"
                );


            if (completionEl) {

                completionEl.textContent =
                    completionRate;

            }


            if (avgEl) {

                avgEl.textContent =
                    avgPerDay;

            }


            if (serviceEl) {

                serviceEl.textContent =
                    topService;

            }


            if (routeEl) {

                routeEl.textContent =
                    topRoute;

            }


            if (updatedEl) {

                updatedEl.textContent =
                    new Date()
                        .toLocaleTimeString(
                            "en-GH",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        );

            }

        }


        /* =================================================
           EXPORT CSV
        ================================================= */

        function exportToCSV() {

            if (!quotes.length) {

                alert(
                    "No data to export."
                );

                return;

            }


            const headers = [

                "Reference",

                "Customer Name",

                "Company",

                "Email",

                "Phone",

                "Service",

                "Origin",

                "Destination",

                "Cargo Type",

                "Cargo Weight",

                "Cargo Volume",

                "Shipping Date",

                "Preferred Contact",

                "Message",

                "Status",

                "Date"

            ];


            const rows =
                quotes.map(quote => [

                    quote.id,

                    quote.fullName || "",

                    quote.company || "",

                    quote.email || "",

                    quote.phone || "",

                    quote.service || "",

                    quote.origin || "",

                    quote.destination || "",

                    quote.cargoType || "",

                    quote.cargoWeight || "",

                    quote.cargoVolume || "",

                    quote.shippingDate || "",

                    quote.preferredContact ||
                        "Email / Phone",

                    (quote.message || "")
                        .replace(
                            /,/g,
                            ";"
                        ),

                    quote.status || "New",

                    formatDate(
                        quote.createdAt
                    )

                ]);


            const csvContent =
                [
                    headers.join(","),
                    ...rows.map(
                        row =>
                            row
                                .map(
                                    cell =>
                                        `"${String(
                                            cell
                                        )
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`
                                )
                                .join(",")
                    )
                ]
                    .join("\n");


            const blob =
                new Blob(
                    [csvContent],
                    { type: "text/csv;charset=utf-8;" }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement(
                    "a"
                );

            link.setAttribute(
                "href",
                url
            );

            link.setAttribute(
                "download",
                `ajb-quotes-${new Date().toISOString().slice(0, 10)}.csv`
            );

            link.style.display =
                "none";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            URL.revokeObjectURL(url);

        }


        /* =================================================
           QUICK ACTION BUTTONS
        ================================================= */

        const exportButton =
            document.getElementById(
                "exportCSV"
            );


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportToCSV
            );

        }


        const refreshButton =
            document.getElementById(
                "refreshData"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                () => {

                    window.location.reload();

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

                        initCharts();

                        loadQuotes();

                        initBlogAdmin();

                        initSubscribersAdmin();

                    }

                }
            );


        /* =================================================
           BLOG MANAGEMENT
        ================================================= */

        let blogPosts = [];

        const blogTable =
            document.getElementById(
                "blogAdminTable"
            );

        const blogSearch =
            document.getElementById(
                "blogAdminSearch"
            );

        const blogFilter =
            document.getElementById(
                "blogStatusFilter"
            );

        const blogEditorModal =
            document.getElementById(
                "blogEditorModal"
            );

        const blogEditorTitle =
            document.getElementById(
                "blogEditorTitle"
            );

        const blogPostForm =
            document.getElementById(
                "blogPostForm"
            );

        const blogEditorMessage =
            document.getElementById(
                "blogEditorMessage"
            );

        const sidebarBlogCount =
            document.getElementById(
                "sidebarBlogCount"
            );

        const blogImageUpload =
            document.getElementById(
                "blogImageUpload"
            );

        const blogImageField =
            document.getElementById(
                "blogImage"
            );

        const blogMediaUpload =
            document.getElementById(
                "blogMediaUpload"
            );


        function setBlogEditorMessage(message, type = "") {

            if (!blogEditorMessage) {
                return;
            }

            blogEditorMessage.textContent = message;
            blogEditorMessage.className =
                type
                    ? `login-message show ${type}`
                    : "login-message";

        }


        function readFileAsDataUrl(file) {

            return new Promise(
                (resolve, reject) => {

                    const reader = new FileReader();

                    reader.onload = () => {
                        resolve(reader.result);
                    };

                    reader.onerror = () => {
                        reject(
                            new Error(
                                "Unable to read the selected file."
                            )
                        );
                    };

                    reader.readAsDataURL(file);

                }
            );

        }


        function insertMediaIntoContent(dataUrl, fileType) {

            const contentField =
                document.getElementById(
                    "blogContent"
                );

            if (!contentField) {
                return;
            }

            const mediaTag =
                fileType.startsWith("video/")
                    ? `<video controls src="${dataUrl}"></video>\n`
                    : `<img src="${dataUrl}" alt="Uploaded media" />\n`;

            const start =
                contentField.selectionStart;

            const end =
                contentField.selectionEnd;

            contentField.setRangeText(
                mediaTag,
                start,
                end,
                "end"
            );

            contentField.focus();

        }


        async function handleBlogImageUpload(event) {

            const file = event.target.files && event.target.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                setBlogEditorMessage(
                    "Please choose an image file for the cover image.",
                    "error"
                );
                event.target.value = "";
                return;
            }

            try {

                const dataUrl = await readFileAsDataUrl(file);

                document.getElementById(
                    "blogImage"
                ).value = dataUrl;

                setBlogEditorMessage(
                    "Cover image uploaded successfully.",
                    "success"
                );

            } catch (error) {

                setBlogEditorMessage(
                    error.message ||
                    "Unable to upload the image.",
                    "error"
                );

            } finally {

                event.target.value = "";

            }

        }


        async function handleBlogMediaUpload(event) {

            const file = event.target.files && event.target.files[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith("image/") &&
                !file.type.startsWith("video/")
            ) {
                setBlogEditorMessage(
                    "Please choose an image or video file.",
                    "error"
                );
                event.target.value = "";
                return;
            }

            try {

                const dataUrl = await readFileAsDataUrl(file);

                insertMediaIntoContent(
                    dataUrl,
                    file.type
                );

                setBlogEditorMessage(
                    file.type.startsWith("video/")
                        ? "Video uploaded and inserted into the post content."
                        : "Image uploaded and inserted into the post content.",
                    "success"
                );

            } catch (error) {

                setBlogEditorMessage(
                    error.message ||
                    "Unable to upload the media.",
                    "error"
                );

            } finally {

                event.target.value = "";

            }

        }


        function initBlogAdmin() {

            loadBlogPosts();


            const newButton =
                document.getElementById(
                    "newBlogPost"
                );

            if (newButton) {

                newButton.addEventListener(
                    "click",
                    () => openBlogEditor()
                );

            }


            const closeButton =
                document.getElementById(
                    "closeBlogEditor"
                );

            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeBlogEditor
                );

            }


            const cancelButton =
                document.getElementById(
                    "cancelBlogEditor"
                );

            if (cancelButton) {

                cancelButton.addEventListener(
                    "click",
                    closeBlogEditor
                );

            }


            if (blogEditorModal) {

                blogEditorModal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            blogEditorModal
                        ) {

                            closeBlogEditor();

                        }

                    }
                );

            }


            if (blogPostForm) {

                blogPostForm.addEventListener(
                    "submit",
                    saveBlogPost
                );

            }


            const previewButton =
                document.getElementById(
                    "previewBlogPost"
                );

            if (previewButton) {

                previewButton.addEventListener(
                    "click",
                    previewBlogPost
                );

            }


            if (blogImageUpload) {

                blogImageUpload.addEventListener(
                    "change",
                    handleBlogImageUpload
                );

            }


            if (blogImageField && blogImageUpload) {

                blogImageField.addEventListener(
                    "click",
                    () => {
                        blogImageUpload.click();
                    }
                );

            }


            if (blogMediaUpload) {

                blogMediaUpload.addEventListener(
                    "change",
                    handleBlogMediaUpload
                );

            }


            if (blogSearch) {

                blogSearch.addEventListener(
                    "input",
                    renderBlogTable
                );

            }


            if (blogFilter) {

                blogFilter.addEventListener(
                    "change",
                    renderBlogTable
                );

            }

        }


        async function loadBlogPosts() {

            try {

                const response =
                    await fetch(
                        "/api/admin/blog"
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Unable to load posts."
                    );

                }


                const result =
                    await response.json();

                blogPosts =
                    result.posts ||
                    [];


                renderBlogTable();

                updateBlogSidebarCount();

            } catch (error) {

                console.error(
                    "Blog load error:",
                    error
                );

                if (blogTable) {

                    blogTable.innerHTML = `
                        <tr>
                            <td colspan="6">
                                Unable to load posts.
                            </td>
                        </tr>
                    `;

                }

            }

        }


        function renderBlogTable() {

            if (!blogTable) return;


            const search =
                blogSearch
                    ? blogSearch.value
                        .toLowerCase()
                    : "";

            const filter =
                blogFilter
                    ? blogFilter.value
                    : "all";


            const filtered =
                blogPosts.filter(
                    post => {

                        const matchesSearch =
                            !search ||
                            post.title
                                .toLowerCase()
                                .includes(
                                    search
                                ) ||
                            post.author
                                .toLowerCase()
                                .includes(
                                    search
                                );

                        let matchesStatus = true;

                        if (
                            filter ===
                            "published"
                        ) {

                            matchesStatus =
                                post.published;

                        } else if (
                            filter ===
                            "draft"
                        ) {

                            matchesStatus =
                                !post.published;

                        } else if (
                            filter ===
                            "featured"
                        ) {

                            matchesStatus =
                                post.featured;

                        }


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );


            if (!filtered.length) {

                blogTable.innerHTML = `
                    <tr>
                        <td colspan="6">
                            No blog posts yet.
                            Click "New Post" to create one.
                        </td>
                    </tr>
                `;

                return;

            }


            blogTable.innerHTML =
                filtered.map(
                    post => `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    post.title
                                )}
                            </strong>

                            <br>

                            <small>
                                /${escapeHTML(
                                    post.slug
                                )}
                            </small>

                        </td>

                        <td>
                            ${escapeHTML(
                                post.categoryLabel
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                post.author
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                post.publishedAt ||
                                post.createdAt
                            )}
                        </td>

                        <td>

                            <span
                                class="status-select ${
                                    post.published
                                        ? "status-Completed"
                                        : "status-New"
                                }"
                            >
                                ${
                                    post.published
                                        ? "Published"
                                        : "Draft"
                                }
                            </span>

                            ${
                                post.featured
                                    ? `<br><small>★ Featured</small>`
                                    : ""
                            }

                        </td>

                        <td>

                            <button
                                class="panel-button"
                                data-action="edit"
                                data-id="${
                                    post.id
                                }"
                            >

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button
                                class="panel-button"
                                data-action="toggle-publish"
                                data-id="${
                                    post.id
                                }"
                            >

                                <i class="fa-solid ${
                                    post.published
                                        ? "fa-eye-slash"
                                        : "fa-eye"
                                }"></i>

                            </button>

                            <button
                                class="panel-button"
                                data-action="delete"
                                data-id="${
                                    post.id
                                }"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `
                ).join("");


            blogTable
                .querySelectorAll(
                    "button[data-action]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => handleBlogAction(
                            button.dataset.action,
                            button.dataset.id
                        )
                    );

                });

        }


        function updateBlogSidebarCount() {

            if (!sidebarBlogCount) return;

            sidebarBlogCount.textContent =
                blogPosts.filter(
                    post => post.published
                ).length;

        }


        function openBlogEditor(
            post = null
        ) {

            if (!blogEditorModal) return;

            blogEditorTitle.textContent =
                post
                    ? "Edit Blog Post"
                    : "New Blog Post";

            document.getElementById(
                "blogPostId"
            ).value = post ? post.id : "";

            document.getElementById(
                "blogTitle"
            ).value = post ? post.title : "";

            document.getElementById(
                "blogSlug"
            ).value = post ? post.slug : "";

            document.getElementById(
                "blogCategory"
            ).value =
                post && post.category
                    ? post.category
                    : "company";

            document.getElementById(
                "blogAuthor"
            ).value =
                post && post.author
                    ? post.author
                    : "AJB Imports";

            document.getElementById(
                "blogImage"
            ).value =
                post && post.image
                    ? post.image
                    : "";

            document.getElementById(
                "blogExcerpt"
            ).value =
                post && post.excerpt
                    ? post.excerpt
                    : "";

            document.getElementById(
                "blogContent"
            ).value =
                post && post.content
                    ? post.content
                    : "";

            document.getElementById(
                "blogPublished"
            ).checked =
                post
                    ? post.published
                    : true;

            document.getElementById(
                "blogFeatured"
            ).checked =
                post ? post.featured : false;


            if (blogEditorMessage) {

                blogEditorMessage.textContent = "";

                blogEditorMessage.className =
                    "login-message";

            }


            blogEditorModal.hidden = false;

        }


        function closeBlogEditor() {

            if (!blogEditorModal) return;

            blogEditorModal.hidden = true;

        }


        function escapeBlogPreviewHTML(value) {

            if (!value) return "";

            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function formatBlogPreviewContent(content) {

            if (!content) {
                return "<p>Read the latest update from AJB Imports.</p>";
            }

            return content
                .replace(/\n{3,}/g, "</p><p>")
                .replace(/\n/g, "<br>")
                .trim();

        }


        function previewBlogPost() {

            const payload = {

                title:
                    document.getElementById(
                        "blogTitle"
                    ).value.trim(),

                slug:
                    document.getElementById(
                        "blogSlug"
                    ).value.trim(),

                category:
                    document.getElementById(
                        "blogCategory"
                    ).value,

                author:
                    document.getElementById(
                        "blogAuthor"
                    ).value.trim(),

                image:
                    document.getElementById(
                        "blogImage"
                    ).value.trim(),

                excerpt:
                    document.getElementById(
                        "blogExcerpt"
                    ).value.trim(),

                content:
                    document.getElementById(
                        "blogContent"
                    ).value,

                published:
                    document.getElementById(
                        "blogPublished"
                    ).checked,

                featured:
                    document.getElementById(
                        "blogFeatured"
                    ).checked

            };

            const imageUrl =
                payload.image &&
                !payload.image.startsWith("file://")
                    ? payload.image
                    : "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=80";

            const categoryLabel =
                payload.category === "company"
                    ? "Company News"
                    : payload.category === "logistics"
                        ? "Logistics"
                        : payload.category === "import"
                            ? "Import & Export"
                            : "Shipping Tips";

            const previewHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${escapeBlogPreviewHTML(payload.title || "Preview Post")}</title>
                    <style>
                        body {
                            margin: 0;
                            font-family: Inter, Arial, sans-serif;
                            background: #f8fafc;
                            color: #0f172a;
                        }
                        .preview-shell {
                            max-width: 1000px;
                            margin: 40px auto;
                            background: #ffffff;
                            border-radius: 18px;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
                        }
                        .preview-hero {
                            min-height: 260px;
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                        }
                        .preview-body {
                            padding: 32px;
                        }
                        .badge {
                            display: inline-block;
                            font-size: 12px;
                            letter-spacing: 0.08em;
                            text-transform: uppercase;
                            background: #dbeafe;
                            color: #1d4ed8;
                            padding: 8px 12px;
                            border-radius: 999px;
                            font-weight: 700;
                        }
                        h1 {
                            margin: 20px 0 16px;
                            font-size: clamp(2rem, 4vw, 3rem);
                            line-height: 1.1;
                        }
                        .meta {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 18px;
                            font-size: 14px;
                            color: #475569;
                            margin-bottom: 24px;
                        }
                        .summary {
                            padding: 18px 20px;
                            background: #f8fafc;
                            border-left: 4px solid #2563eb;
                            margin-bottom: 28px;
                            font-size: 16px;
                            color: #334155;
                        }
                        .content {
                            font-size: 17px;
                            line-height: 1.8;
                            color: #1f2937;
                        }
                        .content p {
                            margin: 0 0 16px;
                        }
                        .content img, .content video {
                            display: block;
                            max-width: 100%;
                            border-radius: 14px;
                            margin: 18px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-shell">
                        <div class="preview-hero" style="background-image: url('${escapeBlogPreviewHTML(imageUrl)}');"></div>
                        <div class="preview-body">
                            <span class="badge">${escapeBlogPreviewHTML(categoryLabel)}</span>
                            <h1>${escapeBlogPreviewHTML(payload.title || "Untitled Post")}</h1>
                            <div class="meta">
                                <span>${escapeBlogPreviewHTML(payload.author || "AJB Imports")}</span>
                                <span>${escapeBlogPreviewHTML(payload.published ? "Published" : "Draft")}</span>
                            </div>
                            <div class="summary">
                                ${escapeBlogPreviewHTML(payload.excerpt || "Preview excerpt will appear here.")}
                            </div>
                            <div class="content">
                                ${formatBlogPreviewContent(payload.content)}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const previewWindow = window.open(
                "",
                "_blank",
                "width=1200,height=900"
            );

            if (previewWindow) {
                previewWindow.document.open();
                previewWindow.document.write(previewHtml);
                previewWindow.document.close();
                previewWindow.focus();
                return;
            }

            const existingPreviewModal =
                document.getElementById("blogPreviewModal");

            if (existingPreviewModal) {
                existingPreviewModal.remove();
            }

            const previewModalBackdrop =
                document.createElement("div");

            previewModalBackdrop.id = "blogPreviewModal";
            previewModalBackdrop.style.position = "fixed";
            previewModalBackdrop.style.inset = "0";
            previewModalBackdrop.style.background = "rgba(15, 23, 42, 0.6)";
            previewModalBackdrop.style.display = "flex";
            previewModalBackdrop.style.alignItems = "center";
            previewModalBackdrop.style.justifyContent = "center";
            previewModalBackdrop.style.zIndex = "9999";
            previewModalBackdrop.style.padding = "20px";

            const previewModalPanel =
                document.createElement("div");

            previewModalPanel.style.width = "min(1200px, 100%)";
            previewModalPanel.style.maxHeight = "92vh";
            previewModalPanel.style.background = "#ffffff";
            previewModalPanel.style.borderRadius = "18px";
            previewModalPanel.style.overflow = "hidden";
            previewModalPanel.style.boxShadow = "0 30px 80px rgba(15, 23, 42, 0.25)";
            previewModalPanel.style.display = "flex";
            previewModalPanel.style.flexDirection = "column";

            const previewModalHeader =
                document.createElement("div");

            previewModalHeader.style.display = "flex";
            previewModalHeader.style.alignItems = "center";
            previewModalHeader.style.justifyContent = "space-between";
            previewModalHeader.style.padding = "18px 22px";
            previewModalHeader.style.borderBottom = "1px solid #e5e7eb";
            previewModalHeader.style.background = "#f8fafc";

            const previewModalTitle =
                document.createElement("h3");

            previewModalTitle.textContent = "Preview Post";
            previewModalTitle.style.margin = "0";
            previewModalTitle.style.fontSize = "20px";
            previewModalTitle.style.color = "#0f172a";

            const previewCloseButton =
                document.createElement("button");

            previewCloseButton.type = "button";
            previewCloseButton.textContent = "Close";
            previewCloseButton.style.border = "1px solid #cbd5e1";
            previewCloseButton.style.background = "#ffffff";
            previewCloseButton.style.padding = "8px 14px";
            previewCloseButton.style.borderRadius = "8px";
            previewCloseButton.style.cursor = "pointer";
            previewCloseButton.style.fontWeight = "700";
            previewCloseButton.style.color = "#0f172a";

            previewCloseButton.addEventListener(
                "click",
                () => {
                    previewModalBackdrop.remove();
                }
            );

            const previewFrame =
                document.createElement("iframe");

            previewFrame.title = "Blog post preview";
            previewFrame.srcdoc = previewHtml;
            previewFrame.style.width = "100%";
            previewFrame.style.height = "80vh";
            previewFrame.style.border = "0";
            previewFrame.style.background = "#ffffff";

            previewModalHeader.appendChild(
                previewModalTitle
            );
            previewModalHeader.appendChild(
                previewCloseButton
            );
            previewModalPanel.appendChild(
                previewModalHeader
            );
            previewModalPanel.appendChild(
                previewFrame
            );
            previewModalBackdrop.appendChild(
                previewModalPanel
            );

            document.body.appendChild(
                previewModalBackdrop
            );

        }


        async function saveBlogPost(
            event
        ) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "blogPostId"
                ).value;

            const saveButton =
                document.getElementById(
                    "saveBlogPost"
                );


            const payload = {

                title:
                    document.getElementById(
                        "blogTitle"
                    ).value.trim(),

                slug:
                    document.getElementById(
                        "blogSlug"
                    ).value.trim(),

                category:
                    document.getElementById(
                        "blogCategory"
                    ).value,

                author:
                    document.getElementById(
                        "blogAuthor"
                    ).value.trim(),

                image:
                    document.getElementById(
                        "blogImage"
                    ).value.trim(),

                excerpt:
                    document.getElementById(
                        "blogExcerpt"
                    ).value.trim(),

                content:
                    document.getElementById(
                        "blogContent"
                    ).value,

                published:
                    document.getElementById(
                        "blogPublished"
                    ).checked,

                featured:
                    document.getElementById(
                        "blogFeatured"
                    ).checked

            };


            if (saveButton) {

                saveButton.disabled = true;

                saveButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            }


            try {

                const url = id
                    ? `/api/admin/blog/${id}`
                    : "/api/admin/blog";

                const method = id
                    ? "PUT"
                    : "POST";


                const response =
                    await fetch(url, {

                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    });


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to save post."
                    );

                }


                if (blogEditorMessage) {

                    blogEditorMessage.textContent =
                        "Post saved successfully.";

                    blogEditorMessage.className =
                        "login-message show success";

                }


                setTimeout(
                    () => {

                        closeBlogEditor();

                        loadBlogPosts();

                    },
                    600
                );

            } catch (error) {

                if (blogEditorMessage) {

                    blogEditorMessage.textContent =
                        error.message;

                    blogEditorMessage.className =
                        "login-message show error";

                }

            } finally {

                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.innerHTML =
                        '<i class="fa-solid fa-floppy-disk"></i> Save Post';

                }

            }

        }


        async function handleBlogAction(
            action,
            id
        ) {

            const post =
                blogPosts.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );

            if (!post) return;


            if (action === "edit") {

                openBlogEditor(post);

                return;

            }


            if (
                action === "toggle-publish"
            ) {

                try {

                    const response =
                        await fetch(
                            `/api/admin/blog/${id}`,
                            {

                                method: "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        published:
                                            !post.published
                                    })

                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to update post."
                        );

                    }


                    post.published =
                        !post.published;

                    renderBlogTable();

                    updateBlogSidebarCount();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

                return;

            }


            if (action === "delete") {

                if (
                    !confirm(
                        `Delete "${post.title}"? This cannot be undone.`
                    )
                ) {

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `/api/admin/blog/${id}`,
                            { method: "DELETE" }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to delete post."
                        );

                    }


                    blogPosts =
                        blogPosts.filter(
                            item =>
                                String(item.id) !==
                                String(id)
                        );

                    renderBlogTable();

                    updateBlogSidebarCount();

                } catch (error) {

                    alert(
                        error.message
                    );

                }

            }

        }


        /* =================================================
            SUBSCRIBER MANAGEMENT
        ================================================= */

        let subscribers = [];

        function initSubscribersAdmin() {

            const searchInput =
                document.getElementById(
                    "subscriberSearch"
                );

            const statusFilter =
                document.getElementById(
                    "subscriberStatusFilter"
                );

            const refreshButton =
                document.getElementById(
                    "refreshSubscribers"
                );

            if (searchInput) {

                searchInput.addEventListener(
                    "input",
                    renderSubscribersTable
                );

            }

            if (statusFilter) {

                statusFilter.addEventListener(
                    "change",
                    renderSubscribersTable
                );

            }

            if (refreshButton) {

                refreshButton.addEventListener(
                    "click",
                    loadSubscribers
                );

            }

            loadSubscribers();

        }

        async function loadSubscribers() {

            const table =
                document.getElementById(
                    "subscribersTable"
                );

            const message =
                document.getElementById(
                    "subscribersMessage"
                );

            const refreshButton =
                document.getElementById(
                    "refreshSubscribers"
                );

            if (!table) return;

            if (message) {

                message.className =
                    "message";

                message.textContent =
                    "";

            }

            if (refreshButton) {

                refreshButton.disabled = true;

                refreshButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';

            }

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        Loading subscribers...
                    </td>
                </tr>
            `;

            try {

                const response =
                    await fetch(
                        "/api/admin/subscribers?includeUnsubscribed=true"
                    );

                if (
                    response.status ===
                    401
                ) {

                    window.location.href =
                        "/admin/login";

                    return;

                }

                if (!response.ok) {

                    let errorMsg =
                        "Unable to load subscribers.";

                    try {

                        const errorResult =
                            await response.json();

                        errorMsg =
                            errorResult.message ||
                            errorMsg;

                    } catch (parseError) {

                    }

                    throw new Error(errorMsg);

                }

                const result =
                    await response.json();

                subscribers =
                    Array.isArray(result.subscribers)
                        ? result.subscribers
                        : [];

                renderSubscribersTable();

                updateSubscriberSidebarCount();

            } catch (error) {

                console.error(
                    "Subscriber load error:",
                    error
                );

                table.innerHTML = `
                    <tr>
                        <td colspan="6">
                            ${escapeHTML(
                                error.message ||
                                "Unable to load subscribers."
                            )}
                        </td>
                    </tr>
                `;

                if (message) {

                    message.className =
                        "message show error";

                    message.textContent =
                        error.message ||
                        "Unable to load subscribers.";

                }

            } finally {

                if (refreshButton) {

                    refreshButton.disabled = false;

                    refreshButton.innerHTML =
                        '<i class="fa-solid fa-arrows-rotate"></i> Refresh';

                }

            }

        }

        function renderSubscribersTable() {

            const table =
                document.getElementById(
                    "subscribersTable"
                );

            if (!table) return;

            const searchInput =
                document.getElementById(
                    "subscriberSearch"
                );

            const statusFilter =
                document.getElementById(
                    "subscriberStatusFilter"
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
                subscribers.filter(
                    subscriber => {

                        const matchesSearch =
                            !search ||
                            (
                                subscriber.name +
                                " " +
                                subscriber.email
                            )
                                .toLowerCase()
                                .includes(
                                    search
                                );

                        const matchesStatus =
                            filter ===
                            "all" ||
                            subscriber.status ===
                            filter;

                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            if (!filtered.length) {

                table.innerHTML = `
                    <tr>
                        <td colspan="6">
                            No subscribers found.
                        </td>
                    </tr>
                `;

                return;

            }

            table.innerHTML =
                filtered.map(
                    subscriber => {

                        const status =
                            subscriber.status ||
                            "active";

                        return `
                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHTML(
                                            subscriber.name
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHTML(
                                        subscriber.email
                                    )}
                                </td>

                                <td>
                                    <select
                                        class="status-select status-${escapeHTML(
                                            status
                                        )}"
                                        data-id="${escapeHTML(
                                            subscriber.id
                                        )}"
                                    >
                                        ${subscriberStatusOptions(
                                            status
                                        )}
                                    </select>
                                </td>

                                <td>
                                    ${formatDate(
                                        subscriber.subscribedAt
                                    )}
                                </td>

                                <td>
                                    ${formatDate(
                                        subscriber.updatedAt
                                    )}
                                </td>

                                <td>
                                    <div class="subscriber-actions">
                                        <button
                                            type="button"
                                            class="subscriber-action danger"
                                            data-action="delete"
                                            data-id="${escapeHTML(
                                                subscriber.id
                                            )}"
                                            title="Delete subscriber"
                                            aria-label="Delete subscriber"
                                        >
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        `;

                    }
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

                            updateSubscriberStatus(
                                select.dataset.id,
                                select.value
                            );

                        }
                    );

                });

            table
                .querySelectorAll(
                    "button[data-action]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteSubscriber(
                                button.dataset.id
                            );

                        }
                    );

                });

        }

        function subscriberStatusOptions(
            current
        ) {

            const statuses = [
                "active",
                "unsubscribed"
            ];

            return statuses.map(
                status => `
                    <option
                        value="${status}"
                        ${status === current
                            ? "selected"
                            : ""}
                    >
                        ${status === "active"
                            ? "Active"
                            : "Unsubscribed"}
                    </option>
                `
            ).join("");

        }

        function updateSubscriberSidebarCount() {

            const count =
                document.getElementById(
                    "sidebarSubscriberCount"
                );

            if (!count) return;

            count.textContent =
                subscribers.filter(
                    subscriber =>
                        subscriber.status ===
                        "active"
                ).length;

        }

        function showSubscriberMessage(
            text,
            type
        ) {

            const message =
                document.getElementById(
                    "subscribersMessage"
                );

            if (!message) return;

            message.className =
                `message show ${type}`;

            message.textContent =
                text;

        }

        async function updateSubscriberStatus(
            id,
            status
        ) {

            try {

                const response =
                    await fetch(
                        `/api/admin/subscribers/${encodeURIComponent(id)}`,
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

                    let errorMsg =
                        "Unable to update subscriber.";

                    try {

                        const errorResult =
                            await response.json();

                        errorMsg =
                            errorResult.message ||
                            errorMsg;

                    } catch (parseError) {

                    }

                    throw new Error(errorMsg);

                }

                const result =
                    await response.json();

                const subscriber =
                    subscribers.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );

                if (subscriber) {

                    Object.assign(
                        subscriber,
                        result.subscriber || {
                            status
                        }
                    );

                }

                renderSubscribersTable();

                updateSubscriberSidebarCount();

                showSubscriberMessage(
                    "Subscription updated.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Subscriber update error:",
                    error
                );

                alert(
                    error.message
                );

                await loadSubscribers();

            }

        }

        async function deleteSubscriber(
            id
        ) {

            const subscriber =
                subscribers.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );

            if (
                !confirm(
                    `Delete ${subscriber?.name || "this subscriber"}? This cannot be undone.`
                )
            ) {

                return;

            }

            try {

                const response =
                    await fetch(
                        `/api/admin/subscribers/${encodeURIComponent(id)}`,
                        {
                            method:
                                "DELETE"
                        }
                    );

                if (!response.ok) {

                    let errorMsg =
                        "Unable to delete subscriber.";

                    try {

                        const errorResult =
                            await response.json();

                        errorMsg =
                            errorResult.message ||
                            errorMsg;

                    } catch (parseError) {

                    }

                    throw new Error(errorMsg);

                }

                subscribers =
                    subscribers.filter(
                        item =>
                            String(item.id) !==
                            String(id)
                    );

                renderSubscribersTable();

                updateSubscriberSidebarCount();

                showSubscriberMessage(
                    "Subscriber deleted.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Subscriber delete error:",
                    error
                );

                alert(
                    error.message
                );

                await loadSubscribers();

            }

        }

    }
);