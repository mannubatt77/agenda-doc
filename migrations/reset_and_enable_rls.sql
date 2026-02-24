-- Primero, activamos RLS en todas las tablas por seguridad
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE intensification_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE intensification_results ENABLE ROW LEVEL SECURITY;

-- Borramos las politicas si es que ya existían (para evitar el error 42710)
DROP POLICY IF EXISTS "Users can manage their own schools" ON schools;
DROP POLICY IF EXISTS "Users can manage courses of their schools" ON courses;
DROP POLICY IF EXISTS "Users can manage students of their courses" ON students;
DROP POLICY IF EXISTS "Users can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Users can manage grades" ON grades;
DROP POLICY IF EXISTS "Users can manage events" ON events;
DROP POLICY IF EXISTS "Users can manage homeworks" ON homeworks;
DROP POLICY IF EXISTS "Users can manage homework status" ON homework_status;
DROP POLICY IF EXISTS "Users can manage sanctions" ON sanctions;
DROP POLICY IF EXISTS "Users can manage topic logs" ON topic_logs;
DROP POLICY IF EXISTS "Users can manage pending students" ON pending_students;
DROP POLICY IF EXISTS "Users can manage pending exams" ON pending_exams;
DROP POLICY IF EXISTS "Users can manage pending grades" ON pending_grades;
DROP POLICY IF EXISTS "Users can manage intensification instances" ON intensification_instances;
DROP POLICY IF EXISTS "Users can manage intensification results" ON intensification_results;

-- Opcional pero recomendado: borrar políticas genéricas de tipo "permitir todo" que puedan estar sobreescribiendo nuestra seguridad.
-- Estas son políticas que suele crear la UI de Supabase cuando se pone la tabla como "pública".
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON schools;
DROP POLICY IF EXISTS "Enable update for users based on email" ON schools;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON schools;

-- ---------------------------------------------------------
-- RE-CREAR LAS POLÍTICAS DE FORMA SEGURA
-- ---------------------------------------------------------

-- 1. SCHOOLS (Base table)
CREATE POLICY "Users can manage their own schools" ON schools
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2. COURSES (Linked to Schools)
CREATE POLICY "Users can manage courses of their schools" ON courses
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = courses.school_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM schools 
        WHERE schools.id = courses.school_id 
        AND schools.user_id = auth.uid()
    ));

-- 3. STUDENTS (Linked to Courses)
CREATE POLICY "Users can manage students of their courses" ON students
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = students.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = students.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 4. ATTENDANCE (Linked to Courses)
CREATE POLICY "Users can manage attendance" ON attendance
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = attendance.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = attendance.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 5. GRADES
CREATE POLICY "Users can manage grades" ON grades
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = grades.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = grades.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 6. EVENTS
CREATE POLICY "Users can manage events" ON events
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = events.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = events.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 7. HOMEWORKS
CREATE POLICY "Users can manage homeworks" ON homeworks
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = homeworks.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = homeworks.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 8. HOMEWORK STATUS (Linked to Homework)
CREATE POLICY "Users can manage homework status" ON homework_status
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM homeworks
        JOIN courses ON courses.id = homeworks.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE homeworks.id = homework_status.homework_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM homeworks
        JOIN courses ON courses.id = homeworks.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE homeworks.id = homework_status.homework_id 
        AND schools.user_id = auth.uid()
    ));

-- 9. SANCTIONS
CREATE POLICY "Users can manage sanctions" ON sanctions
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = sanctions.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = sanctions.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 10. TOPIC LOGS
CREATE POLICY "Users can manage topic logs" ON topic_logs
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = topic_logs.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = topic_logs.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 11. PENDING STUDENTS
CREATE POLICY "Users can manage pending students" ON pending_students
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = pending_students.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = pending_students.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 12. PENDING EXAMS
CREATE POLICY "Users can manage pending exams" ON pending_exams
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = pending_exams.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = pending_exams.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 13. PENDING GRADES (Linked to Pending Exams)
CREATE POLICY "Users can manage pending grades" ON pending_grades
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM pending_exams
        JOIN courses ON courses.id = pending_exams.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE pending_exams.id = pending_grades.exam_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM pending_exams
        JOIN courses ON courses.id = pending_exams.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE pending_exams.id = pending_grades.exam_id 
        AND schools.user_id = auth.uid()
    ));

-- 14. INTENSIFICATION INSTANCES
CREATE POLICY "Users can manage intensification instances" ON intensification_instances
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = intensification_instances.course_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses 
        JOIN schools ON schools.id = courses.school_id
        WHERE courses.id = intensification_instances.course_id 
        AND schools.user_id = auth.uid()
    ));

-- 15. INTENSIFICATION RESULTS (Linked to Instances)
CREATE POLICY "Users can manage intensification results" ON intensification_results
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM intensification_instances
        JOIN courses ON courses.id = intensification_instances.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE intensification_instances.id = intensification_results.instance_id 
        AND schools.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM intensification_instances
        JOIN courses ON courses.id = intensification_instances.course_id
        JOIN schools ON schools.id = courses.school_id
        WHERE intensification_instances.id = intensification_results.instance_id 
        AND schools.user_id = auth.uid()
    ));
