-- Fix for grades table type constraint to allow 'final' and 'final_informe'
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_type_check;

ALTER TABLE grades ADD CONSTRAINT grades_type_check CHECK (type IN ('exam', 'tp', 'informe', 'final', 'final_informe'));
