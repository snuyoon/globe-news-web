CREATE TABLE IF NOT EXISTS user_portfolios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tickers text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own portfolio" ON user_portfolios
  FOR ALL USING (auth.uid() = user_id);
