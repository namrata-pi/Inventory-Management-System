let allItems = []; 

const API_BASE = "http://127.0.0.1:8000";
let stockChart;
let categoryBarChart = null;


window.onload = function () {
    loadInventory();
    loadSummary();
    checkAlerts();
};

// ---------------------- LOAD INVENTORY ----------------------

async function loadInventory() {
    const res = await fetch(`${API_BASE}/inventory`);
    allItems = await res.json();

    displayItems(allItems);  
    loadFilterValues();       
    drawStockPieChart(allItems); 
}



function displayItems(items) {
    const tableBody = document.getElementById("inventory-body");
    tableBody.innerHTML = "";

    items.forEach(item => {
        const row = document.createElement("tr");

        if (item.quantity_in_stock < item.reorder_level) {
            row.classList.add("low-stock");
        }

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.item_name}</td>
            <td>${item.category}</td>
            <td>${item.quantity_in_stock}</td>
            <td>${item.reorder_level}</td>
            <td>${item.supplier}</td>
            <td>${item.last_updated}</td>

            <td>
                <button class="edit-btn" onclick="openEditForm(${item.id}, '${item.item_name}', '${item.category}', ${item.quantity_in_stock}, ${item.reorder_level}, '${item.supplier}')">Edit</button>

                <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}



// ---------------------- ADD ITEM ----------------------

document.getElementById("add-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const item = {
        item_name: document.getElementById("item_name").value,
        category: document.getElementById("category").value,
        quantity_in_stock: parseInt(document.getElementById("quantity_in_stock").value),
        reorder_level: parseInt(document.getElementById("reorder_level").value),
        supplier: document.getElementById("supplier").value
    };

    const res = await fetch(`${API_BASE}/inventory`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(item)
    });

    if (res.ok) {
        alert("Item added successfully!");
        loadInventory();
        loadSummary();
        e.target.reset();
    } else {
        alert("Error adding item");
    }
});

// ---------------------- SUMMARY ----------------------

async function loadSummary() {
    const res = await fetch(`${API_BASE}/inventory/summary`);
    const summary = await res.json();

    document.getElementById("total-items").innerText = summary.total_items;
    document.getElementById("total-quantity").innerText = summary.total_quantity;
    document.getElementById("low-stock-count").innerText = summary.low_stock_count;


const categoryContainer = document.getElementById("category-chips");
categoryContainer.innerHTML = "";

for (const [category, count] of Object.entries(summary.category_summary)) {
    const chip = document.createElement("span");
    chip.className = "category-chip";
    chip.innerText = `${category} (${count})`;
    categoryContainer.appendChild(chip);
}
drawCategoryBarChart(summary.category_summary);


}

function getStockStatusCounts(items) {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    items.forEach(item => {
        if (item.quantity_in_stock === 0) {
            outOfStock++;
        } else if (item.quantity_in_stock <= item.reorder_level) {
            lowStock++;
        } else {
            inStock++;
        }
    });

    return { inStock, lowStock, outOfStock };
}


function drawStockPieChart(items) {
    const { inStock, lowStock, outOfStock } = getStockStatusCounts(items);

    const ctx = document.getElementById("stockStatusChart");

    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["In Stock", "Low Stock", "Out of Stock"],
            datasets: [{
                data: [inStock, lowStock, outOfStock],
                backgroundColor: ["#4CAF50", "#FFC107", "#F44336"]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });
}





// ---------------------- ALERT CHECK ----------------------

async function checkAlerts() {
    const res = await fetch(`${API_BASE}/inventory/alerts`);
    const alertItems = await res.json();

    if (alertItems.length > 0) {
        alert(`⚠ ${alertItems.length} items are low on stock!`);
    }
}

async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        alert("Item deleted!");
        await loadInventory();  
        await loadSummary(); 
    } else {
        alert("Failed to delete item");
    }
}




function openEditForm(id, name, category, qty, reorder, supplier) {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-item_name").value = name;
    document.getElementById("edit-category").value = category;
    document.getElementById("edit-quantity_in_stock").value = qty;
    document.getElementById("edit-reorder_level").value = reorder;
    document.getElementById("edit-supplier").value = supplier;

    document.getElementById("edit-box").style.display = "block";
}



function closeEditForm() {
    document.getElementById("edit-box").style.display = "none";
}


