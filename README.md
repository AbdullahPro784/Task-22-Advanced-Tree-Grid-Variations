# 🚀 Task 20: Advanced Grid Customization & Logic

![Task 20 Preview](preview.png)

This update introduces significant functional and cosmetic enhancements to the Data Grid, focusing on data integrity, UX stability, and hierarchical data visualization.

## ✅ Completed Requirements (13/13)

### 🎨 UI Stability & Search
* **Consistent Layout:** Fixed row heights to prevent layout shift during pagination, even with fewer records (**Point 1**).
* **Locked Dimensions:** Frozen header and cell widths to ensure visual consistency (**Point 2**).
* **Global Search:** Fixed top-left search functionality to filter across all allowable fields (**Point 9**).
* **Persistent Pagination:** Editing a record on Page 2/3 now keeps the user on the same page instead of resetting to Page 1 (**Point 12**).

### 🛡️ Data Integrity & Validation
* **Save Confirmation:** Double-clicking to edit now triggers a "Save/Discard" prompt to prevent accidental changes (**Point 3**).
* **Read-Only Fields:** `Asset ID` is now locked and cannot be modified via double-click (**Point 4**).
* **Smart Dropdowns:** The `Category` column now renders a Select Dropdown on edit instead of a text input (**Point 7**).

### ⚡ Advanced Actions
* **Batch Deletion:** Added checkbox selection for single or bulk row deletion (**Point 5**).
* **Context Menu:** Right-click (or 3-dot icon) on the `Vehicle` column opens a custom menu with options ("Assign Driver", "Check History") (**Point 6**).
* **Tree Data:** Implemented hierarchical grid logic. Sales records now expand to show nested Sales Items via an arrow toggle (**Point 13**).

### 🚦 Visual Indicators & Logic
* **Conditional Date Formatting:** (**Point 10**)
    * 🟧 **Orange:** < 5 days remaining.
    * 🟥 **Red:** < 2 days remaining.
    * ⬛ **Black:** Date passed.
* **Dynamic Iconography:** The status column now renders specific icons (Spanner 🔧, Hat 🧢, Settings ⚙️) based on the numeric data value (**Point 11**).
* **Toolbar Icons:** Explanation provided for top-right view switchers (List, Map, Analytics placeholders) (**Point 8**).

## 🛠️ Tech Stack
* **Framework:** Next.js
* **Grid Logic:** TanStack Table (Headless UI)
* **Styling:** Tailwind CSS