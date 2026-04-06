// src/lib/education/curriculum-expanded.ts
// Re-exports the education programs in a format optimized for DB sync.
// The education curriculum already has rich HTML inline — this file just
// makes it importable by the sync action without importing the full curriculum.

export { PROGRAMS } from './curriculum'
