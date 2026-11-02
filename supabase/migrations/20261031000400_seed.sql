-- Heartly seed data: categories, templates, plans, and platform settings.
-- No fake users, gifts, payments, or testimonials are seeded. Testimonials on the
-- marketing site are explicitly labelled as sample content until replaced.

insert into public.categories (id, slug, name, description, thumbnail_url, is_premium, sort_order)
values
  ('11111111-1111-4111-8111-111111111101', 'birthday-cards', 'Birthday Cards', 'Warm, playful birthday surprises with confetti, photos, and a message that feels personal.', '/api/template-art/birthday-blush', false, 10),
  ('11111111-1111-4111-8111-111111111102', 'love-letters', 'Love Letters', 'Sealed envelopes and heartfelt letters for the person who makes your days softer.', '/api/template-art/love-letter-classic', false, 20),
  ('11111111-1111-4111-8111-111111111103', 'anniversary', 'Anniversary', 'Celebrate the years, the memories, and the little moments that made a love story.', '/api/template-art/anniversary-gold', true, 30),
  ('11111111-1111-4111-8111-111111111104', 'dinner-date-invitations', 'Dinner Date Invitations', 'Invite someone to an evening they will remember, with all the details in one place.', '/api/template-art/dinner-date-rose', false, 40),
  ('11111111-1111-4111-8111-111111111105', 'beach-date-invitations', 'Beach Date Invitations', 'Sunset colours, soft waves, and a simple yes that starts something beautiful.', '/api/template-art/beach-date-sunset', true, 50),
  ('11111111-1111-4111-8111-111111111106', 'friendship-cards', 'Friendship Cards', 'Tell a friend how much their presence matters, with warmth and a little humour.', '/api/template-art/friendship-warmth', false, 60),
  ('11111111-1111-4111-8111-111111111107', 'appreciation-cards', 'Appreciation Cards', 'A thoughtful thank-you for someone who quietly makes life better.', '/api/template-art/appreciation-gratitude', false, 70),
  ('11111111-1111-4111-8111-111111111108', 'valentines-day', 'Valentine''s Day', 'Velvet-red romance, poetic words, and a surprise made for the fourteenth of February.', '/api/template-art/valentine-velvet', true, 80),
  ('11111111-1111-4111-8111-111111111109', 'special-questions', 'Special Questions', 'Ask the important question with a beautiful reveal and a clear, gentle yes or no.', '/api/template-art/special-question-heart', true, 90),
  ('11111111-1111-4111-8111-111111111110', 'interactive-surprises', 'Interactive Surprises', 'Playful reveals, custom questions, and little moments of delight the recipient unlocks.', '/api/template-art/surprise-reveal', true, 100),
  ('11111111-1111-4111-8111-111111111111', 'celebration-cards', 'Celebration Cards', 'Congratulations, graduations, new beginnings, and every reason worth cheering.', '/api/template-art/celebration-cheer', false, 110),
  ('11111111-1111-4111-8111-111111111112', 'custom-experiences', 'Custom Experiences', 'Start from a quiet canvas and build a one-of-a-kind keepsake for someone you love.', '/api/template-art/custom-keepsake', true, 120)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  is_premium = excluded.is_premium,
  sort_order = excluded.sort_order;

