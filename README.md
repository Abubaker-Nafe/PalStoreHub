<!-- ────────────────────────────────────────────────────────────────────────── -->
<h1 align="center">PalStoreHub 🛍️🇵🇸</h1>
<p align="center">
A full‑stack marketplace that helps Palestinian shop‑owners list products online
and lets customers browse and buy from anywhere.<br/>
<sub>Frontend ▶︎ React + TypeScript · Backend ▶︎ ASP.NET Core Web API · Data ▶︎ MongoDB</sub>
</p>

---

## Project Tour
```text
PalStoreHub
├── Backend/
│   └── StoreHubApi
│       ├── Controllers/    # Product, Store & User endpoints
│       ├── Models/         # C# records (Product, Store, User…)
│       └── Services/       # Mongo‑backed data providers
├── Frontend/Palestine-Store-Hub/
│   └── src/                # React components, hooks, routes
└── pipelines/              # GitHub Actions workflows
```

---

## Key Features
| Domain            | What you get |
| ----------------- | ------------ |
| **Store hub**     | CRUD for stores & products, geo‑coordinates for map discovery |
| **User accounts** | Secure register / login with JWT, protected React routes |
| **Search & filter** | Client‑side filtering by category, price and distance |
| **Responsive UI** | Mobile‑first design built with Vite + React 18 |
| **Self‑contained API** | ASP.NET Core 8 Web API backed by MongoDB |

---

## Tech Stack
| Layer    | Technology |
|----------|------------|
| Frontend | React 18 · TypeScript · Vite |
| Backend  | ASP.NET Core 8 Web API · .NET 8 |
| Database | MongoDB 7 |
| DevOps   | GitHub Actions · Docker |

---

## Authors
- **Eddy Zayed**
- **Awad Sholi**
- **Nafe Abubaker**
- **Manar Dawod**
