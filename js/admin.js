// ============================================================
// ADMIN DASHBOARD
// United Parcel Shipping
// ============================================================


// ============================================================
// DOM ELEMENTS
// ============================================================

// Login
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");
const refreshDashboardBtn =
    document.getElementById("refreshDashboardBtn");


// Shipment form
const shipmentForm =
    document.getElementById("shipmentForm");

const formTitle =
    document.getElementById("formTitle");

const editingShipmentId =
    document.getElementById("editingShipmentId");

const trackingNumber =
    document.getElementById("trackingNumber");

const receiverName =
    document.getElementById("receiverName");

const senderName =
    document.getElementById("senderName");

const origin =
    document.getElementById("origin");

const destination =
    document.getElementById("destination");

const packageDescription =
    document.getElementById("packageDescription");

const weight =
    document.getElementById("weight");

const shippingType =
    document.getElementById("shippingType");

const status =
    document.getElementById("status");

const currentLocation =
    document.getElementById("currentLocation");

const estimatedDelivery =
    document.getElementById("estimatedDelivery");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const shipmentMessage =
    document.getElementById("shipmentMessage");


// Tracking update
const trackingUpdateForm =
    document.getElementById("trackingUpdateForm");

const updateTrackingNumber =
    document.getElementById("updateTrackingNumber");

const updateStatus =
    document.getElementById("updateStatus");

const updateLocation =
    document.getElementById("updateLocation");

const updateDescription =
    document.getElementById("updateDescription");

const trackingMessage =
    document.getElementById("trackingMessage");


// Shipment list
const shipmentSearch =
    document.getElementById("shipmentSearch");

const statusFilter =
    document.getElementById("statusFilter");

const shipmentList =
    document.getElementById("shipmentList");


// Dashboard statistics
const totalShipments =
    document.getElementById("totalShipments");

const inTransitShipments =
    document.getElementById("inTransitShipments");

const deliveredShipments =
    document.getElementById("deliveredShipments");

const attemptedShipments =
    document.getElementById("attemptedShipments");

const outForDeliveryShipments =
    document.getElementById("outForDeliveryShipments");

const processingShipments =
    document.getElementById("processingShipments");

const customsShipments =
    document.getElementById("customsShipments");

const createdShipments =
    document.getElementById("createdShipments");

const pickedUpShipments =
    document.getElementById("pickedUpShipments");

const arrivedShipments =
    document.getElementById("arrivedShipments");


// Dashboard sections
const recentActivity =
    document.getElementById("recentActivity");

const shipmentOverview =
    document.getElementById("shipmentOverview");


// Quick actions
const quickCreateShipment =
    document.getElementById("quickCreateShipment");

const quickTrackingUpdate =
    document.getElementById("quickTrackingUpdate");

const quickViewShipments =
    document.getElementById("quickViewShipments");


// ============================================================
// BUSINESS SETTINGS
// ============================================================

const BUSINESS_WHATSAPP =
    "2349049010493";

const BUSINESS_NAME =
    "United Parcel Shipping";


// ============================================================
// STATUS LIST
// ============================================================

const STATUS_OPTIONS = [
    "Shipment Created",
    "Picked Up",
    "Processing",
    "In Transit",
    "Arrived at Facility",
    "Customs Clearance",
    "Out for Delivery",
    "Delivery Attempted",
    "Delivered"
];


// ============================================================
// INTERNAL STATE
// ============================================================

let dashboardRefreshTimer = null;

let isDashboardLoading = false;

let currentDisplayedShipments = [];


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Not specified";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return escapeHTML(
            dateValue
        );
    }

    return date.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function formatDateOnly(dateValue) {

    if (!dateValue) {
        return "Not specified";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return escapeHTML(
            dateValue
        );
    }

    return date.toLocaleDateString(
        "en-NG",
        {
            dateStyle: "medium"
        }
    );
}


function showMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `message ${type}`;
}


function clearMessage(element) {

    if (!element) {
        return;
    }

    element.textContent =
        "";

    element.className =
        "message";
}


function scrollToElement(element) {

    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


// ============================================================
// TRACKING NUMBER GENERATOR
// ============================================================

function generateTrackingNumber() {

    const letters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const numbers =
        "0123456789";

    let result =
        "UAP-";


    for (
        let i = 0;
        i < 2;
        i++
    ) {

        result +=
            letters.charAt(
                Math.floor(
                    Math.random() *
                    letters.length
                )
            );
    }


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const characters =
            i % 2 === 0
                ? numbers
                : letters + numbers;


        result +=
            characters.charAt(
                Math.floor(
                    Math.random() *
                    characters.length
                )
            );
    }


    return result;
}


// ============================================================
// TRACKING NUMBER AVAILABILITY
// ============================================================

async function trackingNumberExists(
    tracking,
    excludedId = null
) {

    if (!tracking) {
        return false;
    }


    let query =
        supabaseClient
            .from("shipments")
            .select("id")
            .eq(
                "tracking_number",
                tracking
            );


    if (excludedId) {

        query =
            query.neq(
                "id",
                excludedId
            );
    }


    const {
        data,
        error
    } = await query.maybeSingle();


    if (error) {
        throw error;
    }


    return !!data;
}


// ============================================================
// GET UNIQUE TRACKING NUMBER
// ============================================================

async function getUniqueTrackingNumber() {

    for (
        let attempt = 0;
        attempt < 10;
        attempt++
    ) {

        const candidate =
            generateTrackingNumber();


        const exists =
            await trackingNumberExists(
                candidate
            );


        if (!exists) {
            return candidate;
        }
    }


    throw new Error(
        "Unable to generate a unique tracking number. Please try again."
    );
}


// ============================================================
// RESET SHIPMENT FORM
// ============================================================

function resetShipmentForm() {

    if (!shipmentForm) {
        return;
    }


    shipmentForm.reset();


    if (editingShipmentId) {

        editingShipmentId.value =
            "";
    }


    if (formTitle) {

        formTitle.textContent =
            "➕ Create New Shipment";
    }


    if (status) {

        status.value =
            "Shipment Created";
    }


    if (shippingType) {

        shippingType.value =
            "Standard";
    }


    if (trackingNumber) {

        trackingNumber.value =
            generateTrackingNumber();
    }


    clearMessage(
        shipmentMessage
    );
}


// ============================================================
// RESET TRACKING FORM
// ============================================================

