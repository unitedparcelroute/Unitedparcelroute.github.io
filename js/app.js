// ==========================================
// CUSTOMER SHIPMENT TRACKING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const trackingForm =
        document.getElementById("trackingForm");

    if (trackingForm) {
        trackingForm.addEventListener(
            "submit",
            trackShipment
        );
    }

    // Automatically track shipment from URL
    autoTrackFromURL();
});


// ==========================================
// AUTOMATIC TRACKING FROM URL
// ==========================================

function autoTrackFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const trackingNumber =
        params.get("tracking");

    if (!trackingNumber) {
        return;
    }

    const cleanedTrackingNumber =
        trackingNumber.trim();

    if (!cleanedTrackingNumber) {
        return;
    }

    const input =
        document.getElementById(
            "trackingNumber"
        );

    if (input) {
        input.value =
            cleanedTrackingNumber;
    }

    // Automatically start tracking
    setTimeout(() => {

        performTracking(
            cleanedTrackingNumber
        );

    }, 500);
}


// ==========================================
// TRACK SHIPMENT
// ==========================================

async function trackShipment(event) {

    event.preventDefault();

    const input =
        document.getElementById(
            "trackingNumber"
        );

    if (!input) {
        return;
    }

    const trackingNumber =
        input.value.trim();

    if (!trackingNumber) {

        showMessage(
            "Please enter a tracking number.",
            "error"
        );

        return;
    }

    await performTracking(
        trackingNumber
    );
}


// ==========================================
// PERFORM TRACKING
// ==========================================

async function performTracking(
    trackingNumber
) {

    const input =
        document.getElementById(
            "trackingNumber"
        );

    const button =
        document.getElementById(
            "trackButton"
        );

    const result =
        document.getElementById(
            "shipmentResult"
        );


    if (!button) {
        return;
    }


    if (input) {
        input.value =
            trackingNumber;
    }


    button.disabled = true;

    button.textContent =
        "⏳ Tracking...";


    hideMessage();


    if (result) {
        result.classList.add(
            "hidden"
        );
    }


    try {

        // ==================================
        // GET SHIPMENT
        // ==================================

        const {
            data: shipment,
            error: shipmentError
        } = await supabaseClient.rpc(
            "track_shipment",
            {
                tracking_code:
                    trackingNumber
            }
        );


        if (shipmentError) {

            console.error(
                "Shipment error:",
                shipmentError
            );

            throw new Error(
                "Unable to search for this shipment."
            );
        }


        if (
            !shipment ||
            shipment.length === 0
        ) {

            showMessage(
                "No shipment was found with that tracking number. Please check the number and try again.",
                "error"
            );

            return;
        }


        // ==================================
        // GET TRACKING HISTORY
        // ==================================

        const {
            data: updates,
            error: updatesError
        } = await supabaseClient.rpc(
            "track_shipment_updates",
            {
                tracking_code:
                    trackingNumber
            }
        );


        if (updatesError) {

            console.error(
                "Tracking updates error:",
                updatesError
            );

        }


        // ==================================
        // DISPLAY SHIPMENT
        // ==================================

        displayShipment(
            shipment[0],
            updates || []
        );


        showMessage(
            "Shipment found successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        showMessage(
            error.message ||
            "Something went wrong while tracking the shipment.",
            "error"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "🔍 Track Shipment";

    }
}


// ==========================================
// DISPLAY SHIPMENT
// ==========================================

function displayShipment(
    shipment,
    updates
) {

    const result =
        document.getElementById(
            "shipmentResult"
        );


    if (!result) {
        return;
    }


    setText(
        "resultTrackingNumber",
        shipment.tracking_number ||
            "—"
    );


    setText(
        "resultLocation",
        shipment.current_location ||
            "—"
    );


    setText(
        "resultStatusText",
        shipment.status ||
            "—"
    );


    setText(
        "resultOrigin",
        shipment.origin ||
            "—"
    );


    setText(
        "resultDestination",
        shipment.destination ||
            "—"
    );


    setText(
        "resultReceiver",
        shipment.receiver_name ||
            "—"
    );


    setText(
        "resultPackage",
        shipment.package_description ||
            "—"
    );


    setText(
        "resultWeight",
        shipment.weight
            ? `${shipment.weight} kg`
            : "—"
    );


    setText(
        "resultShippingType",
        shipment.shipping_type ||
            "—"
    );


    setText(
        "resultEstimatedDelivery",
        formatDate(
            shipment.estimated_delivery
        )
    );


    // ==================================
    // STATUS BADGE
    // ==================================

    const statusBadge =
        document.getElementById(
            "resultStatus"
        );


    if (statusBadge) {

        statusBadge.textContent =
            shipment.status ||
            "Unknown";


        statusBadge.className =
            "status-badge " +
            getStatusClass(
                shipment.status
            );

    }


    // ==================================
    // SHIPMENT PROGRESS
    // ==================================

    updateShipmentProgress(
        shipment.status
    );


    // ==================================
    // TRACKING HISTORY
    // ==================================

    displayTimeline(
        updates
    );


    result.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);
}


