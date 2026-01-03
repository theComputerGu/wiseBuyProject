# 🛒 WiseBuy – Smart Grocery Shopping Assistant

WiseBuy is a full-stack smart grocery shopping platform that helps users find the **best nearby stores**, **lowest prices**, and **optimal shopping experience** — all based on real-time data, user location, and collaborative shopping lists.

<p align="center">
  <img src="./Design/logo blue.png" alt="WiseBuy Logo" width="250"/>
</p>

WiseBuy allows users to create shopping lists, compare grocery prices across supermarkets, and easily decide where to shop using an intuitive mobile interface.

---

## 🚀 Features

- 📍 Location-based store comparison  
- 💰 Smart price aggregation and store scoring  
- 👥 Group shopping and shared shopping lists  
- 🗺️ Interactive checkout map with nearby stores  
- ⚡ Cached scraping for fast and up-to-date results  
- 🧠 Optional ML-powered product recommendations  

---

## 📱 Application Screens & Features

### 🛒 Shopping List
Create and manage your grocery shopping list with an intuitive interface.  
Items can be added, removed, and shared with group members in real time.

<p align="center">
  <img src="./Design/1000119345.jpg" alt="Shopping List Screen" width="250"/>
</p>

---

### 👥 Group Shopping
Collaborate with friends or family using shared shopping lists.  
All group members stay in sync and see updates instantly.

<p align="center">
  <img src="./Design//1000119339.jpg" alt="Group Shopping Screen" width="250"/>
</p>

---

### 🗺️ Smart Store Selection

During checkout, WiseBuy displays nearby supermarkets on an interactive map and automatically compares them based on key factors.  
Each store is evaluated according to **distance from the user**, **product availability**, and **total basket price**, and then assigned a final score between **1–100** to highlight the best shopping option.

<p align="center">
  <img src="./Design/1000119336.jpg" alt="Smart Store Selection Screen" width="250"/>
</p>


---

### 🧠 Smart Recommendations (Optional)
Get product recommendations based on previous purchases and shopping behavior,  
helping users discover relevant and popular items.

<p align="center">
  <img src="./Design/1000119345.jpg" alt="Recommendations Screen" width="250"/>
</p>



---
### 🕒 Shopping History

WiseBuy keeps a clear and organized history of previous shopping sessions.  
Users can review past shopping lists, see where they shopped, and track prices and totals over time.

<p align="center">
  <img src="./Design//1000119333.jpg" alt="Shopping History Screen" width="250"/>
</p>



---
### ➕ Add Products

Easily add products to your shopping list using a simple and fast input flow.  
Products can be searched, selected, and added with quantities in just a few taps.

<p align="center">
  <img src="./Design//1000119327.jpg" alt="Add Products Screen" width="250"/>
</p>

---



## 🧩 Tech Stack

**Frontend**
- React Native (Expo)
- Expo Router
- Redux Toolkit + RTK Query
- Custom reusable UI components

**Backend**
- Node.js
- NestJS
- MongoDB + Mongoose

**Scraper & ML**
- Python
- Selenium
- Experimental ML-based ranking logic

---

## 🧮 Store Scoring Logic

Each store receives a final score between **1–100** based on multiple factors:

```ts
finalScore =
  priceScore * 0.5 +
  distanceScore * 0.3 +
  availabilityScore * 0.2;
💰 Price – total basket cost
```

📍 Distance – proximity to the user

📦 Availability – number of found items

## 🗺️ Checkout Map
- Displays nearby stores on a map
- Adjustable search radius
- Color-coded store markers

- Best store highlighted automatically



## 🧠 ML Recommendations
The recommendation system is trained using:

User purchase history

- Global product popularity
- Similar user behavior
- Outputs include:
Suggested products
Smart sorting inside the shopping list


## 🔧 Installation & Running the Project
Clone the repository: git clone https://github.com/your-username/wisebuy.git

**Frontend**
```ts
cd wisebuy
cd Frontend
npx expo start -c
```

**Backend**
```ts
cd wisebuy
cd Server
npm run start:dev
```

## 📌 Project Management (Jira)
WiseBuy project board:
https://marksheinberg01.atlassian.net/jira/software/projects/WB/boards/1

