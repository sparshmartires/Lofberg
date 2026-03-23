# Löfbergs Internal Platform — Frontend

Internal web platform for generating sustainability reports and receipts for Löfbergs coffee customers. Used by administrators, salespersons, translators, and key account managers to manage customers, configure multi-language report templates, upload certification data via CSV, and produce branded PDF/JPEG outputs.

This repository is the **frontend only**. It communicates with the **LofbergServices** .NET backend API. Both must be running for the application to work.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Compiler) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| State / API | Redux Toolkit + RTK Query |
| UI primitives | Radix UI + shadcn/ui pattern |
| Rich text | TipTap 3 |
| Charts | Recharts 3 |
| Forms | react-hook-form |
| Icons | lucide-react |
| Auth | JWT stored in HttpOnly cookies |

---

## Prerequisites

### Required CLI tools

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS or later | JavaScript runtime |
| npm | comes with Node.js | Package manager |
| Git | any recent | Source control |

The backend also needs **.NET SDK 9** and **SQL Server** — see [Backend setup](#backend-setup) below.

---

## Installing CLI tools

### Windows

**Node.js**

Download the LTS installer from [nodejs.org](https://nodejs.org) and run it. npm is included.

Verify:
```powershell
node --version
npm --version
```

**Git**

Download from [git-scm.com](https://git-scm.com/download/win) and run the installer. Accept the default options.

Verify:
```powershell
git --version
```

**Optional: winget (Windows Package Manager)**

If you prefer the terminal, you can install both with winget:
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

---

### macOS

Install [Homebrew](https://brew.sh) if you do not already have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install the tools:
```bash
brew install node git
```

Verify:
```bash
node --version
npm --version
git --version
```

---

### Linux (Debian / Ubuntu)

**Git**
```bash
sudo apt update
sudo apt install -y git
git --version
```

**Node.js 20 LTS** via NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## Backend setup

The backend is a separate .NET 9 / EF Core / SQL Server application in the **LofbergServices** repository. The frontend will not work without it.

### 1 — Install .NET SDK 9

**Windows**

Download and run the installer from [dot.net](https://dot.net/download).

**macOS**
```bash
brew install --cask dotnet-sdk
```

**Linux (Debian / Ubuntu)**
```bash
wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-9.0
```

Verify:
```bash
dotnet --version
```

---

### 2 — Install SQL Server

**Windows**

Download [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (free edition). During setup, choose **Basic** installation type and note the connection string shown at the end — you will need it for the backend.

Also install [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup) for a GUI.

**macOS / Linux**

Run SQL Server in Docker (the simplest cross-platform approach):

```bash
# Pull and start SQL Server (change SA_PASSWORD to something strong)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 --name lofbergs-sql -d \
  mcr.microsoft.com/mssql/server:2022-latest
```

Your local connection string will be:
```
Server=localhost,1433;Database=LofbergsDb;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;
```

To start/stop the container later:
```bash
docker start lofbergs-sql
docker stop lofbergs-sql
```

---

### 3 — Configure and migrate the backend

1. Clone the backend repository and open it.
2. In `appsettings.Development.json`, set the `ConnectionStrings:DefaultConnection` to the connection string from the step above.
3. Run EF Core migrations to create the database schema:

```bash
# From the LofbergServices root
dotnet ef database update --project Infrastructure --startup-project Api
```

4. Start the API:
```bash
dotnet run --project Api
```

The API will start on `http://localhost:5215` by default. Keep this terminal open.

---

## Frontend setup

### 1 — Clone the repository

```bash
git clone <repository-url>
cd lofbergs-fe
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

Copy the example file and edit it:

**Windows (PowerShell)**
```powershell
Copy-Item .env.local.example .env.local
notepad .env.local
```

**macOS / Linux**
```bash
cp .env.local.example .env.local
# Edit with your preferred editor, e.g.:
nano .env.local
```

Open `.env.local` and set the variables:

| Variable | Description | Local default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the running .NET backend | `http://localhost:5215` |

If the backend is running on the default port you only need to confirm the value matches. No other environment variables are required for local development.

### 4 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available scripts

```bash
npm run dev      # Start local dev server with hot reload
npm run build    # Production build
npm run start    # Start production server (requires build first)
npm run lint     # Run ESLint
```

---

## Project structure (brief)

```
src/
├── app/          # Next.js App Router — pages are thin re-exports
├── components/   # Shared UI primitives (ui/) and layout shells (layout/)
├── features/     # All business logic, grouped by domain
├── store/        # Redux store, RTK Query API slices, typed hooks
├── icons/        # Custom SVG icon components
├── fonts/        # BrownStd font files
└── lib/          # Shared utilities (cn helper)
```

Feature folders under `src/features/` each contain `pages/` and `components/` subdirectories and own their domain logic end-to-end.