function resetTrackingForm() {

    if (!trackingUpdateForm) {
        return;
    }


    trackingUpdateForm.reset();


    if (updateStatus) {

        updateStatus.value =
            "Shipment Created";
    }


    clearMessage(
        trackingMessage
    );
}


// ============================================================
// AUTHENTICATION
// ============================================================

async function checkSession() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession();


        if (!session) {

            showLogin();

            return;
        }


        const isAdmin =
            await verifyAdmin(
                session.user.id
            );


        if (!isAdmin) {

            await supabaseClient.auth
                .signOut();

            showLogin();

            showMessage(
                loginMessage,
                "This account does not have administrator access.",
                "error"
            );

            return;
        }


        showDashboard();

    } catch (error) {

        console.error(
            "Session check error:",
            error
        );

        showLogin();
    }
}


async function verifyAdmin(
    userId
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Admin verification error:",
                error
            );

            return false;
        }


        return !!data;

    } catch (error) {

        console.error(
            "Admin verification exception:",
            error
        );

        return false;
    }
}


function showLogin() {

    stopDashboardAutoRefresh();


    if (loginSection) {

        loginSection.classList
            .remove("hidden");
    }


    if (dashboardSection) {

        dashboardSection.classList
            .add("hidden");
    }
}


async function showDashboard() {

    if (loginSection) {

        loginSection.classList
            .add("hidden");
    }


    if (dashboardSection) {

        dashboardSection.classList
            .remove("hidden");
    }


    await loadDashboard();

    startDashboardAutoRefresh();
}


async function loginAdmin(event) {

    event.preventDefault();

    clearMessage(
        loginMessage
    );


    const email =
        emailInput?.value.trim();


    const password =
        emailInput &&
        passwordInput
            ? passwordInput.value
            : "";


    if (!email || !password) {

        showMessage(
            loginMessage,
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    showMessage(
        loginMessage,
        "Signing in...",
        "success"
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {
            throw error;
        }


        if (!data?.user) {

            throw new Error(
                "Login succeeded but no user account was returned."
            );
        }


        const isAdmin =
            await verifyAdmin(
                data.user.id
            );


        if (!isAdmin) {

            await supabaseClient.auth
                .signOut();

            throw new Error(
                "This account is not registered as an administrator."
            );
        }


        loginForm.reset();

        clearMessage(
            loginMessage
        );

        await showDashboard();

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            loginMessage,
            error.message ||
                "Unable to sign in.",
            "error"
        );
    }
}


async function logoutAdmin() {

    try {

        stopDashboardAutoRefresh();

        await supabaseClient.auth
            .signOut();

        resetShipmentForm();

        resetTrackingForm();

        showLogin();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );
    }
}


// ============================================================
// DASHBOARD AUTO REFRESH
// ============================================================

function startDashboardAutoRefresh() {

    stopDashboardAutoRefresh();


    dashboardRefreshTimer =
        setInterval(
            async () => {

                if (
                    document.hidden
                ) {
                    return;
                }


                if (
                    isDashboardLoading
                ) {
                    return;
                }


                try {

                    await loadDashboard();

                } catch (error) {

                    console.error(
                        "Automatic dashboard refresh error:",
                        error
                    );
                }

            },
            60000
        );
}


function stopDashboardAutoRefresh() {

    if (
        dashboardRefreshTimer
    ) {

        clearInterval(
            dashboardRefreshTimer
        );

        dashboardRefreshTimer =
            null;
    }
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    if (isDashboardLoading) {
        return;
    }


    isDashboardLoading = true;


    try {

        await Promise.all([
            loadShipments(),
            loadDashboardStatistics(),
            loadRecentActivity(),
            loadShipmentOverview()
        ]);

    } finally {

        isDashboardLoading =
            false;
    }
}


// ============================================================
// LOAD ALL SHIPMENTS
// ============================================================

async function getAllShipments() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("shipments")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {
        throw error;
    }


    return data || [];
}


// ============================================================
// DASHBOARD STATISTICS
// ============================================================

async function loadDashboardStatistics() {

    try {

        const shipments =
            await getAllShipments();


        const countStatus =
            statusName => {

                return shipments.filter(
                    shipment =>
                        shipment.status ===
                        statusName
                ).length;
            };


        if (totalShipments) {

            totalShipments.textContent =
                shipments.length;
        }


        if (inTransitShipments) {

            inTransitShipments.textContent =
                countStatus(
                    "In Transit"
                );
        }


        if (deliveredShipments) {

            deliveredShipments.textContent =
                countStatus(
                    "Delivered"
                );
        }


        if (attemptedShipments) {

            attemptedShipments.textContent =
                countStatus(
                    "Delivery Attempted"
                );
        }


        if (outForDeliveryShipments) {

            outForDeliveryShipments.textContent =
                countStatus(
                    "Out for Delivery"
                );
        }


        if (processingShipments) {

            processingShipments.textContent =
                countStatus(
                    "Processing"
                );
        }


        if (customsShipments) {

            customsShipments.textContent =
                countStatus(
                    "Customs Clearance"
                );
        }


        if (createdShipments) {

            createdShipments.textContent =
                countStatus(
                    "Shipment Created"
                );
        }


        if (pickedUpShipments) {

            pickedUpShipments.textContent =
                countStatus(
                    "Picked Up"
                );
        }


        if (arrivedShipments) {

            arrivedShipments.textContent =
                countStatus(
                    "Arrived at Facility"
                );
        }

    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );
    }
}


// ============================================================
// FILTER SHIPMENTS
// ============================================================

function filterShipments(
    shipments
) {

    let filtered =
        [...shipments];


    const searchTerm =
        shipmentSearch?.value
            .trim()
            .toLowerCase() || "";


    if (searchTerm) {

        filtered =
            filtered.filter(
                shipment => {

                    return (

                        String(
                            shipment.tracking_number ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )

                        ||

                        String(
                            shipment.receiver_name ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )

                        ||

                        String(
                            shipment.sender_name ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )

                        ||

                        String(
                            shipment.destination ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )

                        ||

                        String(
                            shipment.origin ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )

                        ||

                        String(
                            shipment.current_location ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchTerm
                        )
                    );
                }
            );
    }


    const selectedStatus =
        statusFilter?.value || "";


    if (selectedStatus) {

        filtered =
            filtered.filter(
                shipment =>
                    shipment.status ===
                    selectedStatus
            );
    }


    return filtered;
}


// ============================================================
// SHIPMENT LIST
// ============================================================