// ==========================================
// SHIPMENT PROGRESS
// ==========================================

function updateShipmentProgress(
    currentStatus
) {

    const steps =
        document.querySelectorAll(
            ".progress-step"
        );


    if (!steps.length) {
        return;
    }


    const progressStatuses = [

        "Shipment Created",

        "Picked Up",

        "Processing",

        "In Transit",

        "Arrived at Facility",

        "Out for Delivery",

        "Delivered"

    ];


    let currentIndex =
        progressStatuses.findIndex(
            status =>
                status.toLowerCase() ===
                String(
                    currentStatus || ""
                ).toLowerCase()
        );


    // ==================================
    // SPECIAL STATUSES
    // ==================================

    if (
        String(currentStatus || "")
            .toLowerCase()
            .includes("customs")
    ) {

        currentIndex = 4;

    }


    if (
        String(currentStatus || "")
            .toLowerCase()
            .includes("attempted")
    ) {

        currentIndex = 5;

    }


    if (currentIndex < 0) {
        currentIndex = 0;
    }


    steps.forEach(
        (step, index) => {

            step.classList.remove(
                "completed",
                "current"
            );


            if (
                index < currentIndex
            ) {

                step.classList.add(
                    "completed"
                );

            }


            if (
                index === currentIndex
            ) {

                step.classList.add(
                    "current"
                );

            }

        }
    );
}


// ==========================================
// TRACKING TIMELINE
// ==========================================

function displayTimeline(
    updates
) {

    const timeline =
        document.getElementById(
            "trackingTimeline"
        );


    if (!timeline) {
        return;
    }


    if (
        !updates ||
        updates.length === 0
    ) {

        timeline.innerHTML = `
            <div class="timeline-empty">
                No tracking updates are available yet.
            </div>
        `;

        return;
    }


    timeline.innerHTML =
        updates.map(
            (update, index) => {

                return `

                    <div class="timeline-item">

                        <div class="timeline-dot">
                            ${
                                index === 0
                                    ? "✓"
                                    : "•"
                            }
                        </div>


                        <div class="timeline-content">

                            <strong>
                                ${
                                    escapeHTML(
                                        update.status ||
                                        "Update"
                                    )
                                }
                            </strong>


                            ${
                                update.location
                                    ? `
                                        <div class="timeline-location">
                                            📍
                                            ${
                                                escapeHTML(
                                                    update.location
                                                )
                                            }
                                        </div>
                                      `
                                    : ""
                            }


                            ${
                                update.description
                                    ? `
                                        <p>
                                            ${
                                                escapeHTML(
                                                    update.description
                                                )
                                            }
                                        </p>
                                      `
                                    : ""
                            }


                            ${
                                update.created_at
                                    ? `
                                        <span class="timeline-date">
                                            ${
                                                formatDateTime(
                                                    update.created_at
                                                )
                                            }
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");
}


// ==========================================
// TRACK ANOTHER SHIPMENT
// ==========================================

function trackAnotherShipment() {

    const result =
        document.getElementById(
            "shipmentResult"
        );


    const input =
        document.getElementById(
            "trackingNumber"
        );


    hideMessage();


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    if (input) {

        input.value = "";

        input.focus();

    }


    // Remove tracking number
    // from the browser URL.

    try {

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    } catch (error) {

        console.log(
            "Could not clean URL:",
            error
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// MESSAGES
// ==========================================

function showMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "trackingMessage"
        );


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        "tracking-message " +
        (type || "error");
}


function hideMessage() {

    const message =
        document.getElementById(
            "trackingMessage"
        );


    if (!message) {
        return;
    }


    message.textContent = "";


    message.className =
        "tracking-message hidden";
}


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "—";
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "Not available";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleDateString(
        "en-NG",
        {

            weekday: "short",

            day: "numeric",

            month: "short",

            year: "numeric"

        }
    );
}


// ==========================================
// FORMAT DATE & TIME
// ==========================================

function formatDateTime(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleString(
        "en-NG",
        {

            weekday: "short",

            day: "numeric",

            month: "short",

            year: "numeric",

            hour: "numeric",

            minute: "2-digit"

        }
    );
}


// ==========================================
// STATUS COLORS
// ==========================================

function getStatusClass(
    status
) {

    if (!status) {
        return "";
    }


    const value =
        status.toLowerCase();


    if (
        value.includes("delivered")
    ) {

        return "status-delivered";

    }


    if (
        value.includes("attempted")
    ) {

        return "status-attempted";

    }


    if (
        value.includes("out for delivery")
    ) {

        return "status-out";

    }


    if (
        value.includes("customs")
    ) {

        return "status-customs";

    }


    if (
        value.includes("facility")
    ) {

        return "status-facility";

    }


    if (
        value.includes("transit")
    ) {

        return "status-transit";

    }


    if (
        value.includes("processing")
    ) {

        return "status-processing";

    }


    if (
        value.includes("picked")
    ) {

        return "status-picked";

    }


    return "status-created";
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
          }
