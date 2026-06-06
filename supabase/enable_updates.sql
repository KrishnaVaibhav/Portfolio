-- Enable Update for all users (needed to update the visit logs with exit data like time on page)
-- WARNING: This allows any user to update any row. In a production app with auth, you should key this to auth.uid().
-- For this public portfolio, we will allow it but relying on the client to only update their own row ideally.
-- A stricter policy would be to checking if the 'visitor_id' in the row matches the one in the request, but SQL doesn't see localStorage.
-- So we will enable it broadly for now, or you could restrict it to rows created in the last hour.

CREATE POLICY "Enable update for all users" ON public.user_visits
  FOR UPDATE USING (true);
