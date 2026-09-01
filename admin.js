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
                                : section === "sheets"
                                ? "Google Sheets"
                                : "Services";

                    }

                    if (section === "sheets") {

                        loadSheetsStatus();

                        loadSheetsSubmissions();

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

                    loadQuotes();

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

                        initSheetsAdmin();

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
            SHEETS MANAGEMENT
        ================================================= */

        let sheetsSubmissions = [];

        function initSheetsAdmin() {

            const syncButton =
                document.getElementById(
                    "syncFromSheets"
                );

            if (syncButton) {

                syncButton.addEventListener(
                    "click",
                    syncFromSheets
                );

            }

            const refreshButton =
                document.getElementById(
                    "refreshSheets"
                );

            if (refreshButton) {

                refreshButton.addEventListener(
                    "click",
                    loadSheetsSubmissions
                );

            }

        }

        async function loadSheetsStatus() {

            const statusValue =
                document.getElementById(
                    "sheetsConnectionStatus"
                );

            const idValue =
                document.getElementById(
                    "sheetsIdValue"
                );

            const tabValue =
                document.getElementById(
                    "sheetsTabValue"
                );

            if (!statusValue) return;

            try {

                const response =
                    await fetch(
                        "/api/admin/sheets/status"
                    );

                if (!response.ok) {

                    statusValue.textContent =
                        "Error";

                    statusValue.className =
                        "status-value status-not-configured";

                    return;

                }

                const result =
                    await response.json();

                if (result.configured) {

                    statusValue.textContent =
                        "Connected";

                    statusValue.className =
                        "status-value status-connected";

                } else {

                    statusValue.textContent =
                        "Not Configured";

                    statusValue.className =
                        "status-value status-not-configured";

                }

                if (idValue) {

                    idValue.textContent =
                        result.sheetId || "-";

                }

                if (tabValue) {

                    tabValue.textContent =
                        result.sheetTab || "-";

                }

            } catch (error) {

                console.error(
                    "Sheets status error:",
                    error
                );

                statusValue.textContent =
                    "Error";

                statusValue.className =
                    "status-value status-not-configured";

            }

        }

        async function loadSheetsSubmissions() {

            const table =
                document.getElementById(
                    "sheetsSubmissionsTable"
                );

            if (!table) return;

            const message =
                document.getElementById(
                    "sheetsMessage"
                );

            if (message) {

                message.className =
                    "message";

                message.textContent =
                    "";

            }

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        Loading submissions...
                    </td>
                </tr>
            `;

            try {

                const response =
                    await fetch(
                        "/api/admin/sheets/submissions"
                    );

                if (!response.ok) {

                    let errorMsg =
                        "Unable to load submissions.";

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

                sheetsSubmissions =
                    result.submissions || [];

                renderSheetsSubmissions();

            } catch (error) {

                console.error(
                    "Sheets submissions error:",
                    error
                );

                table.innerHTML = `
                    <tr>
                        <td colspan="8">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;

                if (message) {

                    message.className =
                        "message show error";

                    message.textContent =
                        error.message;

                }

            }

        }

        function renderSheetsSubmissions() {

            const table =
                document.getElementById(
                    "sheetsSubmissionsTable"
                );

            if (!table) return;

            if (!sheetsSubmissions.length) {

                table.innerHTML = `
                    <tr>
                        <td colspan="8">
                            No submissions found.
                        </td>
                    </tr>
                `;

                return;

            }

            table.innerHTML =
                sheetsSubmissions.map(
                    sub => `
                        <tr>
                            <td>
                                ${escapeHTML(sub._rowNumber)}
                            </td>
                            <td>
                                <strong>
                                    ${escapeHTML(sub["Customer Name"])}
                                </strong>
                            </td>
                            <td>
                                ${escapeHTML(sub["Email"])}
                            </td>
                            <td>
                                ${escapeHTML(sub["Service Requested"])}
                            </td>
                            <td>
                                ${escapeHTML(sub["Origin"])}
                                →
                                ${escapeHTML(sub["Destination"])}
                            </td>
                            <td>
                                ${formatDate(sub["Submission Date"])}
                            </td>
                            <td>
                                <select
                                    class="status-select status-${escapeHTML(sub["Status"] || "New")}"
                                    data-row="${escapeHTML(sub._rowNumber)}"
                                >
                                    ${statusOptions(sub["Status"] || "New")}
                                </select>
                            </td>
                            <td>
                                ${escapeHTML(sub["Admin Notes"] || "")}
                            </td>
                        </tr>
                    `
                ).join("");

            table
                .querySelectorAll(
                    ".status-select[data-row]"
                )
                .forEach(select => {

                    select.addEventListener(
                        "change",
                        () => {

                            updateSheetsStatus(
                                select.dataset.row,
                                select.value
                            );

                        }
                    );

                });

        }

        async function syncFromSheets() {

            const syncButton =
                document.getElementById(
                    "syncFromSheets"
                );

            const message =
                document.getElementById(
                    "sheetsMessage"
                );

            if (syncButton) {

                syncButton.disabled = true;

                syncButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

            }

            try {

                const response =
                    await fetch(
                        "/api/admin/sheets/sync",
                        {
                            method: "POST"
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to sync."
                    );

                }

                if (message) {

                    message.className =
                        "message show success";

                    message.textContent =
                        `Synced ${result.synced} new, ${result.updated} updated submissions.`;

                }

                loadSheetsSubmissions();

            } catch (error) {

                console.error(
                    "Sheets sync error:",
                    error
                );

                if (message) {

                    message.className =
                        "message show error";

                    message.textContent =
                        error.message;

                }

            } finally {

                if (syncButton) {

                    syncButton.disabled = false;

                    syncButton.innerHTML =
                        '<i class="fa-solid fa-sync"></i> Sync from Sheet';

                }

            }

        }

        async function updateSheetsStatus(
            rowNumber,
            status
        ) {

            try {

                const response =
                    await fetch(
                        `/api/admin/sheets/submissions/${encodeURIComponent(rowNumber)}`,
                        {
                            method: "PATCH",

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
                        "Unable to update submission.";

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

                const submission =
                    sheetsSubmissions.find(
                        item =>
                            String(item._rowNumber) ===
                            String(rowNumber)
                    );

                if (submission) {

                    submission["Status"] =
                        status;

                }

                renderSheetsSubmissions();

            } catch (error) {

                console.error(
                    "Sheets update error:",
                    error
                );

                alert(
                    error.message
                );

                loadSheetsSubmissions();

            }

        }

    }
);