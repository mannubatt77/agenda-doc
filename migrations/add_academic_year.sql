-- 1. Add academic_year column to schools table
-- We default to 2026 for existing data
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS academic_year INTEGER DEFAULT 2026;

-- 2. Create RPC function to clone structure for a new year
-- This function duplicates Schools and Courses for the calling user, for a specific target year.
-- It resets the calendar dates (set to NULL) because they change every year.
CREATE OR REPLACE FUNCTION copy_academic_year_structure(source_year INTEGER, target_year INTEGER)
RETURNS VOID AS $$
DECLARE
    old_school RECORD;
    new_school_id UUID;
    old_course RECORD;
BEGIN
    -- Iterate over schools belonging to the current user (auth.uid()) that match the source_year
    FOR old_school IN 
        SELECT * FROM schools 
        WHERE academic_year = source_year 
        AND user_id = auth.uid()
    LOOP
        -- Insert new school copy
        -- We generate a new ID automatically (assuming uuid_generate_v4() or default)
        -- We reset term dates to NULL
        INSERT INTO schools (
            name, 
            user_id, 
            term_structure, 
            academic_year,
            term1_start, term1_end,
            term2_start, term2_end,
            term3_start, term3_end
        )
        VALUES (
            old_school.name, 
            auth.uid(), 
            old_school.term_structure, 
            target_year,
            NULL, NULL,
            NULL, NULL,
            NULL, NULL
        )
        RETURNING id INTO new_school_id;

        -- Iterate over courses of the old school
        FOR old_course IN
            SELECT * FROM courses WHERE school_id = old_school.id
        LOOP
            -- Insert new course copy linked to the new school
            INSERT INTO courses (school_id, name, year, division, schedule)
            VALUES (new_school_id, old_course.name, old_course.year, old_course.division, old_course.schedule);
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
