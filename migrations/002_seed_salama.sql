INSERT INTO zones (id, name, center_lat, center_lng, radius_km) VALUES
(1,'صلالة-المركز',17.0196,54.0983,6),
(2,'صلالة-شرق',17.0268,54.1275,6),
(3,'صلالة-غرب',17.0105,54.0630,6),
(4,'عوقد/عوقدين',17.0225,54.0850,4),
(5,'السعادة',17.0308,54.1180,5),
(6,'المطار/عوقد الشمالية',17.0385,54.0920,5)
ON CONFLICT DO NOTHING;

INSERT INTO users (id, role, name, phone, otp_verified) VALUES
(1,'admin','Saklin Admin','+96890000000',true),
(2,'merchant','هايبر الجنوب','+96890000001',true),
(3,'merchant','صيدلية الأمان','+96890000002',true),
(4,'customer','عميل تجريبي','+96890000003',false)
ON CONFLICT DO NOTHING;

INSERT INTO stores (id, owner_id, type, name, zone_id, open_hours, base_delivery_fee)
VALUES
(12,2,'grocery','هايبر الجنوب',1,'{"daily":"08:00-23:30"}',0.500),
(22,3,'pharmacy','صيدلية الأمان',1,'{"daily":"09:00-22:00"}',0.500)
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name, parent_id) VALUES
(10,'حليب ومخبوزات',NULL),
(11,'مياه ومشروبات',NULL),
(12,'منظّفات',NULL),
(13,'ورقيات',NULL),
(14,'معلّبات',NULL),
(20,'OTC صيدلية',NULL),
(21,'عناية بالطفل',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO products (id, store_id, category_id, name, brand, sku, barcode, price, vat_rate, is_otc, image_url)
VALUES
(901,12,10,'حليب طويل الأجل 1L','Almarai','UHT1L-ALM','628100605001',0.590,5.00,false,'https://img.saklin.om/p/901.jpg'),
(902,12,11,'مياه 1.5L (6 حبات)','Barka','WAT15-6','629100605111',0.790,5.00,false,'https://img.saklin.om/p/902.jpg'),
(903,12,12,'منظف متعدد الاستعمال 2L','Dettol','CLN2L-DET','50001590',2.950,5.00,false,'https://img.saklin.om/p/903.jpg'),
(904,22,20,'باراسيتامول 500mg 24 قرص','GSK','OTC-PARA-24','501600370',0.850,0.00,true,'https://img.saklin.om/p/904.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (product_id, stock_qty, substitute_group) VALUES
(901,120,'milk_uht_1l'),
(902,80,'water_1_5l_pack'),
(903,60,'cleaner_multi_2l'),
(904,40,'otc_paracetamol_500');
