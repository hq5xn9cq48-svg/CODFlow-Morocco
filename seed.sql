-- بيانات تجريبية واقعية — حساب demo@t2aked.ma / كلمة السر: demo1234
-- (بيانات وهمية بالكامل لأغراض العرض)

INSERT OR IGNORE INTO users (id, email, phone, name, password_hash, onboarded) VALUES
  (1, 'demo@t2aked.ma', '0661000000', 'سلمى بناني', 'pbkdf2:100000:9ca72a824cf245c4e7b6f4ae510ca34d:e75e51e30ce7eb018711da397642d1ee3588d76d0528b539d706c526432700d7', 1);

INSERT OR IGNORE INTO stores (id, owner_id, name, category, city, phone, plan) VALUES
  (1, 1, 'قفطان سلمى', 'clothing', 'الدار البيضاء', '0661000000', 'basic');

INSERT OR IGNORE INTO products (id, store_id, name, price, sku) VALUES
  (1, 1, 'قفطان مخزني أخضر', 850, 'QFT-001'),
  (2, 1, 'جلابة صيفية بيضاء', 420, 'JLB-002'),
  (3, 1, 'قفطان عصري مطرز', 1200, 'QFT-003'),
  (4, 1, 'حزام مضمّة تقليدي', 300, 'ACC-004'),
  (5, 1, 'جلابة رجالية صوف', 550, 'JLB-005');

INSERT OR IGNORE INTO customers (id, store_id, name, phone, city, address) VALUES
  (1, 1, 'فاطمة الزهراء العلوي', '0662111111', 'الرباط', 'حي أكدال، شارع الأمير مولاي عبد الله، عمارة 12'),
  (2, 1, 'خديجة برادة', '0663222222', 'مراكش', 'حي جليز، زنقة ابن عائشة رقم 5'),
  (3, 1, 'أمينة التازي', '0664333333', 'فاس', ''),
  (4, 1, 'يوسف الإدريسي', '0665444444', 'طنجة', 'حي مسنانة، إقامة النور، شقة 8'),
  (5, 1, 'مريم الفاسي', '0666555555', 'الدار البيضاء', 'المعاريف، زنقة أبو إسحاق المروني'),
  (6, 1, 'سعاد شرايبي', '0667666666', 'أكادير', 'حي الداخلة، بلوك C'),
  (7, 1, 'نادية بنجلون', '0662111111', 'سلا', 'حي تابريكت'),
  (8, 1, 'حسن العمراني', '0668777777', 'مكناس', 'المدينة الجديدة، شارع الجيش الملكي');

