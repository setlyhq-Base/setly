# Setly Monorepo

A mono-repository for the Setly web application.

## Structure

- `/frontend` — Angular 19 app (TypeScript)
- `/backend`  — Node.js + Express API (TypeScript)

## Local Development

```
npm install      # Installs root and workspaces dependencies
npm run dev      # Starts both frontend and backend in development mode

# Or run individually:
npm run dev:front
npm run dev:back
```

## Building

```
npm run build
```