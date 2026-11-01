-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First account ever created becomes the administrator; later sign-ups get no access.
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_role after insert on auth.users
  for each row execute function public.handle_new_user_role();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Site settings (single row)
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Sentima',
  company_name_approved boolean not null default false,
  tagline text not null default 'Making schools run better',
  tagline_approved boolean not null default false,
  intro text not null default '',
  mission text not null default '',
  vision text not null default '',
  email text,
  phone text,
  whatsapp text,
  whatsapp_confirmed boolean not null default false,
  public_address text,
  office_hours text,
  mpesa_instructions text,
  brochure_url text,
  privacy_approved boolean not null default false,
  ga_measurement_id text,
  search_console_token text,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Settings are public" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  involves text not null default '',
  audience text not null default '',
  benefits text[] not null default '{}',
  how_to_request text not null default '',
  image_url text,
  image_alt text,
  seo_title text,
  seo_description text,
  cta_label text not null default 'Request a quote',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pricing
create table public.pricing_items (
  id uuid primary key default gen_random_uuid(),
  service_slug text,
  name text not null,
  description text not null default '',
  price_label text,
  unit text,
  requires_quote boolean not null default true,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Portfolio
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'certificates' check (category in ('certificates','celebrations','events','other')),
  title text not null,
  caption text not null default '',
  description text,
  image_url text not null,
  alt_text text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Testimonials (only shown publicly with recorded permission)
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  organisation text,
  quote text not null,
  permission_confirmed boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FAQs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  show_on_home boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['services','pricing_items','portfolio_items','testimonials','faqs','articles'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Admins manage %1$s" on public.%1$I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t);
    execute format('create trigger %1$s_touch before update on public.%1$I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

create policy "Public reads published services" on public.services for select to anon, authenticated using (published);
create policy "Public reads published pricing" on public.pricing_items for select to anon, authenticated using (published);
create policy "Public reads published portfolio" on public.portfolio_items for select to anon, authenticated using (published);
create policy "Public reads approved testimonials" on public.testimonials for select to anon, authenticated using (published and permission_confirmed);
create policy "Public reads published faqs" on public.faqs for select to anon, authenticated using (published);
create policy "Public reads published articles" on public.articles for select to anon, authenticated using (published);

-- Enquiries: written only by the server after validation; read by admins.
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote','contact','meeting','ai_talk')),
  organisation text,
  contact_name text not null,
  phone text,
  email text not null,
  county text,
  location text,
  service text,
  quantity int,
  details text not null default '',
  timeframe text,
  preferred_date text,
  attachment_path text,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  admin_notes text,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "Admins read enquiries" on public.enquiries for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update enquiries" on public.enquiries for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create index enquiries_email_created_idx on public.enquiries (email, created_at desc);

-- Seed content
insert into public.site_settings (id, company_name, tagline, intro, mission, vision, whatsapp, phone)
values (1, 'Sentima', 'Making schools run better',
 'Sentima is a teacher-led school services company from Western Kenya. We take repetitive, time-consuming tasks off teachers'' desks — from student ID cards and uniform labelling to hand-lettered certificates — so schools can focus on learning.',
 'To make schools run better by taking repetitive, time-consuming tasks off teachers'' desks through reliable, affordable and well-documented services.',
 'To become the first-choice service partner for schools across Kenya.',
 '254796671308', '+254 796 671 308');

insert into public.services (slug, title, summary, involves, audience, benefits, how_to_request, seo_title, seo_description, cta_label, sort_order) values
('student-id-cards', 'Student ID Cards',
 'Durable, consistently designed student identification cards produced for your whole school.',
 'We agree a card design with the school, collect the information the school chooses to provide under a data-protection agreement, and produce and deliver printed cards. Learner information is used only for producing the cards.',
 'Primary and secondary schools, principals, headteachers and school administrators.',
 array['Removes a repetitive administrative task from teaching staff','Consistent, professional identification across the school','Learner information handled under a signed data-protection agreement','A single point of contact from design to delivery'],
 'Request a quote with your school name, county and approximate number of learners. We will arrange a meeting to agree the design and process.',
 'Student ID Cards in Kenya | School ID Card Production — Sentima',
 'Teacher-led student ID card production for schools in Kakamega, Vihiga, Bungoma, Busia and across Kenya. Learner data handled under data-protection agreements.',
 'Request an ID card quote', 1),
('uniform-labelling', 'School Uniform & Item Labelling',
 'Clear name labels for uniforms and learners'' items, so lost property finds its way home.',
 'We label uniforms and personal items such as sweaters, shirts and other belongings that schools or parents request, using the agreed details and format.',
 'Schools, boarding schools and parents organising labelling through their school.',
 array['Fewer lost and mixed-up items','Saves time for teachers, matrons and parents','A tidy, consistent label format across the school','Organised through the school for convenience'],
 'Tell us your school, the number of learners or items and your preferred timing. We will confirm what can be labelled and how.',
 'School Uniform Labelling Kenya | Item Labelling Services — Sentima',
 'School uniform and item labelling services for schools in Western Kenya and beyond. Organised through the school, delivered by a teacher-led team.',
 'Request a labelling quote', 2),
('gothic-calligraphy-certificates', 'Gothic Calligraphy & Certificates',
 'Hand-lettered certificates and celebration pieces in classic Gothic calligraphy.',
 'Our calligraphers hand-letter certificates, awards, names and celebratory pieces in Gothic blackletter and complementary styles. Wording and layout are agreed before lettering begins.',
 'Schools, churches, universities, event planners and organisations that want certificates with a personal, handmade finish.',
 array['Each piece is lettered by hand','A distinguished finish for prize-givings and graduations','Wording and spelling agreed with you in advance','Suitable for schools, churches and events'],
 'Share the number of pieces, the wording and the date you need them. Browse our portfolio for styles, then request a quote.',
 'Gothic Calligraphy Kenya | Hand-Lettered Certificates — Sentima',
 'Hand-lettered Gothic calligraphy certificates for schools, churches, universities and events in Kakamega, Western Kenya and Nairobi.',
 'Request a calligraphy quote', 3),
('school-photography', 'School Photography',
 'Photography at school functions, prize-givings and events.',
 'We photograph school functions such as prize-giving days, sports days and celebrations, by arrangement with the school and in line with the school''s consent arrangements for learners.',
 'Schools, parents'' associations and event organisers.',
 array['A record of important school occasions','Arranged around the school''s own consent rules','One booking alongside other Sentima services'],
 'Tell us the event, date and location. We will confirm availability and arrangements.',
 'School Photography Kenya | Function & Event Photography — Sentima',
 'Photography for school functions, prize-givings and events in Western Kenya, arranged in line with each school''s consent arrangements.',
 'Request photography', 4),
('laboratory-equipment-servicing', 'Laboratory Equipment Servicing',
 'Servicing of school laboratory equipment, including microscopes.',
 'We inspect and service school laboratory equipment such as microscopes, and report back to the school on what was found and done.',
 'Secondary schools and science departments.',
 array['Equipment kept in usable condition for practical lessons','A written record of what was serviced','Arranged at a time that suits the school'],
 'List the equipment and approximate quantities and we will arrange an assessment and quotation.',
 'Microscope Servicing Kenya | Laboratory Equipment Servicing — Sentima',
 'Microscope and school laboratory equipment servicing for secondary schools in Western Kenya, with a written record of work carried out.',
 'Request a servicing quote', 5),
('ai-talks-for-teachers', 'Free AI Talks for Teachers',
 'Free, practical awareness talks on using AI to reduce repetitive school administration.',
 'A free talk for teaching staff introducing artificial intelligence tools, how they can help with repetitive administrative work, and how to use them responsibly — including protecting learner information.',
 'Teaching staff, heads of department, principals and headteachers.',
 array['Free of charge for schools','Practical, classroom-relevant examples','Guidance on responsible use and learner-data protection','Delivered by teachers, for teachers'],
 'Book a talk with your school name, preferred dates and approximate number of staff attending.',
 'AI Talks for Teachers | Free AI Awareness Sessions for Schools — Sentima',
 'Book a free AI awareness talk for teachers in Kenya. Practical guidance on using AI to reduce repetitive administration, delivered by teachers.',
 'Book a free AI talk', 6);

insert into public.pricing_items (service_slug, name, description, unit, requires_quote, sort_order) values
('student-id-cards', 'Student ID cards', 'Priced per learner. The rate depends on card type, quantity and delivery.', 'per learner', true, 1),
('uniform-labelling', 'Uniform & item labelling', 'Priced per learner or per item, depending on what is labelled.', 'per learner / item', true, 2),
('gothic-calligraphy-certificates', 'Hand-lettered certificates', 'Depends on the number of pieces, wording length and finish.', 'per piece', true, 3),
('school-photography', 'Function photography', 'Depends on the event, duration and location.', 'per event', true, 4),
('laboratory-equipment-servicing', 'Laboratory equipment servicing', 'Quoted after the equipment has been assessed.', 'per assessment', true, 5),
('ai-talks-for-teachers', 'AI talk for teachers', 'Offered free of charge to schools.', null, false, 6);
update public.pricing_items set price_label = 'Free' where service_slug = 'ai-talks-for-teachers';

insert into public.faqs (question, answer, category, show_on_home, sort_order) values
('How much do student ID cards and uniform labelling cost per learner?', 'Both services are priced per learner. The rate depends on the number of learners, the card or label type and delivery arrangements, so we confirm the price in a written quotation for your school. Request a quote with your approximate number of learners and we will respond with a figure.', 'Pricing', true, 1),
('How does hand-lettered certificate production work?', 'You share the number of certificates, the exact wording and any names. We agree the style and layout with you, confirm spelling, and then letter each piece by hand. You approve the details before lettering begins.', 'Calligraphy', true, 2),
('How long do calligraphy orders take?', 'It depends on the number of pieces and the amount of lettering. We confirm a timeline with you when we quote, so please tell us the date you need the pieces as early as possible.', 'Calligraphy', false, 3),
('How does Sentima protect learner data?', 'This website does not collect learner information. Where a service such as ID cards needs learner details, we work under a non-disclosure and data-protection agreement with the school, use the information only for that service, and limit who can access it.', 'Data protection', true, 4),
('How can schools use AI to reduce repetitive administration?', 'AI tools can help draft letters and notices, summarise documents and organise routine paperwork. Our free AI talks show practical examples and explain how to use these tools responsibly, without sharing learner information.', 'AI', false, 5),
('When should schools arrange ID cards and labelling?', 'The best time is ahead of a new term or intake, so cards and labels are ready when learners arrive. Contact us early so we can plan production around your calendar.', 'Planning', true, 6),
('How can a school book a free AI talk?', 'Use the booking form on our website or message us on WhatsApp with your school name, preferred dates and approximate number of staff. We will confirm a date with you.', 'AI', false, 7);
