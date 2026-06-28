-- ===========================================================================
-- PLAYERMIND – מיגרציה 0005: העשרת מנוע הזיכרון
-- מוסיף ראיות ורמת ביטחון לפריטי זיכרון.
-- אידמפוטנטי – הרץ ב-SQL Editor אחרי הקבצים הקודמים.
-- ===========================================================================

alter table public.ai_memory add column if not exists evidence text;
alter table public.ai_memory add column if not exists confidence text; -- סימן ראשוני / מגמה מתפתחת / דפוס שחוזר על עצמו

-- weight משמש כ-occurrences; updated_at משמש כ-last_seen_at.
