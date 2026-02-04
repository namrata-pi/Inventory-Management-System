# Inventory-Management-System


# 📦 Inventory Management System (FastAPI + HTML/CSS/JS)

A complete full-stack **Inventory Management System** built using  
**FastAPI (REST API)**, **SQLite**, **HTML/CSS/JavaScript**, and **Chart.js**.

This project was developed as part of a case-study for a manufacturing firm that needed:
- A simple interface to manage raw materials & finished goods  
- CRUD operations on inventory  
- Stock alerts  
- Summary dashboard  
- Visual charts for analytics

---

## 🚀 Features

### ✅ **Inventory Operations**
- Add new items  
- Update existing items  
- Delete items  
- View all items in a modern, clean table  

### 🎯 **Filtering System**
- Filter by Item Name  
- Filter by Category  
- Filter by Supplier  
- Filter by Stock Status (In-Stock / Low-Stock / Out-of-Stock)  
- Dynamic dropdown values  
- Reset & clear filter options  

### 📊 **Dashboard & Visual Analytics**
- **Pie Chart:** In Stock vs Low Stock vs Out of Stock  
- **Bar Chart:** Category-wise stock levels  
- **Inventory Summary Cards:**  
  - Total Items  
  - Total Quantity  
  - Low Stock Count  
- **Category Chips:** compact representation of category distribution  
- **Last Updated Item** info box

### ⚡ **UI Enhancements**
- Beautiful modern table (hover effects, shadows, rounded corners)  
- User-friendly form layout  
- Predefined item names  
- Real-time updates after CRUD operations  

---

## 🏗️ **Architecture Overview**
┌───────────────────────────────┐
│          Frontend UI          │
│  (HTML • CSS • JavaScript)    │
└───────────────┬───────────────┘
                │ Fetch API (AJAX)
                ▼
┌───────────────────────────────┐
│        FastAPI Backend        │
│   (RESTful API Endpoints)     │
└───────────────┬───────────────┘
                │ SQLAlchemy ORM
                ▼
┌───────────────────────────────┐
│        SQLite Database        │
│ (Persistent Inventory Storage)│
└───────────────────────────────┘