async function loadShipments() {

    if (!shipmentList) {
        return;
    }


    shipmentList.innerHTML = `
        <div class="empty-state">
            Loading shipments...
        </div>
    `;


    try {

        const allShipments =
            await getAllShipments();


        const shipments =
            filterShipments(
                allShipments
            );


        currentDisplayedShipments =
            shipments;


        displayShipments(
            shipments
        );

    } catch (error) {

        console.error(
            "Load shipments error:",
            error
        );


        currentDisplayedShipments =
            [];


        shipmentList.innerHTML = `
            <div class="empty-state">

                Unable to load shipments.

                <br><br>

                ${escapeHTML(
                    error.message ||
                    "Unknown error"
                )}

            </div>
        `;
    }
}


// ============================================================
// STATUS CLASS
// ============================================================

function getAdminStatusClass(
    shipmentStatus
) {

    if (!shipmentStatus) {
        return "";
    }


    const value =
        shipmentStatus
            .toLowerCase();


    if (
        value.includes(
            "delivered"
        )
    ) {
        return "status-delivered";
    }


    if (
        value.includes(
            "attempted"
        )
    ) {
        return "status-attempted";
    }


    if (
        value.includes(
            "out for delivery"
        )
    ) {
        return "status-out";
    }


    if (
        value.includes(
            "customs"
        )
    ) {
        return "status-customs";
    }


    if (
        value.includes(
            "facility"
        )
    ) {
        return "status-facility";
    }


    if (
        value.includes(
            "transit"
        )
    ) {
        return "status-transit";
    }


    if (
        value.includes(
            "processing"
        )
    ) {
        return "status-processing";
    }


    if (
        value.includes(
            "picked"
        )
    ) {
        return "status-picked";
    }


    return "status-created";
}


// ============================================================
// DISPLAY SHIPMENTS
// ============================================================

