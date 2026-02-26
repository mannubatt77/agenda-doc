CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    content_blocks JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson plans" ON public.lesson_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson plans" ON public.lesson_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson plans" ON public.lesson_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson plans" ON public.lesson_plans
    FOR DELETE USING (auth.uid() = user_id);