-- طلبات موزعة على الحالات وعلى آخر 30 يوم
INSERT OR IGNORE INTO orders (id, store_id, order_number, customer_id, customer_name, customer_phone, city, address, product_name, quantity, total_amount, status, source, notes, followup_at, call_attempts, created_at, updated_at) VALUES
  (1, 1, 'T-1001', 1, 'فاطمة الزهراء العلوي', '0662111111', 'الرباط', 'حي أكدال، شارع الأمير مولاي عبد الله، عمارة 12', 'قفطان مخزني أخضر', 1, 850, 'new', 'instagram', 'طلبات من ستوري الجمعة', NULL, 0, datetime('now','-2 hours'), datetime('now','-2 hours')),
  (2, 1, 'T-1002', 2, 'خديجة برادة', '0663222222', 'مراكش', 'حي جليز، زنقة ابن عائشة رقم 5', 'جلابة صيفية بيضاء', 2, 840, 'new', 'whatsapp', NULL, NULL, 0, datetime('now','-5 hours'), datetime('now','-5 hours')),
  (3, 1, 'T-1003', 3, 'أمينة التازي', '0664333333', 'فاس', '', 'قفطان عصري مطرز', 1, 1200, 'to_confirm', 'instagram', 'بغات تشوف الطول قبل', datetime('now','+1 day'), 1, datetime('now','-1 day'), datetime('now','-6 hours')),
  (4, 1, 'T-1004', 4, 'يوسف الإدريسي', '0665444444', 'طنجة', 'حي مسنانة، إقامة النور، شقة 8', 'جلابة رجالية صوف', 1, 550, 'confirmed', 'facebook', NULL, NULL, 1, datetime('now','-2 days'), datetime('now','-1 day')),
  (5, 1, 'T-1005', 5, 'مريم الفاسي', '0666555555', 'الدار البيضاء', 'المعاريف، زنقة أبو إسحاق المروني', 'قفطان مخزني أخضر', 1, 850, 'preparing', 'whatsapp', 'تسليم قبل العيد', NULL, 1, datetime('now','-3 days'), datetime('now','-1 day')),
  (6, 1, 'T-1006', 6, 'سعاد شرايبي', '0667666666', 'أكادير', 'حي الداخلة، بلوك C', 'حزام مضمّة تقليدي', 2, 600, 'shipped', 'instagram', 'أمانة: AMX-449201', NULL, 1, datetime('now','-5 days'), datetime('now','-2 days')),
  (7, 1, 'T-1007', 1, 'فاطمة الزهراء العلوي', '0662111111', 'الرباط', 'حي أكدال، شارع الأمير مولاي عبد الله، عمارة 12', 'جلابة صيفية بيضاء', 1, 420, 'delivered', 'instagram', NULL, NULL, 1, datetime('now','-10 days'), datetime('now','-7 days')),
  (8, 1, 'T-1008', 7, 'نادية بنجلون', '0662111111', 'سلا', 'حي تابريكت', 'قفطان عصري مطرز', 1, 1200, 'no_answer', 'facebook', 'عيطت 3 مرات، مكتجاوبش', datetime('now','+2 hours'), 3, datetime('now','-4 days'), datetime('now','-1 day')),
  (9, 1, 'T-1009', 8, 'حسن العمراني', '0668777777', 'مكناس', 'المدينة الجديدة، شارع الجيش الملكي', 'جلابة رجالية صوف', 1, 550, 'cancelled', 'whatsapp', 'لقى ثمن أرخص', NULL, 2, datetime('now','-6 days'), datetime('now','-5 days')),
  (10, 1, 'T-1010', 2, 'خديجة برادة', '0663222222', 'مراكش', 'حي جليز، زنقة ابن عائشة رقم 5', 'قفطان مخزني أخضر', 1, 850, 'delivered', 'whatsapp', NULL, NULL, 1, datetime('now','-15 days'), datetime('now','-12 days')),
  (11, 1, 'T-1011', 3, 'أمينة التازي', '0664333333', 'فاس', 'حي النرجس', 'حزام مضمّة تقليدي', 1, 300, 'returned', 'instagram', 'ما عجبهاش اللون', NULL, 1, datetime('now','-20 days'), datetime('now','-14 days')),
  (12, 1, 'T-1012', 5, 'مريم الفاسي', '0666555555', 'الدار البيضاء', 'المعاريف، زنقة أبو إسحاق المروني', 'جلابة صيفية بيضاء', 3, 1260, 'delivered', 'whatsapp', 'طلب جماعي للعائلة', NULL, 1, datetime('now','-25 days'), datetime('now','-20 days')),
  (13, 1, 'T-1013', 4, 'يوسف الإدريسي', '0665444444', 'طنجة', 'حي مسنانة، إقامة النور، شقة 8', 'قفطان عصري مطرز', 1, 1200, 'delivered', 'facebook', NULL, NULL, 2, datetime('now','-28 days'), datetime('now','-24 days')),
  (14, 1, 'T-1014', 6, 'سعاد شرايبي', '0667666666', 'أكادير', 'حي الداخلة، بلوك C', 'قفطان مخزني أخضر', 1, 850, 'to_confirm', 'form', 'وصل من نموذج الطلب', datetime('now','+4 hours'), 0, datetime('now','-8 hours'), datetime('now','-8 hours'));