function displayShipments(
    shipments
) {

    if (!shipmentList) {
        return;
    }


    if (!shipments.length) {

        shipmentList.innerHTML = `
            <div class="empty-state">

                📦 No shipments found.

                <br><br>

                Try another search or create a new shipment.

            </div>
        `;

        return;
    }


    shipmentList.innerHTML =
        shipments.map(
            shipment => {

                const safeId =
                    escapeHTML(
                        shipment.id
                    );


                const safeTracking =
                    escapeHTML(
                        shipment.tracking_number
                    );


                const statusClass =
                    getAdminStatusClass(
                        shipment.status
                    );


                return `

                    <div
                        class="shipment-item"
                        data-shipment-id="${safeId}"
                    >

                        <div class="shipment-header">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        shipment.receiver_name ||
                                        "Unknown Receiver"
                                    )}
                                </h3>

                                <div class="tracking-small">

                                    Tracking:
                                    <strong>
                                        ${safeTracking}
                                    </strong>

                                </div>

                            </div>


                            <span
                                class="status-badge ${statusClass}"
                            >
                                ${escapeHTML(
                                    shipment.status ||
                                    "Unknown"
                                )}
                            </span>

                        </div>


                        <div class="shipment-info">

                            <div>
                                <strong>Sender:</strong>
                                ${escapeHTML(
                                    shipment.sender_name ||
                                    "Not specified"
                                )}
                            </div>


                            <div>
                                <strong>Location:</strong>
                                ${escapeHTML(
                                    shipment.current_location ||
                                    "Not specified"
                                )}
                            </div>


                            <div>
                                <strong>Origin:</strong>
                                ${escapeHTML(
                                    shipment.origin ||
                                    "Not specified"
                                )}
                            </div>


                            <div>
                                <strong>Destination:</strong>
                                ${escapeHTML(
                                    shipment.destination ||
                                    "Not specified"
                                )}
                            </div>


                            <div>
                                <strong>Shipping:</strong>
                                ${escapeHTML(
                                    shipment.shipping_type ||
                                    "Standard"
                                )}
                            </div>


                            <div>
                                <strong>Weight:</strong>
                                ${escapeHTML(
                                    shipment.weight ||
                                    "Not specified"
                                )}
                                ${
                                    shipment.weight
                                        ? " kg"
                                        : ""
                                }
                            </div>


                            <div>
                                <strong>Estimated Delivery:</strong>
                                ${formatDateOnly(
                                    shipment.estimated_delivery
                                )}
                            </div>


                            <div>
                                <strong>Created:</strong>
                                ${formatDate(
                                    shipment.created_at
                                )}
                            </div>

                        </div>


                        <div
                            style="
                                margin-bottom:12px;
                                line-height:1.6;
                            "
                        >

                            <strong>
                                Package:
                            </strong>

                            ${escapeHTML(
                                shipment.package_description ||
                                "No description"
                            )}

                        </div>


                        <div
                            class="admin-shipment-actions"
                            style="
                                display:flex;
                                flex-wrap:wrap;
                                gap:8px;
                            "
                        >

                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="editShipment('${safeId}')"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                type="button"
                                class="btn btn-light"
                                onclick="prepareTrackingUpdate('${safeTracking}')"
                            >
                                📍 Tracking
                            </button>


                            <button
                                type="button"
                                class="btn btn-light"
                                onclick="copyTrackingNumber('${safeTracking}')"
                            >
                                📋 Copy
                            </button>


                            <button
                                type="button"
                                class="btn btn-light"
                                onclick="copyTrackingLink('${safeTracking}')"
                            >
                                🔗 Link
                            </button>


                            <button
                                type="button"
                                class="btn btn-light"
                                onclick="printShipment('${safeId}')"
                            >
                                🖨️ Print
                            </button>


                            <button
                                type="button"
                                class="btn btn-light"
                                onclick="notifyCustomerWhatsApp('${safeId}')"
                            >
                                📱 WhatsApp
                            </button>


                            <button
                                type="button"
                                class="btn btn-danger"
                                onclick="deleteShipment('${safeId}')"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        ).join("");
}


// ============================================================
// RECENT ACTIVITY
// ============================================================

async function loadRecentActivity() {

    if (!recentActivity) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("tracking_updates")
                .select(`
                    id,
                    shipment_id,
                    status,
                    location,
                    description,
                    created_at,
                    shipments (
                        tracking_number,
                        receiver_name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(8);


        if (error) {
            throw error;
        }


        if (
            !data ||
            !data.length
        ) {

            recentActivity.innerHTML = `
                <div class="empty-state">
                    No tracking activity yet.
                </div>
            `;

            return;
        }


        recentActivity.innerHTML =
            data.map(
                update => {

                    const shipment =
                        update.shipments;


                    return `

                        <div class="activity-item">

                            <div class="activity-icon">
                                📍
                            </div>


                            <div class="activity-content">

                                <strong>

                                    ${escapeHTML(
                                        update.status ||
                                        "Tracking Update"
                                    )}

                                    —
                                    ${escapeHTML(
                                        shipment?.tracking_number ||
                                        "Unknown"
                                    )}

                                </strong>


                                <span>

                                    ${escapeHTML(
                                        update.location ||
                                        "Location not specified"
                                    )}

                                    ·

                                    ${escapeHTML(
                                        update.description ||
                                        ""
                                    )}

                                </span>


                                <span>

                                    ${formatDate(
                                        update.created_at
                                    )}

                                </span>

                            </div>

                        </div>

                    `;
                }
            ).join("");


    } catch (error) {

        console.error(
            "Recent activity error:",
            error
        );


        recentActivity.innerHTML = `
            <div class="empty-state">
                Unable to load recent activity.
            </div>
        `;
    }
}


// ============================================================
// SHIPMENT OVERVIEW
// ============================================================

async function loadShipmentOverview() {

    if (!shipmentOverview) {
        return;
    }


    try {

        const shipments =
            await getAllShipments();


        if (!shipments.length) {

            shipmentOverview.innerHTML = `
                <div class="empty-state">
                    No shipment data available yet.
                </div>
            `;

            return;
        }


        const statusCounts = {};


        STATUS_OPTIONS.forEach(
            statusName => {

                statusCounts[
                    statusName
                ] = 0;
            }
        );


        shipments.forEach(
            shipment => {

                if (
                    Object.prototype
                        .hasOwnProperty.call(
                            statusCounts,
                            shipment.status
                        )
                ) {

                    statusCounts[
                        shipment.status
                    ]++;
                }
            }
        );


        shipmentOverview.innerHTML = `

            <div class="activity-item">

                <div class="activity-icon">
                    📦
                </div>

                <div class="activity-content">

                    <strong>
                        ${shipments.length}
                        Total Shipments
                    </strong>

                    <span>
                        All shipment records in the system
                    </span>

                </div>

            </div>


            <div class="activity-item">

                <div class="activity-icon">
                    🚚
                </div>

                <div class="activity-content">

                    <strong>
                        ${statusCounts["In Transit"]}
                        In Transit
                    </strong>

                    <span>
                        Shipments currently moving
                    </span>

                </div>

            </div>


            <div class="activity-item">

                <div class="activity-icon">
                    🏠
                </div>

                <div class="activity-content">

                    <strong>
                        ${statusCounts["Out for Delivery"]}
                        Out for Delivery
                    </strong>

                    <span>
                        Shipments on final delivery
                    </span>

                </div>

            </div>


            <div class="activity-item">

                <div class="activity-icon">
                    ✅
                </div>

                <div class="activity-content">

                    <strong>
                        ${statusCounts["Delivered"]}
                        Delivered
                    </strong>

                    <span>
                        Successfully delivered shipments
                    </span>

                </div>

            </div>

        `;

    } catch (error) {

        console.error(
            "Shipment overview error:",
            error
        );


        shipmentOverview.innerHTML = `
            <div class="empty-state">
                Unable to load shipment overview.
            </div>
        `;
    }
}


// ============================================================
// CREATE / EDIT SHIPMENT
// ============================================================

async function saveShipment(event) {

    event.preventDefault();


    clearMessage(
        shipmentMessage
    );


    const editingId =
        editingShipmentId?.value || "";


    let tracking =
        trackingNumber?.value
            .trim()
            .toUpperCase();


    if (
        !editingId &&
        !tracking
    ) {

        tracking =
            await getUniqueTrackingNumber();


        if (trackingNumber) {

            trackingNumber.value =
                tracking;
        }
    }


    const receiver =
        receiverName?.value.trim();


    const sender =
        senderName?.value.trim();


    const shipmentOrigin =
        origin?.value.trim();


    const shipmentDestination =
        destination?.value.trim();


    const description =
        packageDescription?.value.trim();


    const shipmentWeight =
        weight?.value.trim();


    const type =
        shippingType?.value ||
        "Standard";


    const shipmentStatus =
        status?.value ||
        "Shipment Created";


    const location =
        currentLocation?.value.trim();


    const deliveryDate =
        estimatedDelivery?.value ||
        null;


    if (
        !tracking ||
        !receiver ||
        !sender ||
        !shipmentOrigin ||
        !shipmentDestination
    ) {

        showMessage(
            shipmentMessage,
            "Please complete all required shipment fields.",
            "error"
        );

        return;
    }


    if (
        shipmentWeight &&
        (
            Number.isNaN(
                Number(
                    shipmentWeight
                )
            ) ||
            Number(
                shipmentWeight
            ) < 0
        )
    ) {

        showMessage(
            shipmentMessage,
            "Please enter a valid shipment weight.",
            "error"
        );

        return;
    }


    const shipmentData = {

        tracking_number:
            tracking,

        receiver_name:
            receiver,

        sender_name:
            sender,

        origin:
            shipmentOrigin,

        destination:
            shipmentDestination,

        package_description:
            description ||
            null,

        weight:
            shipmentWeight ||
            null,

        shipping_type:
            type,

        status:
            shipmentStatus,

        current_location:
            location ||
            null,

        estimated_delivery:
            deliveryDate
    };


    try {

        if (editingId) {

            await updateExistingShipment(
                editingId,
                shipmentData
            );

        } else {

            await createShipment(
                shipmentData
            );
        }


        resetShipmentForm();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Save shipment error:",
            error
        );


        showMessage(
            shipmentMessage,
            error.message ||
                "Unable to save shipment.",
            "error"
        );
    }
}


// ============================================================
// CREATE SHIPMENT
// ============================================================

async function createShipment(
    shipmentData
) {

    let finalTracking =
        shipmentData.tracking_number ||
        "";


    if (!finalTracking) {

        finalTracking =
            await getUniqueTrackingNumber();
    }


    finalTracking =
        finalTracking
            .trim()
            .toUpperCase();


    // Make several attempts in case of a
    // very rare random collision.
    for (
        let attempt = 0;
        attempt < 5;
        attempt++
    ) {

        shipmentData.tracking_number =
            finalTracking;


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("shipments")
                    .insert([
                        shipmentData
                    ])
                    .select()
                    .single();


            if (error) {

                // PostgreSQL unique violation.
                if (
                    error.code ===
                    "23505"
                ) {

                    finalTracking =
                        await getUniqueTrackingNumber();

                    continue;
                }


                throw error;
            }


            // Create initial tracking history.
            const {
                error: historyError
            } =
                await supabaseClient
                    .from("tracking_updates")
                    .insert([
                        {
                            shipment_id:
                                data.id,

                            status:
                                data.status,

                            location:
                                data.current_location,

                            description:
                                "Shipment created and entered into the tracking system."
                        }
                    ]);


            if (historyError) {

                console.error(
                    "Initial tracking history error:",
                    historyError
                );
            }


            showMessage(
                shipmentMessage,
                `Shipment created successfully. Tracking number: ${data.tracking_number}`,
                "success"
            );


            return data;

        } catch (error) {

            if (
                error?.code ===
                "23505"
            ) {

                finalTracking =
                    await getUniqueTrackingNumber();

                continue;
            }


            throw error;
        }
    }


    throw new Error(
        "Unable to create the shipment because a unique tracking number could not be generated."
    );
}