document.getElementById("edit-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("edit-id").value;

    const item = {
        item_name: document.getElementById("edit-item_name").value,
        category: document.getElementById("edit-category").value,
        quantity_in_stock: parseInt(document.getElementById("edit-quantity_in_stock").value),
        reorder_level: parseInt(document.getElementById("edit-reorder_level").value),
        supplier: document.getElementById("edit-supplier").value
    };

    const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(item)
    });

    if (res.ok) {
        alert("Item updated!");
        loadInventory();
        loadSummary();
        closeEditForm();
    } else {
        alert("Failed to update item");
    }
});



function loadFilterValues() {
    const filterType = document.getElementById("filter-type").value;
    const filterValueDropdown = document.getElementById("filter-value");

    // Reset
    filterValueDropdown.innerHTML = `<option value="">-- Select Value --</option>`;

    if (!filterType) return;

    // Extract unique values for selected field
    const uniqueValues = [...new Set(allItems.map(item => item[filterType]))];

    uniqueValues.forEach(val => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        filterValueDropdown.appendChild(option);
    });
}



function applyAdvancedFilter() {
    const type = document.getElementById("filter-type").value;
    const value = document.getElementById("filter-value").value;

    // Handle Stock Status Filters
    if (type === "status_in") {
        const filtered = allItems.filter(item => item.quantity_in_stock > item.reorder_level);
        displayItems(filtered);
        return;
    }

    if (type === "status_low") {
        const filtered = allItems.filter(item =>
            item.quantity_in_stock > 0 &&
            item.quantity_in_stock <= item.reorder_level
        );
        displayItems(filtered);
        return;
    }

    if (type === "status_out") {
        const filtered = allItems.filter(item => item.quantity_in_stock === 0);
        displayItems(filtered);
        return;
    }

    // Normal filtering (item_name, category, supplier)
    if (!type || !value) {
        displayItems(allItems);
        return;
    }

    const filtered = allItems.filter(item => item[type] === value);
    displayItems(filtered);
}



function clearAdvancedFilter() {
    document.getElementById("filter-type").value = "";
    document.getElementById("filter-value").innerHTML = `<option value="">-- Select Value --</option>`;
    displayItems(allItems);
}



function resetFilter() {
    document.getElementById("filter-type").value = "";
    document.getElementById("filter-value").innerHTML = `<option value="">Select Value</option>`;
    displayItems(allItems);
}



function expandFilter() {
    alert("Expand function can show advanced filters (multiple filters, search, etc.)");
}

function getStockStatusCounts(items) {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    items.forEach(item => {
        if (item.quantity_in_stock === 0) {
            outOfStock++;
        } else if (item.quantity_in_stock <= item.reorder_level) {
            lowStock++;
        } else {
            inStock++;
        }
    });

    return { inStock, lowStock, outOfStock };
}

function loadFilterValues() {
    const type = document.getElementById("filter-type").value;
    const dropdown = document.getElementById("filter-value");


    dropdown.innerHTML = `<option value="">Select Value</option>`;

   
    if (type === "status_in" || type === "status_low" || type === "status_out") {
        applyAdvancedFilter(); 
        return;
    }


    if (!type) {
        displayItems(allItems);
        return;
    }


    const uniqueValues = [...new Set(allItems.map(item => item[type]))];

    uniqueValues.forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        dropdown.appendChild(opt);
    });
}

function drawCategoryBarChart(categorySummary) {

    const ctx = document.getElementById("categoryBarChart");

    const labels = Object.keys(categorySummary);
    const values = Object.values(categorySummary);

    if (categoryBarChart) {
        categoryBarChart.destroy();
    }

    categoryBarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "",
                data: values,

                backgroundColor: values.map((v, i) =>
                    i === 0 ? "#8CD35A" : "#1E90FF"
                ),

                borderColor: "transparent",
                borderWidth: 1,
                borderRadius: 3
            }]
        },

        plugins: [ChartDataLabels],

        options: {
            plugins: {
                legend: { display: false },

                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: "#000",
                    font: { weight: "bold", size: 13 }
                }
            },

            scales: {
                x: {
                    ticks: { color: "#333", font: { size: 12 } },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#333" },
                    grid: {
                        color: "#ddd",
                        lineWidth: 0.3
                    }
                }
            },

            layout: {
                padding: { top: 20, right: 10, left: 10, bottom: 10 }
            }
        }
    });
}