INSERT OR IGNORE INTO order_events (store_id, order_id, event_type, from_status, to_status, detail, created_at) VALUES
  (1, 3, 'status_change', 'new', 'to_confirm', 'محاولة اتصال أولى — ما جاوباتش', datetime('now','-6 hours')),
  (1, 4, 'status_change', 'new', 'confirmed', 'تأكد عبر الهاتف', datetime('now','-1 day')),
  (1, 5, 'status_change', 'confirmed', 'preparing', NULL, datetime('now','-1 day')),
  (1, 6, 'status_change', 'preparing', 'shipped', 'شركة أمانة — AMX-449201', datetime('now','-2 days')),
  (1, 8, 'call_attempt', NULL, NULL, 'المحاولة 3 — بدون رد', datetime('now','-1 day'));

-- قوالب الرسائل الافتراضية
INSERT OR IGNORE INTO message_templates (store_id, slug, title, body, lang, tone) VALUES
  (1, 'confirm', 'تأكيد الطلب', 'سلام {{customer_name}} 👋 معاك {{store_name}}. توصلنا بالطلب ديالك: {{product_name}} بثمن {{total_amount}} درهم. واش نأكدو الطلب باش نصيفطوه ليك؟', 'darija', 'friendly'),
  (1, 'ask_address', 'طلب العنوان', 'سلام {{customer_name}}، باش نصيفطو ليك الطلب {{order_number}} محتاجين العنوان الكامل ديالك ف{{city}} (الحي، الزنقة، رقم الدار). شكراً 🙏', 'darija', 'friendly'),
  (1, 'reminder', 'تذكير', 'سلام {{customer_name}}، غير كنفكروك بالطلب ديالك {{product_name}}. واش مازال باغيه؟ إلا كان شي سؤال راه حنا هنا 😊', 'darija', 'friendly'),
  (1, 'no_answer', 'بعد عدم الرد', 'سلام {{customer_name}}، حاولنا نتصلو بيك باش نأكدو الطلب {{order_number}} ولكن ما قدرناش نوصلو ليك. عافاك جاوبنا هنا أو عيط لينا فاش يكون ممكن.', 'darija', 'friendly'),
  (1, 'shipped', 'تأكيد الشحن', 'خبار زوينة {{customer_name}} 🎉 الطلب ديالك {{order_number}} تصيفط اليوم وغادي يوصلك قريباً ف{{city}}. الخلاص عند الاستلام: {{total_amount}} درهم.', 'darija', 'friendly'),
  (1, 'delivered', 'تأكيد التسليم', 'سلام {{customer_name}}، تنشكروك على الثقة ف{{store_name}} 🌟 نتمناو يعجبك {{product_name}}. مرحبا بيك ديما!', 'darija', 'friendly'),
  (1, 'review', 'طلب تقييم', 'سلام {{customer_name}} 😊 إلا عجبك {{product_name}}، غادي نفرحو بزاف إلا شاركتي رأيك أو صورة. هادشي كيعاوننا بزاف. شكراً!', 'darija', 'friendly'),
  (1, 'apology', 'اعتذار', 'سلام {{customer_name}}، كنعتذرو على التأخير فالطلب {{order_number}}. راه كنتبعوه شخصياً وغادي نردو ليك الخبر فأقرب وقت. شكراً على الصبر ديالك 🙏', 'darija', 'friendly'),
  (1, 'cancelled', 'إلغاء', 'سلام {{customer_name}}، تسجل إلغاء الطلب {{order_number}} بلا مشكل. مرحبا بيك فأي وقت، وإلا بغيتي شي حاجة أخرى راه حنا هنا.', 'darija', 'friendly'),
  (1, 'upsell', 'عرض إضافي', 'سلام {{customer_name}} 👋 بما أنك خديتي {{product_name}}، عندنا عرض خاص ليك: خصم على القطعة الثانية. قوليلي إلا بغيتي التفاصيل 😉', 'darija', 'friendly');
