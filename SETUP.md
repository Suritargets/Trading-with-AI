# ST-Trading-EDU — Setup Guide

## Opties
- **Optie A: Vercel + Neon** (online, meerdere gebruikers)
- **Optie B: Lokaal draaien** (alleen op jouw computer)

---

## Optie A — Vercel + Neon (aanbevolen)

### Stap 1: Neon database aanmaken
1. Ga naar [console.neon.tech](https://console.neon.tech) en maak een account
2. Maak een nieuw project aan (bijv. `st-trading-edu`)
3. Ga naar **SQL Editor** en voer `schema.sql` uit:
   - Open `schema.sql` uit deze map
   - Kopieer alles en plak in de SQL Editor
   - Klik **Run**
4. Ga naar **Connection Details** → kopieer de **connection string**
   - Ziet er zo uit: `postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`

### Stap 2: Vercel project aanmaken
1. Ga naar [vercel.com](https://vercel.com) en log in
2. Klik **Add New → Project**
3. Kies **"Import Git Repository"** of **"Deploy without Git"**

**Optie zonder Git (makkelijkste):**
1. Installeer Vercel CLI: open Terminal en type:
   ```
   npm install -g vercel
   ```
2. Navigeer naar de map van de app:
   ```
   cd "pad/naar/trade app"
   ```
3. Deploy:
   ```
   vercel
   ```
   - Kies je team: **ST Kento's projects**
   - Projectnaam: `st-trading-edu`
   - Klik Enter bij alle vragen

### Stap 3: DATABASE_URL instellen in Vercel
1. Ga naar je project op vercel.com
2. Klik **Settings → Environment Variables**
3. Voeg toe:
   - **Name:** `DATABASE_URL`
   - **Value:** jouw Neon connection string (uit Stap 1.4)
   - **Environment:** Production, Preview, Development ✅
4. Klik **Save**

### Stap 4: Herdeployeer
```
vercel --prod
```
Of push naar Git als je dat hebt ingesteld.

### Stap 5: Klaar!
Je app is live op: `https://st-trading-edu.vercel.app`

**Admin inloggen:**
- URL: `https://jouw-url.vercel.app/admin.html`
- Wachtwoord: `kento2025` (verander dit direct!)

---

## Optie B — Lokaal draaien

### Vereisten
- Node.js 18+ (check: `node --version`)
- Een Neon database (zie Stap 1 van Optie A, of gebruik SQLite lokaal — neem contact op)

### Installeren
1. Open Terminal in de map van de app
2. Installeer afhankelijkheden:
   ```
   npm install
   ```
3. Kopieer het voorbeeld .env bestand:
   ```
   cp .env.example .env
   ```
4. Open `.env` en vul je Neon connection string in:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require
   ```

### Starten
```
node server.js
```
of
```
npm start
```

De app opent op:
- **App:** http://localhost:3000
- **Admin:** http://localhost:3000/admin.html

---

## Admin standaard inloggegevens
- **Email:** admin
- **Wachtwoord:** kento2025

⚠️ **Verander dit direct na de eerste login via Admin → Instellingen → Wachtwoord Wijzigen!**

---

## Problemen?
- API geeft 500 fout → DATABASE_URL is niet correct ingesteld
- Login werkt niet → Controleer of schema.sql correct is uitgevoerd in Neon
- Lokaal geen verbinding → Controleer je .env bestand