// ============================================================
// UPDATE EXISTING SHIPMENT
// ============================================================

async function updateExistingShipment(
    shipmentId,
    shipmentData
) {

    const {
        data: oldShipment,
        error: oldError
    } =
        await supabaseClient
            .from("shipments")
            .select("*")
            .eq(
                "id",
                shipmentId
            )
            .single();


    if (oldError) {
        throw oldError;
    }


    if (
        shipmentData.tracking_number !==
        oldShipment.tracking_number
    ) {

        const duplicate =
            await trackingNumberExists(
                shipmentData.tracking_number,
                shipmentId
            );


        if (duplicate) {

            throw new Error(
                "That tracking number is already being used by another shipment."
            );
        }
    }


    const statusChanged =
        oldShipment.status !==
        shipmentData.status;


    const locationChanged =
        (
            oldShipment.current_location ||
            ""
        ) !==
        (
            shipmentData.current_location ||
            ""
        );


    const deliveryChanged =
        (
            oldShipment.estimated_delivery ||
            ""
        ) !==
        (
            shipmentData.estimated_delivery ||
            ""
        );


    const {
        data: updatedShipment,
        error
    } =
        await supabaseClient
            .from("shipments")
            .update(
                shipmentData
            )
            .eq(
                "id",
                shipmentId
            )
            .select()
            .single();


    if (error) {

        if (
            error.code ===
            "23505"
        ) {

            throw new Error(
                "That tracking number is already being used by another shipment."
            );
        }

        throw error;
    }


    if (
        statusChanged ||
        locationChanged ||
        deliveryChanged
    ) {

        let descriptionText =
            "Shipment information updated.";


        if (
            statusChanged &&
            locationChanged
        ) {

            descriptionText =
                `Shipment status changed from "${oldShipment.status}" to "${updatedShipment.status}" and location updated to "${updatedShipment.current_location || "Not specified"}".`;

        } else if (
            statusChanged
        ) {

            descriptionText =
                `Shipment status changed from "${oldShipment.status}" to "${updatedShipment.status}".`;

        } else if (
            locationChanged
        ) {

            descriptionText =
                `Shipment location updated to "${updatedShipment.current_location || "Not specified"}".`;

        } else if (
            deliveryChanged
        ) {

            descriptionText =
                `Estimated delivery updated to "${formatDateOnly(updatedShipment.estimated_delivery)}".`;
        }


        const {
            error: historyError
        } =
            await supabaseClient
                .from("tracking_updates")
                .insert([
                    {
                        shipment_id:
                            shipmentId,

                        status:
                            updatedShipment.status,

                        location:
                            updatedShipment.current_location,

                        description:
                            descriptionText
                    }
                ]);


        if (historyError) {

            console.error(
                "Automatic tracking history error:",
                historyError
            );
        }
    }


    showMessage(
        shipmentMessage,
        "Shipment updated successfully.",
        "success"
    );
}


// ============================================================
// EDIT SHIPMENT
// ============================================================

async function editShipment(
    shipmentId
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("shipments")
                .select("*")
                .eq(
                    "id",
                    shipmentId
                )
                .single();


        if (error) {
            throw error;
        }


        if (!data) {

            throw new Error(
                "Shipment could not be found."
            );
        }


        editingShipmentId.value =
            data.id;


        trackingNumber.value =
            data.tracking_number ||
            "";


        receiverName.value =
            data.receiver_name ||
            "";


        senderName.value =
            data.sender_name ||
            "";


        origin.value =
            data.origin ||
            "";


        destination.value =
            data.destination ||
            "";


        packageDescription.value =
            data.package_description ||
            "";


        weight.value =
            data.weight ||
            "";


        shippingType.value =
            data.shipping_type ||
            "Standard";


        status.value =
            data.status ||
            "Shipment Created";


        currentLocation.value =
            data.current_location ||
            "";


        if (
            data.estimated_delivery
        ) {

            estimatedDelivery.value =
                String(
                    data.estimated_delivery
                ).slice(
                    0,
                    10
                );

        } else {

            estimatedDelivery.value =
                "";
        }


        formTitle.textContent =
            "✏️ Edit Shipment";


        clearMessage(
            shipmentMessage
        );


        scrollToElement(
            document.getElementById(
                "shipmentFormCard"
            )
        );

    } catch (error) {

        console.error(
            "Edit shipment error:",
            error
        );


        alert(
            error.message ||
            "Unable to load shipment."
        );
    }
}


// ============================================================
// DELETE SHIPMENT
// ============================================================

async function deleteShipment(
    shipmentId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this shipment?\n\nIts tracking history will also be deleted.\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("shipments")
                .delete()
                .eq(
                    "id",
                    shipmentId
                );


        if (error) {
            throw error;
        }


        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete shipment error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete shipment."
        );
    }
}


// ============================================================
// TRACKING UPDATE
// ============================================================

