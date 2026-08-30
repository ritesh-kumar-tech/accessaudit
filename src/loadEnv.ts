import dotenv from 'dotenv';

// Imported first (and only) for its side effect: populates process.env from
// .env before any other module evaluates. This matters because ES module
// imports are hoisted and evaluated in listed order before the importing
// file's own top-level code runs -- so a plain `dotenv.config()` call inside
// server.ts would run too late to affect modules (like supabaseServer.ts)
// that read process.env at module load time, unless this import comes first.
dotenv.config();
