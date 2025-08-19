-- Use the admin function to promote user to creator and admin
SELECT public.admin_set_creator_status('8fa4ceac-d3fc-47bd-96cf-ba0dc535735c', true, 'admin');