insert into public.templates (
  id, slug, name, description, category_id, template_type, thumbnail_url, preview_url,
  is_premium, config_schema, default_content, default_colors, default_typography,
  animation_config, sort_order
)
values
  (
    '22222222-2222-4222-8222-222222222201', 'birthday-blush', 'Blush Birthday',
    'A soft rose birthday card with confetti and space for a favourite photo.',
    '11111111-1111-4111-8111-111111111101', 'birthday',
    '/api/template-art/birthday-blush', '/api/template-art/birthday-blush',
    false,
    '{"sections":["basics","design","media","experience"]}',
    '{"title":"Happy Birthday","message":"May this year bring you the kind of joy you bring to everyone around you.","theme":{"background":"#FFF9F7","accent":"#E85D75","secondary":"#FCE7EF","text":"#29212A"},"animation":{"type":"confetti","intensity":"medium"},"music":{"enabled":false,"track":"dreamy"},"media":[]}',
    '{"background":"#FFF9F7","accent":"#E85D75","secondary":"#FCE7EF","text":"#29212A"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"confetti","intensity":"medium"}',
    10
  ),
  (
    '22222222-2222-4222-8222-222222222202', 'birthday-confetti', 'Confetti Celebration',
    'A bolder birthday experience with layered confetti, photo strip, and animated reveal.',
    '11111111-1111-4111-8111-111111111101', 'birthday',
    '/api/template-art/birthday-confetti', '/api/template-art/birthday-confetti',
    true,
    '{"sections":["basics","design","media","experience","music"]}',
    '{"title":"Another Year of You","message":"Here is to more laughter, more adventures, and more of the moments that make you, you.","theme":{"background":"#FFF4EE","accent":"#D94C68","secondary":"#FFD9C7","text":"#2A1E24"},"animation":{"type":"confetti","intensity":"high"},"music":{"enabled":false,"track":"playful"},"media":[]}',
    '{"background":"#FFF4EE","accent":"#D94C68","secondary":"#FFD9C7","text":"#2A1E24"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"confetti","intensity":"high"}',
    20
  ),
  (
    '22222222-2222-4222-8222-222222222203', 'love-letter-classic', 'Classic Love Letter',
    'A cream envelope, a handwritten-style letter, and a quiet romantic reveal.',
    '11111111-1111-4111-8111-111111111102', 'love_letter',
    '/api/template-art/love-letter-classic', '/api/template-art/love-letter-classic',
    false,
    '{"sections":["basics","design","experience"]}',
    '{"title":"A Letter for You","message":"There are things I feel every day that deserve more than a passing text. So I wrote them down, slowly, just for you.","theme":{"background":"#FFFBF4","accent":"#B85C6E","secondary":"#F7E5D8","text":"#3A2B2F"},"animation":{"type":"petals","intensity":"low"},"music":{"enabled":false,"track":"romantic"},"media":[]}',
    '{"background":"#FFFBF4","accent":"#B85C6E","secondary":"#F7E5D8","text":"#3A2B2F"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"petals","intensity":"low"}',
    30
  ),
  (
    '22222222-2222-4222-8222-222222222204', 'love-letter-midnight', 'Midnight Letter',
    'Deep plum, gold details, and an intimate letter for late-night feelings.',
    '11111111-1111-4111-8111-111111111102', 'love_letter',
    '/api/template-art/love-letter-midnight', '/api/template-art/love-letter-midnight',
    true,
    '{"sections":["basics","design","experience","music"]}',
    '{"title":"Read This When You Miss Me","message":"If you are reading this at midnight, imagine me beside you. Imagine my hand in yours. Imagine everything I would say if the world went quiet.","theme":{"background":"#2A1B2A","accent":"#E7B36A","secondary":"#4A3048","text":"#FFF7EE"},"animation":{"type":"stars","intensity":"medium"},"music":{"enabled":true,"track":"romantic"},"media":[]}',
    '{"background":"#2A1B2A","accent":"#E7B36A","secondary":"#4A3048","text":"#FFF7EE"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"stars","intensity":"medium"}',
    40
  ),
  (
    '22222222-2222-4222-8222-222222222205', 'anniversary-gold', 'Golden Anniversary',
    'An elegant anniversary keepsake with a memory gallery and golden flourishes.',
    '11111111-1111-4111-8111-111111111103', 'anniversary',
    '/api/template-art/anniversary-gold', '/api/template-art/anniversary-gold',
    true,
    '{"sections":["basics","design","media","experience","music"]}',
    '{"title":"Still Choosing You","message":"Every year adds another page to our story. Thank you for writing it with me.","theme":{"background":"#FFF8E8","accent":"#B78A3E","secondary":"#F2E2B8","text":"#332B22"},"animation":{"type":"sparkles","intensity":"low"},"music":{"enabled":false,"track":"romantic"},"media":[]}',
    '{"background":"#FFF8E8","accent":"#B78A3E","secondary":"#F2E2B8","text":"#332B22"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"sparkles","intensity":"low"}',
    50
  ),
  (
    '22222222-2222-4222-8222-222222222206', 'dinner-date-rose', 'Rose Table',
    'A warm dinner invitation with date, time, venue, and an easy yes.',
    '11111111-1111-4111-8111-111111111104', 'dinner_date',
    '/api/template-art/dinner-date-rose', '/api/template-art/dinner-date-rose',
    false,
    '{"sections":["basics","design","invitation"]}',
    '{"title":"Dinner With Me?","message":"I have a table, a candle, and a whole evening set aside for you.","theme":{"background":"#FFF7F4","accent":"#C95268","secondary":"#F6D7D3","text":"#2C2228"},"animation":{"type":"fade","intensity":"low"},"music":{"enabled":false,"track":"romantic"},"date":{"date":"","time":"19:30","venue":"","address":""},"media":[]}',
    '{"background":"#FFF7F4","accent":"#C95268","secondary":"#F6D7D3","text":"#2C2228"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"fade","intensity":"low"}',
    60
  ),
  (
    '22222222-2222-4222-8222-222222222207', 'dinner-date-candlelight', 'Candlelight Dinner',
    'A deeper, more intimate dinner invitation with animated candlelight.',
    '11111111-1111-4111-8111-111111111104', 'dinner_date',
    '/api/template-art/dinner-date-candlelight', '/api/template-art/dinner-date-candlelight',
    true,
    '{"sections":["basics","design","invitation","music"]}',
    '{"title":"An Evening Just for Us","message":"No phones, no rush. Just good food, soft light, and you across the table.","theme":{"background":"#20181D","accent":"#E5A86B","secondary":"#3A2B31","text":"#FFF6EC"},"animation":{"type":"candles","intensity":"medium"},"music":{"enabled":true,"track":"romantic"},"date":{"date":"","time":"20:00","venue":"","address":""},"media":[]}',
    '{"background":"#20181D","accent":"#E5A86B","secondary":"#3A2B31","text":"#FFF6EC"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"candles","intensity":"medium"}',
    70
  ),
  (
    '22222222-2222-4222-8222-222222222208', 'beach-date-sunset', 'Sunset Beach Date',
    'A sunset-inspired invitation with waves, warm light, and a simple yes or no.',
    '11111111-1111-4111-8111-111111111105', 'beach_date',
    '/api/template-art/beach-date-sunset', '/api/template-art/beach-date-sunset',
    true,
    '{"sections":["basics","design","invitation","music"]}',
    '{"title":"Meet Me at Sunset","message":"Bring your favourite smile. I will bring everything else.","theme":{"background":"#FFF1E6","accent":"#D87752","secondary":"#F9C9A8","text":"#352621"},"animation":{"type":"waves","intensity":"low"},"music":{"enabled":false,"track":"dreamy"},"date":{"date":"","time":"17:30","venue":"","address":""},"media":[]}',
    '{"background":"#FFF1E6","accent":"#D87752","secondary":"#F9C9A8","text":"#352621"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"waves","intensity":"low"}',
    80
  ),
  (
    '22222222-2222-4222-8222-222222222209', 'friendship-warmth', 'Warm Friendship',
    'A bright, genuine card for the friend who never lets you carry life alone.',
    '11111111-1111-4111-8111-111111111106', 'friendship',
    '/api/template-art/friendship-warmth', '/api/template-art/friendship-warmth',
    false,
    '{"sections":["basics","design","media"]}',
    '{"title":"I Am Glad It Is You","message":"Some people make life lighter just by being in it. You are one of those people.","theme":{"background":"#FFFBF4","accent":"#C77B4B","secondary":"#F6E3C6","text":"#332A22"},"animation":{"type":"float","intensity":"low"},"music":{"enabled":false,"track":"playful"},"media":[]}',
    '{"background":"#FFFBF4","accent":"#C77B4B","secondary":"#F6E3C6","text":"#332A22"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"float","intensity":"low"}',
    90
  ),
  (
    '22222222-2222-4222-8222-222222222210', 'appreciation-gratitude', 'Quiet Gratitude',
    'A calm, beautifully typeset thank-you for someone who deserves to be seen.',
    '11111111-1111-4111-8111-111111111107', 'appreciation',
    '/api/template-art/appreciation-gratitude', '/api/template-art/appreciation-gratitude',
    false,
    '{"sections":["basics","design"]}',
    '{"title":"Thank You, Truly","message":"You may not realise how much your kindness has carried me. I notice it. I appreciate it. I am grateful for you.","theme":{"background":"#F8F7F2","accent":"#7B8C6A","secondary":"#E4E7D7","text":"#2C3028"},"animation":{"type":"fade","intensity":"low"},"music":{"enabled":false,"track":"dreamy"},"media":[]}',
    '{"background":"#F8F7F2","accent":"#7B8C6A","secondary":"#E4E7D7","text":"#2C3028"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"fade","intensity":"low"}',
    100
  ),
  (
    '22222222-2222-4222-8222-222222222211', 'valentine-velvet', 'Velvet Valentine',
    'Rich red, soft petals, and a romantic message that unfolds like a keepsake.',
    '11111111-1111-4111-8111-111111111108', 'valentine',
    '/api/template-art/valentine-velvet', '/api/template-art/valentine-velvet',
    true,
    '{"sections":["basics","design","media","experience","music"]}',
    '{"title":"Be My Valentine?","message":"Of all the places I could be, I keep choosing wherever you are.","theme":{"background":"#2B1118","accent":"#E05A72","secondary":"#5A2230","text":"#FFF4F4"},"animation":{"type":"petals","intensity":"high"},"music":{"enabled":true,"track":"romantic"},"media":[]}',
    '{"background":"#2B1118","accent":"#E05A72","secondary":"#5A2230","text":"#FFF4F4"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"petals","intensity":"high"}',
    110
  ),
  (
    '22222222-2222-4222-8222-222222222212', 'special-question-heart', 'One Important Question',
    'A sealed question with a gentle reveal and a yes or no answer captured for you.',
    '11111111-1111-4111-8111-111111111109', 'question',
    '/api/template-art/special-question-heart', '/api/template-art/special-question-heart',
    true,
    '{"sections":["basics","design","experience"]}',
    '{"title":"I Have Something to Ask You","message":"I have been carrying this question around for a while. Take your time. There is no wrong answer.","theme":{"background":"#FFF7F8","accent":"#D14D69","secondary":"#F7D9E0","text":"#2E2026"},"animation":{"type":"hearts","intensity":"medium"},"music":{"enabled":false,"track":"romantic"},"questions":[{"id":"q1","question":"Will you be mine?","options":["Yes","No"]}],"media":[]}',
    '{"background":"#FFF7F8","accent":"#D14D69","secondary":"#F7D9E0","text":"#2E2026"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"hearts","intensity":"medium"}',
    120
  ),
  (
    '22222222-2222-4222-8222-222222222213', 'surprise-reveal', 'Unlock the Surprise',
    'A playful locked surprise with custom questions and a reveal the recipient unlocks.',
    '11111111-1111-4111-8111-111111111110', 'surprise',
    '/api/template-art/surprise-reveal', '/api/template-art/surprise-reveal',
    true,
    '{"sections":["basics","design","experience","music"]}',
    '{"title":"A Little Surprise","message":"You have to open this one to find out what it is. Yes, really.","theme":{"background":"#F4F0FF","accent":"#7C63C7","secondary":"#E3DCF9","text":"#282234"},"animation":{"type":"sparkles","intensity":"medium"},"music":{"enabled":false,"track":"playful"},"questions":[{"id":"q1","question":"Are you ready for your surprise?","options":["Absolutely","Maybe later"]}],"reveal":{"title":"The surprise","message":"You are my favourite person to spoil. Check your messages for the rest."},"media":[]}',
    '{"background":"#F4F0FF","accent":"#7C63C7","secondary":"#E3DCF9","text":"#282234"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"sparkles","intensity":"medium"}',
    130
  ),
  (
    '22222222-2222-4222-8222-222222222214', 'celebration-cheer', 'Cheerful Celebration',
    'A bright card for graduations, promotions, new homes, and fresh starts.',
    '11111111-1111-4111-8111-111111111111', 'celebration',
    '/api/template-art/celebration-cheer', '/api/template-art/celebration-cheer',
    false,
    '{"sections":["basics","design","media"]}',
    '{"title":"Look At You Go","message":"This moment is yours. I hope you pause long enough to feel proud of everything it took to get here.","theme":{"background":"#FFFBEF","accent":"#D49A3A","secondary":"#F7E7B8","text":"#332A1C"},"animation":{"type":"confetti","intensity":"medium"},"music":{"enabled":false,"track":"playful"},"media":[]}',
    '{"background":"#FFFBEF","accent":"#D49A3A","secondary":"#F7E7B8","text":"#332A1C"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"confetti","intensity":"medium"}',
    140
  ),
  (
    '22222222-2222-4222-8222-222222222215', 'custom-keepsake', 'Blank Keepsake',
    'A calm canvas for a completely custom message, photo, date, or surprise.',
    '11111111-1111-4111-8111-111111111112', 'custom',
    '/api/template-art/custom-keepsake', '/api/template-art/custom-keepsake',
    true,
    '{"sections":["basics","design","media","experience","music"]}',
    '{"title":"A Little Something for You","message":"Some feelings deserve more than ordinary words. Start here and make it yours.","theme":{"background":"#FFF9F7","accent":"#E85D75","secondary":"#FCE7EF","text":"#29212A"},"animation":{"type":"float","intensity":"low"},"music":{"enabled":false,"track":"dreamy"},"media":[]}',
    '{"background":"#FFF9F7","accent":"#E85D75","secondary":"#FCE7EF","text":"#29212A"}',
    '{"heading":"playfair","body":"inter"}',
    '{"type":"float","intensity":"low"}',
    150
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  template_type = excluded.template_type,
  thumbnail_url = excluded.thumbnail_url,
  preview_url = excluded.preview_url,
  is_premium = excluded.is_premium,
  default_content = excluded.default_content,
  default_colors = excluded.default_colors,
  default_typography = excluded.default_typography,
  animation_config = excluded.animation_config,
  sort_order = excluded.sort_order;

insert into public.plans (
  id, code, name, description, price_tzs, price_usd_cents, billing_interval,
  features, limits, sort_order
)
values
  (
    '33333333-3333-4333-8333-333333333301', 'free', 'Free', 'Everything you need to send a thoughtful digital gift.',
    0, 0, 'month',
    '["Up to 3 active gifts","Basic templates","Standard animations","3 photos per gift","Shareable link","Basic analytics"]',
    '{"tier":"free","max_active_gifts":3,"max_media":3,"premium_templates":false,"advanced_animation":false,"music":false,"custom_fonts":false,"qr_code":false,"advanced_analytics":false,"scheduled_delivery":false,"remove_branding":false,"gift_expiry":true,"password_protection":false}',
    10
  ),
  (
    '33333333-3333-4333-8333-333333333302', 'premium', 'Heartly Premium', 'Every template, every detail, and every way to make someone feel special.',
    15000, 599, 'month',
    '["Up to 100 active gifts","All premium templates","Advanced animations","20 photos per gift","Background music","QR codes","Advanced analytics","Scheduled delivery","Password protection","Remove Heartly branding"]',
    '{"tier":"premium","max_active_gifts":100,"max_media":20,"premium_templates":true,"advanced_animation":true,"music":true,"custom_fonts":true,"qr_code":true,"advanced_analytics":true,"scheduled_delivery":true,"remove_branding":true,"gift_expiry":true,"password_protection":true}',
    20
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_tzs = excluded.price_tzs,
  price_usd_cents = excluded.price_usd_cents,
  features = excluded.features,
  limits = excluded.limits,
  sort_order = excluded.sort_order;

insert into public.platform_settings (key, value, description)
values
  ('site_name', '"Heartly"'::jsonb, 'Public product name'),
  ('support_email', '"support@heartly.example"'::jsonb, 'Support inbox shown on the contact page'),
  ('default_currency', '"TZS"'::jsonb, 'Default display currency'),
  ('default_timezone', '"Africa/Dar_es_Salaam"'::jsonb, 'Timezone used for local date presentation'),
  ('maintenance_mode', 'false'::jsonb, 'When true, the marketing site shows a maintenance notice'),
  ('guest_creation_enabled', 'true'::jsonb, 'Allow unauthenticated guests to create basic gifts'),
  ('gift_default_expiry_days', 'null'::jsonb, 'Default expiry in days for new gifts; null means no expiry'),
  ('payments_provider', '"mock"'::jsonb, 'Active payment provider adapter'),
  ('allow_testimonials', 'false'::jsonb, 'Whether real testimonials have been approved for display'),
  ('max_upload_mb', '5'::jsonb, 'Maximum gift image upload size in MB')
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description;
