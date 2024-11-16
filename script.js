// Milk, Attendance, and Custom Data
const data = {};

// Initialize Calendar
const calendarGrid = document.getElementById("calendar-grid");
const monthYearLabel = document.getElementById("month-year");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
let currentDate = new Date();

// Modal Elements
const modal = document.getElementById("input-modal");
const closeModal = document.getElementById("close-modal");
const modalDateLabel = document.getElementById("modal-date");
const milkInput = document.getElementById("milk-input");
const attendanceInput = document.getElementById("attendance-status");
const saveDataButton = document.getElementById("save-data");

// Custom Data Elements
const customFieldName = document.getElementById("custom-field-name");
const customFieldQuantity = document.getElementById("custom-field-quantity");
const addCustomFieldButton = document.getElementById("add-custom-field");
const customDataList = document.getElementById("custom-data-list");

// Export Button
const exportButton = document.getElementById("export-data");

// Render Calendar
function renderCalendar(date) {
    calendarGrid.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();

    // Set Month-Year Label
    monthYearLabel.textContent = `${date.toLocaleString("default", {
        month: "long",
    })} ${year}`;

    // Get first and last days of the month
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Render Empty Cells for Previous Month
    let currentRow = document.createElement("div");
    currentRow.classList.add("calendar-row");

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-cell", "empty-cell");
        currentRow.appendChild(cell);
    }

    // Render Days of the Month
    for (let day = 1; day <= lastDate; day++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");
        const dateKey = `${year}-${month + 1}-${day}`;

        // Display Date and Day of Week (small font below date)
        const dayOfWeek = new Date(year, month, day).getDay();
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        cell.innerHTML = `
            <div><strong>${day}</strong></div>
            <div class="day-of-week">${daysOfWeek[dayOfWeek]}</div>
        `;

        const dataForDate = data[dateKey] || {};

        // If data is available, display it, otherwise leave it blank
        const milk = dataForDate.milk !== undefined ? `${dataForDate.milk}L` : '';
        const attendance = dataForDate.attendance || '';
        const customData = dataForDate.customData || [];
        
        const customDataDisplay = customData
            .map(item => `${item.name}: ${item.quantity}`)
            .join("<br>");

        // Add data directly to cell
        let dataDisplay = "";
        if (milk) {
            dataDisplay += `Milk: ${milk}<br>`;
        }
        if (attendance) {
            dataDisplay += `Maid: ${attendance}<br>`;
        }
        if (customDataDisplay) {
            dataDisplay += `${customDataDisplay}`;
        }

        // Add N/A only if a field is missing after saving
        if (!milk && !attendance && customData.length === 0 && dataForDate.saved) {
            dataDisplay = `<span class="na">N/A</span>`;
        }

        // Add the content to the calendar cell
        cell.innerHTML += `<div class="cell-data">${dataDisplay}</div>`;

        // Add event listener for clicking to open modal for editing data
        cell.addEventListener("click", () => {
            openModal(dateKey); // Open modal to edit data
        });

        // Make sure the box doesn't increase in size when multiple data are added
        cell.classList.add("calendar-cell-fixed-size");

        currentRow.appendChild(cell);

        // Start a new row when 7 cells are added (one for each day of the week)
        if ((firstDay + day) % 7 === 0 || day === lastDate) {
            calendarGrid.appendChild(currentRow);
            currentRow = document.createElement("div");
            currentRow.classList.add("calendar-row");
        }
    }
}

// Open Modal
function openModal(dateKey) {
    modalDateLabel.textContent = `Date: ${dateKey}`;
    milkInput.value = data[dateKey]?.milk || "";
    attendanceInput.value = data[dateKey]?.attendance || "Present";

    const customData = data[dateKey]?.customData || [];
    customDataList.innerHTML = customData
        .map(
            (item) =>
                `<div>${item.name}: ${item.quantity}</div>`
        )
        .join("");

    saveDataButton.onclick = () => {
        const milk = parseFloat(milkInput.value) || undefined;
        const attendance = attendanceInput.value;
        const customData = data[dateKey]?.customData || [];

        // If no data is entered, leave as undefined
        if (milk === undefined && attendance === "Present" && customData.length === 0) {
            data[dateKey].saved = false;  // Mark as unsaved state
        } else {
            data[dateKey] = {
                milk: milk,
                attendance: attendance || "N/A",
                customData: customData,
                saved: true // Mark as saved
            };
        }

        // Re-render calendar with updated data
        modal.classList.add("hidden");
        renderCalendar(currentDate);
    };

    modal.classList.remove("hidden");
}

// Add Custom Data
addCustomFieldButton.addEventListener("click", () => {
    const name = customFieldName.value.trim();
    const quantity = customFieldQuantity.value.trim();

    if (!name || !quantity) {
        alert("Please provide both field name and quantity.");
        return;
    }

    const dateKey = modalDateLabel.textContent.split(": ")[1];
    if (!data[dateKey]) {
        data[dateKey] = { customData: [] };
    }

    data[dateKey].customData.push({ name, quantity });
    customFieldName.value = "";
    customFieldQuantity.value = "";
    openModal(dateKey);
});

// Close Modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// Export to Excel
exportButton.addEventListener("click", () => {
    const workbook = XLSX.utils.book_new();
    const sheetData = [];

    for (const dateKey in data) {
        const entry = {
            Date: dateKey,
            Milk: data[dateKey]?.milk || "N/A",
            Maid: data[dateKey]?.attendance || "N/A",
        };

        (data[dateKey]?.customData || []).forEach((item) => {
            entry[item.name] = item.quantity;
        });

        sheetData.push(entry);
    }

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Milk_Maid_Data");
    XLSX.writeFile(workbook, "Milk_Maid_Data.xlsx");
});

// Navigate Months
prevMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

// Initialize App
renderCalendar(currentDate);
