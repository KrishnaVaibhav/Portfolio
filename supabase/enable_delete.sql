-- Enable delete for all users
-- Allow any user (since we manage auth client-side) to delete rows
create policy "Enable delete for all users"
on "public"."user_visits"
as PERMISSIVE
for DELETE
to public
using (true);