async function addTrackingUpdate(
    event
) {

    event.preventDefault();

    clearMessage(
        trackingMessage
    );


    const tracking =
        updateTrackingNumber?.value
            .trim()
            .toUpperCase();


    const updateStatusValue =
        updateStatus?.value;


    const updateLocationValue =
        updateLocation?.value.trim();


    const descriptionValue =
        updateDescription?.value.trim();


    if (
        !tracking ||
        !updateStatusValue ||
        !updateLocationValue ||
        !descriptionValue
    ) {

        showMessage(
            trackingMessage,
            "Please complete all tracking update fields.",
            "error"
        );

        return;
    }


    try {

        const {
            data: shipment,
            error: shipmentError
        } =
            await supabaseClient
                .from("shipments")
                .select("*")
                .eq(
                    "tracking_number",
                    tracking
                )
                .maybeSingle();


        if (shipmentError) {
            throw shipmentError;
        }


        if (!shipment) {

            throw new Error(
                "No shipment was found with that tracking number."
            );
        }


        // Add history first.
        const {
            error: historyError
        } =
            await supabaseClient
                .from("tracking_updates")
                .insert([
                    {
                        shipment_id:
                            shipment.id,

                        status:
                            updateStatusValue,

                        location:
                            updateLocationValue,

                        description:
                            descriptionValue
                    }
                ]);


        if (historyError) {
            throw historyError;
        }


        // Update current shipment status/location.
        const {
            error: shipmentUpdateError
        } =
            await supabaseClient
                .from("shipments")
                .update({
                    status:
                        updateStatusValue,

                    current_location:
                        updateLocationValue
                })
                .eq(
                    "id",
                    shipment.id
                );


        if (shipmentUpdateError) {
            throw shipmentUpdateError;
        }


        showMessage(
            trackingMessage,
            "Tracking update added successfully.",
            "success"
        );


        resetTrackingForm();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Tracking update error:",
            error
        );


        showMessage(
            trackingMessage,
            error.message ||
                "Unable to add tracking update.",
            "error"
        );
    }
}


// ============================================================
// PREPARE TRACKING UPDATE
// ============================================================

async function prepareTrackingUpdate(
    tracking
) {

    if (!updateTrackingNumber) {
        return;
    }


    updateTrackingNumber.value =
        tracking || "";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("shipments")
                .select(
                    "status,current_location"
                )
                .eq(
                    "tracking_number",
                    tracking
                )
                .maybeSingle();


        if (
            !error &&
            data
        ) {

            updateStatus.value =
                data.status ||
                "Shipment Created";


            updateLocation.value =
                data.current_location ||
                "";
        }

    } catch (error) {

        console.error(
            "Prepare tracking update error:",
            error
        );
    }


    scrollToElement(
        document.getElementById(
            "trackingUpdateCard"
        )
    );
}


// ============================================================
// CUSTOMER TRACKING PAGE URL
// ============================================================

function getTrackingPageUrl(
    tracking = ""
) {

    let pageUrl = "";


    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes(
            "admin.html"
        )
    ) {

        pageUrl =
            window.location.href
                .replace(
                    /admin\.html.*$/i,
                    "index.html"
                );

    } else {

        pageUrl =
            window.location.origin +
            "/index.html";
    }


    // Remove accidental duplicate index.html.
    pageUrl =
        pageUrl.replace(
            /index\.htmlindex\.html/i,
            "index.html"
        );


    // Add tracking number as a URL parameter.
    if (tracking) {

        pageUrl +=
            "?tracking=" +
            encodeURIComponent(
                tracking
            );
    }


    return pageUrl;
}


// ============================================================
// COPY TO CLIPBOARD
// ============================================================

async function copyText(
    text
) {

    if (!text) {
        return false;
    }


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard
                .writeText(text);

            return true;
        }

    } catch (error) {

        console.warn(
            "Clipboard API failed:",
            error
        );
    }


    // Fallback for older/mobile browsers.
    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const successful =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        return successful;

    } catch (error) {

        console.error(
            "Copy fallback error:",
            error
        );

        return false;
    }
}


// ============================================================
// COPY TRACKING NUMBER
// ============================================================

async function copyTrackingNumber(
    tracking
) {

    if (!tracking) {

        alert(
            "No tracking number is available."
        );

        return;
    }


    const success =
        await copyText(
            tracking
        );


    if (success) {

        alert(
            `Tracking number copied:\n\n${tracking}`
        );

    } else {

        window.prompt(
            "Copy this tracking number:",
            tracking
        );
    }
}


// ============================================================
// COPY TRACKING LINK
// ============================================================

async function copyTrackingLink(
    tracking
) {

    if (!tracking) {

        alert(
            "No tracking number is available."
        );

        return;
    }


    const link =
        getTrackingPageUrl(
            tracking
        );


    const success =
        await copyText(
            link
        );


    if (success) {

        alert(
            "Customer tracking link copied successfully."
        );

    } else {

        window.prompt(
            "Copy this tracking link:",
            link
        );
    }
}


// ============================================================
// EXPORT CSV
// ============================================================

function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    const text =
        String(value)
            .replace(
                /"/g,
                '""'
            );


    return `"${text}"`;
}


