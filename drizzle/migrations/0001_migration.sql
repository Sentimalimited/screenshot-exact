create policy "Admins read media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins read enquiry attachments" on storage.objects for select to authenticated
  using (bucket_id = 'enquiry-attachments' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete enquiry attachments" on storage.objects for delete to authenticated
  using (bucket_id = 'enquiry-attachments' and public.has_role(auth.uid(), 'admin'));
