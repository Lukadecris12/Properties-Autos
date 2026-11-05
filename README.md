# PropertyHub — Global AI-Powered Property & Automobile Marketplace

A premium, globally scalable digital marketplace for **Land, Houses, Apartments, Commercial Properties, Cars, and Vehicles**. Designed for Nigeria as the initial target market with built-in international expansion capabilities (multi-currency, timezone, and country awareness).

---

## 🏛 System Architecture

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy (Async), Pydantic v2, PostgreSQL (PostGIS & pgvector) / aiosqlite, Redis, WebSockets.
- **Web**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide icons.
- **Mobile**: Flutter cross-platform (Android & iOS) connecting to the exact same FastAPI backend.
- **Intelligence**: Bidirectional AI Matching Engine, Natural-Language Intent Search, AI Marketplace Concierge, Listing Enhancer, and Document Analyzer.

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Seeding

```bash
# Activate virtual environment
.\test_venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# Run automated tests
pytest backend/tests -v

# Seed realistic Nigerian marketplace data & run AI matching
python backend/seed.py

# Start FastAPI development server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Next.js Web Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm start
```
- Web Application: [http://localhost:3000](http://localhost:3000)

### 3. Flutter Mobile Application

```bash
cd mobile

# Fetch dependencies
flutter pub get

# Run on Android Emulator or iOS Simulator
flutter run
```

---

## 🔑 Key Marketplace Capabilities

1. **Mandatory Transaction Separation**:
   - `BUY` (`SALE`), `RENT`, and `LEASE` are first-class, strictly separated transaction modes.
   - Rental listings enforce mandatory periodic pricing display (`₦/night`, `₦/month`, `₦/year`).
2. **Bidirectional AI Matching Engine**:
   - Matches buyers and tenants with published listings (Direction A).
   - Matches sellers and landlords with active seeker requirements (Direction B).
   - Multi-factor compatibility scoring (0–100%) with transparent score breakdowns and natural-language explanations.
3. **Anti-Double-Booking Protection**:
   - Atomic overlap prevention for short-let apartments and vehicle rentals.
4. **Unified User Accounts**:
   - Single account with dynamic mode switcher (Buyer, Seller, Landlord, Auto Dealer, Agent).
5. **AI Concierge**:
   - In-app assistance explaining title documents (C of O, Governor's Consent), rental calculations, and discovery.

---

## 🛡 Security & Compliance

- Argon2 password hashing and JWT access/refresh token architecture.
- Role-based and object-level access controls enforced on the backend.
- Mandatory legal disclaimers on AI document analysis (ensuring automated scanning is never mistaken for statutory title transfer).
