-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'trial', -- active, trial, expired, cancelled
    plan_type VARCHAR(50) DEFAULT 'yearly', -- yearly, monthly
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    provider_subscription_id VARCHAR(100), -- MercadoPago or Stripe ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own subscription
CREATE POLICY "Users can view their own subscription" ON subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Service Role (Admin) can manage subscriptions (implicit, but good to know)
-- We don't need a policy for Service Role as it bypasses RLS, 
-- but we might want one if we have an Admin dashboard user. 
-- For now, stricly user read-only.

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
