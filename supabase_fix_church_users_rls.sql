-- Enable RLS on church_users if not already enabled
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own association
-- This is necessary when a user creates a new church and assigns themselves as owner
CREATE POLICY "Users can insert their own church association"
ON church_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure users can view their own associations (usually already exists, but good to double check)
CREATE POLICY "Users can view their own church associations"
ON church_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
