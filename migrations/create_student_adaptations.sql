-- Create the student_adaptations table
CREATE TABLE IF NOT EXISTS student_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    adaptations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, student_id) -- Cada profe tiene un único registro de adaptación por alumno
);

-- Enable Row Level Security
ALTER TABLE student_adaptations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own student adaptations"
    ON student_adaptations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student adaptations"
    ON student_adaptations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student adaptations"
    ON student_adaptations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own student adaptations"
    ON student_adaptations FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_student_adaptations_updated_at
    BEFORE UPDATE ON student_adaptations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