async function exportShipmentsCSV() {

    try {

        const shipments =
            await getAllShipments();


        const filtered =
            filterShipments(
                shipments
            );


        if (!filtered.length) {

            alert(
                "There are no shipments to export."
            );

            return;
        }


        const headers = [
            "Tracking Number",
            "Sender",
            "Receiver",
            "Origin",
            "Destination",
            "Package",
            "Weight",
            "Shipping Type",
            "Status",
            "Current Location",
            "Estimated Delivery",
            "Created"
        ];


        const rows =
            filtered.map(
                shipment => [

                    shipment.tracking_number,

                    shipment.sender_name,

                    shipment.receiver_name,

                    shipment.origin,

                    shipment.destination,

                    shipment.package_description,

                    shipment.weight,

                    shipment.shipping_type,

                    shipment.status,

                    shipment.current_location,

                    shipment.estimated_delivery,

                    shipment.created_at
                ]
            );


        const csv =
            [
                headers,
                ...rows
            ]
                .map(
                    row =>
                        row
                            .map(
                                csvEscape
                            )
                            .join(",")
                )
                .join("\r\n");


        const blob =
            new Blob(
                [
                    "\uFEFF" +
                    csv
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        const date =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        link.download =
            `shipments-${date}.csv`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        alert(
            `${filtered.length} shipment record(s) exported successfully.`
        );

    } catch (error) {

        console.error(
            "CSV export error:",
            error
        );


        alert(
            error.message ||
            "Unable to export shipment records."
        );
    }
}


// ============================================================
// PRINT SHIPMENT
// ============================================================

async function printShipment(
    shipmentId
) {

    try {

        const {
            data: shipment,
            error
        } =
            await supabaseClient
                .from("shipments")
                .select("*")
                .eq(
                    "id",
                    shipmentId
                )
                .single();


        if (error) {
            throw error;
        }


        if (!shipment) {

            throw new Error(
                "Shipment could not be found."
            );
        }


        const trackingUrl =
            getTrackingPageUrl(
                shipment.tracking_number
            );


        const printWindow =
            window.open(
                "",
                "_blank"
            );


        if (!printWindow) {

            alert(
                "Your browser blocked the print window. Please allow pop-ups for this website and try again."
            );

            return;
        }


        const html = `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>
    Shipment ${escapeHTML(
        shipment.tracking_number
    )}
</title>

<style>

* {
    box-sizing: border-box;
}

body {
    font-family:
        Arial,
        Helvetica,
        sans-serif;

    margin: 0;

    padding: 30px;

    color: #111827;

    background: #ffffff;
}

.receipt {
    max-width: 800px;

    margin: 0 auto;

    border: 1px solid #d1d5db;

    border-radius: 14px;

    overflow: hidden;
}

.header {
    padding: 25px;

    background: #111827;

    color: white;

    text-align: center;
}

.header h1 {
    margin: 0 0 5px;

    font-size: 25px;
}

.header p {
    margin: 0;

    opacity: .85;
}

.notice {
    padding: 10px 15px;

    background: #f3f4f6;

    text-align: center;

    font-size: 12px;

    color: #4b5563;
}

.content {
    padding: 25px;
}

.tracking {
    padding: 18px;

    background: #eff6ff;

    border: 1px solid #bfdbfe;

    border-radius: 10px;

    text-align: center;

    margin-bottom: 20px;
}

.tracking-label {
    font-size: 12px;

    color: #6b7280;

    margin-bottom: 5px;
}

.tracking-number {
    font-size: 24px;

    font-weight: bold;

    letter-spacing: 1px;
}

.status {
    display: inline-block;

    margin-top: 10px;

    padding: 7px 12px;

    border-radius: 999px;

    background: #e5e7eb;

    font-size: 13px;

    font-weight: bold;
}

.grid {
    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 12px;

    margin-bottom: 20px;
}

.item {
    padding: 13px;

    border: 1px solid #e5e7eb;

    border-radius: 8px;
}

.label {
    display: block;

    font-size: 11px;

    color: #6b7280;

    margin-bottom: 4px;

    text-transform: uppercase;
}

.value {
    font-size: 14px;

    font-weight: 600;
}

.route {
    padding: 18px;

    border: 1px solid #e5e7eb;

    border-radius: 10px;

    margin-bottom: 20px;
}

.route-row {
    display: flex;

    justify-content:
        space-between;

    gap: 20px;
}

.route-point {
    flex: 1;
}

.route-arrow {
    display: flex;

    align-items: center;

    font-size: 22px;
}

.footer {
    padding: 20px;

    border-top: 1px solid #e5e7eb;

    text-align: center;

    font-size: 12px;

    color: #6b7280;
}

.qr-text {
    word-break: break-all;

    margin-top: 10px;

    font-size: 11px;
}

@media print {

    body {
        padding: 0;
    }

    .receipt {
        border: none;

        border-radius: 0;
    }

}

@media (max-width: 600px) {

    body {
        padding: 10px;
    }

    .grid {
        grid-template-columns: 1fr;
    }

    .route-row {
        flex-direction: column;
    }

    .route-arrow {
        justify-content: center;
    }

}

</style>

</head>

<body>

<div class="receipt">

    <div class="header">

        <h1>
            📦 ${BUSINESS_NAME}
        </h1>

        <p>
            Shipment Receipt / Waybill
        </p>

    </div>


    <div class="notice">

        DEMO / INDEPENDENT SERVICE —
        Not affiliated with United Airlines

    </div>


    <div class="content">

        <div class="tracking">

            <div class="tracking-label">
                TRACKING NUMBER
            </div>

            <div class="tracking-number">

                ${escapeHTML(
                    shipment.tracking_number ||
                    "N/A"
                )}

            </div>

            <div class="status">

                ${escapeHTML(
                    shipment.status ||
                    "Unknown"
                )}

            </div>

        </div>


        <div class="route">

            <div class="route-row">

                <div class="route-point">

                    <span class="label">
                        Origin
                    </span>

                    <div class="value">

                        ${escapeHTML(
                            shipment.origin ||
                            "Not specified"
                        )}

                    </div>

                </div>


                <div class="route-arrow">
                    →
                </div>


                <div class="route-point">

                    <span class="label">
                        Destination
                    </span>

                    <div class="value">

                        ${escapeHTML(
                            shipment.destination ||
                            "Not specified"
                        )}

                    </div>

                </div>

            </div>

        </div>


        <div class="grid">

            <div class="item">

                <span class="label">
                    Sender
                </span>

                <div class="value">

                    ${escapeHTML(
                        shipment.sender_name ||
                        "Not specified"
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Receiver
                </span>

                <div class="value">

                    ${escapeHTML(
                        shipment.receiver_name ||
                        "Not specified"
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Current Location
                </span>

                <div class="value">

                    ${escapeHTML(
                        shipment.current_location ||
                        "Not specified"
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Shipping Type
                </span>

                <div class="value">

                    ${escapeHTML(
                        shipment.shipping_type ||
                        "Standard"
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Package
                </span>

                <div class="value">

                    ${escapeHTML(
                        shipment.package_description ||
                        "Not specified"
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Weight
                </span>

                <div class="value">

                    ${
                        shipment.weight
                            ? escapeHTML(
                                shipment.weight
                            ) +
                              " kg"
                            : "Not specified"
                    }

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Estimated Delivery
                </span>

                <div class="value">

                    ${formatDateOnly(
                        shipment.estimated_delivery
                    )}

                </div>

            </div>


            <div class="item">

                <span class="label">
                    Created
                </span>

                <div class="value">

                    ${formatDate(
                        shipment.created_at
                    )}

                </div>

            </div>

        </div>


        <div class="item">

            <span class="label">
                Customer Tracking Link
            </span>

            <div class="value qr-text">

                ${escapeHTML(
                    trackingUrl
                )}

            </div>

        </div>

    </div>


    <div class="footer">

        For assistance, contact WhatsApp:
        +234 904 901 0493

        <br><br>

        Independent demonstration website.
        Not affiliated with United Airlines.

    </div>

</div>


<script>

window.onload = function() {

    setTimeout(
        function() {
            window.print();
        },
        500
    );

};

</script>

</body>

</html>
        `;


        printWindow.document.open();

        printWindow.document.write(
            html
        );

        printWindow.document.close();

    } catch (error) {

        console.error(
            "Print shipment error:",
            error
        );


        alert(
            error.message ||
            "Unable to prepare shipment for printing."
        );
    }
}


// ============================================================
// WHATSAPP CUSTOMER NOTIFICATION
// ============================================================

async function notifyCustomerWhatsApp(
    shipmentId
) {

    try {

        const {
            data: shipment,
            error
        } =
            await supabaseClient
                .from("shipments")
                .select("*")
                .eq(
                    "id",
                    shipmentId
                )
                .single();


        if (error) {
            throw error;
        }


        if (!shipment) {

            alert(
                "Shipment could not be found."
            );

            return;
        }


        const customerNumber =
            window.prompt(
                "Enter the customer's WhatsApp number.\n\nExample:\n08012345678\n\nor\n\n2348012345678"
            );


        if (!customerNumber) {
            return;
        }


        let phone =
            customerNumber.replace(
                /\D/g,
                ""
            );


        if (
            phone.startsWith("0") &&
            phone.length === 11
        ) {

            phone =
                "234" +
                phone.substring(1);
        }


        if (
            phone.length < 10 ||
            phone.length > 15
        ) {

            alert(
                "Please enter a valid WhatsApp number."
            );

            return;
        }


        const trackingPageUrl =
            getTrackingPageUrl(
                shipment.tracking_number
            );


        const message =

`Hello ${shipment.receiver_name || "Customer"},

This is an update from ${BUSINESS_NAME}.

📦 SHIPMENT DETAILS

🔎 Tracking Number:
${shipment.tracking_number || "N/A"}

📍 Current Location:
${shipment.current_location || "Not specified"}

🚚 Status:
${shipment.status || "Not specified"}

📍 Origin:
${shipment.origin || "Not specified"}

🏁 Destination:
${shipment.destination || "Not specified"}

📦 Package:
${shipment.package_description || "Not specified"}

⚖️ Weight:
${shipment.weight ? shipment.weight + " kg" : "Not specified"}

🚚 Shipping Type:
${shipment.shipping_type || "Standard"}

📅 Estimated Delivery:
${formatDateOnly(
    shipment.estimated_delivery
)}

🔗 Track your shipment:
${trackingPageUrl}

For assistance, contact us on WhatsApp:
+234 904 901 0493

Thank you.`;


        const whatsappUrl =
            "https://wa.me/" +
            phone +
            "?text=" +
            encodeURIComponent(
                message
            );


        // IMPORTANT:
        // Keep direct navigation because
        // this is already confirmed working
        // on the user's mobile device.
        window.location.href =
            whatsappUrl;


    } catch (error) {

        console.error(
            "WhatsApp notification error:",
            error
        );


        alert(
            error.message ||
            "Unable to prepare WhatsApp message."
        );
    }
}


// ============================================================
// QUICK ACTIONS
// ============================================================

function setupQuickActions() {

    if (quickCreateShipment) {

        quickCreateShipment.addEventListener(
            "click",
            () => {

                resetShipmentForm();


                scrollToElement(
                    document.getElementById(
                        "shipmentFormCard"
                    )
                );


                setTimeout(
                    () => {

                        trackingNumber?.focus();

                    },
                    400
                );
            }
        );
    }


    if (quickTrackingUpdate) {

        quickTrackingUpdate.addEventListener(
            "click",
            () => {

                scrollToElement(
                    document.getElementById(
                        "trackingUpdateCard"
                    )
                );


                setTimeout(
                    () => {

                        updateTrackingNumber?.focus();

                    },
                    400
                );
            }
        );
    }


    if (quickViewShipments) {

        quickViewShipments.addEventListener(
            "click",
            () => {

                scrollToElement(
                    document.getElementById(
                        "shipmentsCard"
                    )
                );


                setTimeout(
                    () => {

                        shipmentSearch?.focus();

                    },
                    400
                );
            }
        );
    }
}


// ============================================================
// EXPORT BUTTON
// ============================================================

function addExportButton() {

    if (
        !shipmentList ||
        document.getElementById(
            "dynamicExportShipmentsBtn"
        )
    ) {
        return;
    }


    const container =
        shipmentList.parentElement;


    if (!container) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "dynamicExportShipmentsBtn";


    button.type =
        "button";


    button.className =
        "btn btn-light";


    button.textContent =
        "📥 Export CSV";


    button.style.marginBottom =
        "12px";


    button.addEventListener(
        "click",
        exportShipmentsCSV
    );


    container.insertBefore(
        button,
        shipmentList
    );
}


// ============================================================
// EVENT LISTENERS
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginAdmin
    );
}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutAdmin
    );
}


