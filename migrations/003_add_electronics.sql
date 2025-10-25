CREATE TABLE IF NOT EXISTS brands ( id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL );
CREATE TABLE IF NOT EXISTS product_attributes ( id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS product_attribute_values (
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  attribute_id BIGINT REFERENCES product_attributes(id),
  value TEXT,
  PRIMARY KEY (product_id, attribute_id)
);
CREATE TABLE IF NOT EXISTS product_serials (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  serial TEXT UNIQUE,
  imei TEXT UNIQUE,
  sold_order_item_id BIGINT REFERENCES order_items(id)
);
CREATE TABLE IF NOT EXISTS service_centers ( id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT, address TEXT );
CREATE TABLE IF NOT EXISTS warranties (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  brand_id BIGINT REFERENCES brands(id),
  duration_months INTEGER DEFAULT 12,
  terms TEXT,
  service_center_id BIGINT REFERENCES service_centers(id)
);
CREATE TABLE IF NOT EXISTS rma_requests (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  order_item_id BIGINT REFERENCES order_items(id),
  serial_id BIGINT REFERENCES product_serials(id),
  type TEXT CHECK (type IN ('DOA','Warranty','Return')) NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('opened','approved','rejected','in_service','closed')) DEFAULT 'opened',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO categories (id, name, parent_id) VALUES
(30,'إلكترونيات',NULL),(31,'هواتف ذكية',30),(32,'ملحقات الهواتف',30),(33,'أجهزة لوحية',30),(34,'أجهزة منزلية صغيرة',30)
ON CONFLICT DO NOTHING;

INSERT INTO users (id, role, name, phone, otp_verified) VALUES
(5,'merchant','متجر تيك ساكلن','+96890000004',true) ON CONFLICT DO NOTHING;

INSERT INTO stores (id, owner_id, type, name, zone_id, open_hours, base_delivery_fee) VALUES
(32,5,'market','تيك ساكلن للإلكترونيات',1,'{"daily":"10:00-22:00"}',0.600) ON CONFLICT DO NOTHING;

INSERT INTO brands (id, name) VALUES (1,'Samsung'),(2,'Apple'),(3,'Anker') ON CONFLICT DO NOTHING;

INSERT INTO products (id, store_id, category_id, name, brand, sku, barcode, price, vat_rate, is_otc, image_url) VALUES
(1001,32,31,'هاتف ذكي Galaxy A15 5G 128GB','Samsung','SM-A15-128','880609123001',69.900,5.00,false,'https://img.saklin.om/e/1001.jpg'),
(1002,32,31,'iPhone SE 64GB (2022)','Apple','IP-SE-64-22','194253123000',149.900,5.00,false,'https://img.saklin.om/e/1002.jpg'),
(1003,32,32,'باور بنك 20,000mAh','Anker','ANK-PB20000','194644123111',14.900,5.00,false,'https://img.saklin.om/e/1003.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO product_attributes (id, name) VALUES (1,'السعة'),(2,'اللون'),(3,'الشاشة'),(4,'الذاكرة'),(5,'الاتصال') ON CONFLICT DO NOTHING;

INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(1001,2,'أسود'),(1001,4,'6GB/128GB'),(1001,5,'5G Dual SIM'),
(1002,2,'أبيض'),(1002,4,'4GB/64GB'),(1002,5,'4G eSIM'),
(1003,1,'20000mAh'),(1003,2,'أزرق');

INSERT INTO service_centers (id, name, phone, address) VALUES
(1,'مركز صيانة ساكلن','+96890000999','صلالة - المنطقة الصناعية') ON CONFLICT DO NOTHING;

INSERT INTO warranties (product_id, brand_id, duration_months, terms, service_center_id) VALUES
(1001,1,24,'يشمل عيوب الصناعة فقط. لا يشمل الكسر/الماء.',1),
(1002,2,12,'وفق شروط الشركة المصنعة. يشمل العيوب المصنعية.',1),
(1003,3,12,'يشمل البطارية المصنعية. لا يشمل سوء الاستخدام.',1);