if (refreshDashboardBtn) {

    refreshDashboardBtn.addEventListener(
        "click",
        async () => {

            refreshDashboardBtn.disabled =
                true;


            refreshDashboardBtn.textContent =
                "⏳ Refreshing...";


            try {

                await loadDashboard();

            } catch (error) {

                console.error(
                    "Manual refresh error:",
                    error
                );

            } finally {

                refreshDashboardBtn.disabled =
                    false;


                refreshDashboardBtn.textContent =
                    "🔄 Refresh";
            }
        }
    );
}


if (shipmentForm) {

    shipmentForm.addEventListener(
        "submit",
        saveShipment
    );
}


if (trackingUpdateForm) {

    trackingUpdateForm.addEventListener(
        "submit",
        addTrackingUpdate
    );
}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        resetShipmentForm
    );
}


if (shipmentSearch) {

    shipmentSearch.addEventListener(
        "input",
        loadShipments
    );
}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        loadShipments
    );
}


setupQuickActions();

addExportButton();


// ============================================================
// SUPABASE AUTH STATE
// ============================================================

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            stopDashboardAutoRefresh();

            showLogin();

            return;
        }


        if (
            event ===
                "SIGNED_IN" &&
            session
        ) {

            const isAdmin =
                await verifyAdmin(
                    session.user.id
                );


            if (isAdmin) {

                await showDashboard();

            } else {

                await supabaseClient.auth
                    .signOut();


                showLogin();


                showMessage(
                    loginMessage,
                    "This account does not have administrator access.",
                    "error"
                );
            }
        }
    }
);


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        addExportButton();

        checkSession();

    }
);


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.editShipment =
    editShipment;

window.deleteShipment =
    deleteShipment;

window.prepareTrackingUpdate =
    prepareTrackingUpdate;

window.notifyCustomerWhatsApp =
    notifyCustomerWhatsApp;

window.copyTrackingNumber =
    copyTrackingNumber;

window.copyTrackingLink =
    copyTrackingLink;

window.printShipment =
    printShipment;

window.exportShipmentsCSV =
    exportShipmentsCSV;
