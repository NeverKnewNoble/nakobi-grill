# Nakobi Grill — Supabase Database Schema

Full schema for the Nakobi Grill POS system. Covers all tables, enums, relationships, triggers, functions, and Row Level Security (RLS) policies derived from the application's type definitions and business logic.

---

## Table of Contents

1. [Overview](#overview)
2. [Enums](#enums)
3. [Tables](#tables)
   - [profiles](#1-profiles)
   - [inventory_items](#2-inventory_items)
   - [inventory_logs](#3-inventory_logs)
   - [menu_categories](#4-menu_categories)
   - [menu_items](#5-menu_items)
   - [orders](#6-orders)
   - [order_items](#7-order_items)
4. [Functions & Triggers](#functions--triggers)
5. [Row Level Security Policies](#row-level-security-policies)
6. [Indexes](#indexes)
7. [Seed Data](#seed-data)
8. [Entity Relationship Summary](#entity-relationship-summary)

---

## Overview

| Table             | Description                                          |
|-------------------|------------------------------------------------------|
| `profiles`        | Extends `auth.users` — staff member details & roles  |
| `inventory_items` | Ingredients tracked in the kitchen                   |
| `inventory_logs`  | Audit trail for every restock / stock-out action     |
| `menu_categories` | User-defined meal categories (Grills, Drinks, etc.)  |
| `menu_items`      | Individual meals with price and category             |
| `orders`          | Order header — type, status, total, created by       |
| `order_items`     | Line items linking each order to menu items          |

Supabase Auth (`auth.users`) manages authentication. The `profiles` table holds all app-specific user data and is linked 1:1 to `auth.users`.

---

## Enums

```sql
-- Staff roles
CREATE TYPE user_role AS ENUM ('Admin', 'Inventory Manager', 'Order Taker');

-- Shift types
CREATE TYPE shift_type AS ENUM ('Day Shift', 'Night Shift');

-- User account status
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- Inventory stock status (auto-computed via trigger)
CREATE TYPE inventory_status AS ENUM ('ok', 'low', 'critical');

-- Allowed units for inventory items
CREATE TYPE inventory_unit AS ENUM ('kg', 'g', 'L', 'ml', 'pcs', 'bags', 'crates');

-- Inventory log action types
CREATE TYPE inventory_action AS ENUM ('restock', 'stock_out', 'manual_adjustment');

-- Order type
CREATE TYPE order_type AS ENUM ('Dine In', 'Takeaway');

-- Order lifecycle status
CREATE TYPE order_status AS ENUM ('pending', 'ready', 'cancelled');
```

---

## Tables

### 1. `profiles`

Extends `auth.users`. Created automatically via trigger when a new auth user signs up.

```sql
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT        NOT NULL,
  email        TEXT        NOT NULL UNIQUE,
  role         user_role   NOT NULL DEFAULT 'Order Taker',
  shift_type   shift_type  NOT NULL DEFAULT 'Day Shift',
  status       user_status NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Trigger — auto-create profile on sign up:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 2. `inventory_items`

Stores kitchen ingredient stock. `status` is auto-computed by a trigger whenever `current_stock` or `threshold` changes.

```sql
CREATE TABLE public.inventory_items (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient    TEXT           NOT NULL,
  unit          inventory_unit NOT NULL DEFAULT 'kg',
  current_stock NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  threshold     NUMERIC(10,2)  NOT NULL CHECK (threshold > 0),
  weekly_usage  NUMERIC(10,2)  NOT NULL CHECK (weekly_usage > 0),
  status        inventory_status NOT NULL DEFAULT 'ok',
  last_updated  DATE           NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
```

**Trigger — auto-compute status:**

```sql
CREATE OR REPLACE FUNCTION public.compute_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= NEW.threshold * 0.5 THEN
    NEW.status := 'critical';
  ELSIF NEW.current_stock <= NEW.threshold THEN
    NEW.status := 'low';
  ELSE
    NEW.status := 'ok';
  END IF;
  NEW.last_updated := CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_inventory_status
  BEFORE INSERT OR UPDATE OF current_stock, threshold
  ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.compute_inventory_status();
```

---

### 3. `inventory_logs`

Immutable audit trail. Every restock and stock-out is recorded here. Never updated or deleted.

```sql
CREATE TABLE public.inventory_logs (
  id           UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID             NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  action       inventory_action NOT NULL,
  quantity     NUMERIC(10,2)    NOT NULL CHECK (quantity > 0),
  stock_before NUMERIC(10,2)    NOT NULL,
  stock_after  NUMERIC(10,2)    NOT NULL,
  performed_by UUID             REFERENCES public.profiles(id) ON DELETE SET NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
```

---

### 4. `menu_categories`

User-defined meal categories. Defaults are seeded (see Seed Data section).

```sql
CREATE TABLE public.menu_categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 5. `menu_items`

Individual meals on the menu. Linked to a category. Soft-deleted via `is_available`.

```sql
CREATE TABLE public.menu_items (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID    NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name         TEXT    NOT NULL,
  description  TEXT    NOT NULL DEFAULT '',
  price        NUMERIC(10,2) NOT NULL CHECK (price > 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 6. `orders`

Order header. Each order belongs to a staff member who placed it.

```sql
CREATE TABLE public.orders (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  TEXT         NOT NULL UNIQUE,  -- e.g. #034
  type          order_type   NOT NULL DEFAULT 'Dine In',
  status        order_status NOT NULL DEFAULT 'pending',  -- 'pending' | 'ready' | 'cancelled'
  total         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_by    UUID         REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Trigger — auto-update `updated_at`:**

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

**Trigger — auto-generate order number:**

```sql
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := '#' || LPAD(nextval('order_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
```

---

### 7. `order_items`

Line items for each order. Stores a snapshot of the menu item price at time of order.

```sql
CREATE TABLE public.order_items (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID    NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id  UUID             REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT   NOT NULL,  -- snapshot of name at time of order
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  qty           INT     NOT NULL CHECK (qty > 0),
  line_total    NUMERIC(10,2) GENERATED ALWAYS AS (unit_price * qty) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Trigger — recalculate order total when items change:**

```sql
CREATE OR REPLACE FUNCTION public.recalculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders
  SET total = (
    SELECT COALESCE(SUM(line_total), 0)
    FROM public.order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_total();
```

---

## Functions & Triggers

### Helper — get current user role

```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Helper — check if current user is Admin

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Helper — check if current user is Admin or Inventory Manager

```sql
CREATE OR REPLACE FUNCTION public.can_manage_inventory()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('Admin', 'Inventory Manager')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## Row Level Security Policies

Enable RLS on all tables:

```sql
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
```

---

### profiles

```sql
-- Any authenticated user can read all profiles (needed for dashboard staff list)
CREATE POLICY "profiles: authenticated can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles: users update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only Admins can insert new profiles (staff creation)
CREATE POLICY "profiles: admins can insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only Admins can delete profiles
CREATE POLICY "profiles: admins can delete"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Admins can update any profile
CREATE POLICY "profiles: admins can update all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

---

### inventory_items

```sql
-- All authenticated users can read inventory
CREATE POLICY "inventory: authenticated can read"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (true);

-- Only Admins and Inventory Managers can insert
CREATE POLICY "inventory: managers can insert"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_inventory());

-- Only Admins and Inventory Managers can update
CREATE POLICY "inventory: managers can update"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (public.can_manage_inventory())
  WITH CHECK (public.can_manage_inventory());

-- Only Admins and Inventory Managers can delete
CREATE POLICY "inventory: managers can delete"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (public.can_manage_inventory());
```

---

### inventory_logs

```sql
-- All authenticated users can read logs (audit visibility)
CREATE POLICY "inventory_logs: authenticated can read"
  ON public.inventory_logs FOR SELECT
  TO authenticated
  USING (true);

-- Admins and Inventory Managers can insert logs
CREATE POLICY "inventory_logs: managers can insert"
  ON public.inventory_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_inventory());

-- Logs are immutable — no updates or deletes allowed
```

---

### menu_categories

```sql
-- All authenticated users can read categories
CREATE POLICY "menu_categories: authenticated can read"
  ON public.menu_categories FOR SELECT
  TO authenticated
  USING (true);

-- Only Admins can manage categories
CREATE POLICY "menu_categories: admins can insert"
  ON public.menu_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "menu_categories: admins can update"
  ON public.menu_categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "menu_categories: admins can delete"
  ON public.menu_categories FOR DELETE
  TO authenticated
  USING (public.is_admin());
```

---

### menu_items

```sql
-- All authenticated users can read menu items
CREATE POLICY "menu_items: authenticated can read"
  ON public.menu_items FOR SELECT
  TO authenticated
  USING (true);

-- Only Admins can manage menu items
CREATE POLICY "menu_items: admins can insert"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "menu_items: admins can update"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "menu_items: admins can delete"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.is_admin());
```

---

### orders

```sql
-- Admins can read all orders
CREATE POLICY "orders: admins can read all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Order Takers can read only their own orders
CREATE POLICY "orders: staff can read own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Any authenticated user can create an order
CREATE POLICY "orders: authenticated can insert"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Admins can update any order (e.g. change status)
CREATE POLICY "orders: admins can update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order Takers can cancel (update status) their own pending orders
CREATE POLICY "orders: staff can cancel own"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending')
  WITH CHECK (created_by = auth.uid());

-- Only Admins can delete orders
CREATE POLICY "orders: admins can delete"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.is_admin());
```

---

### order_items

```sql
-- Users who can see the order can see its items
CREATE POLICY "order_items: read if order visible"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
        AND (created_by = auth.uid() OR public.is_admin())
    )
  );

-- Any authenticated user can insert items into their own orders
CREATE POLICY "order_items: insert for own orders"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
        AND created_by = auth.uid()
        AND status = 'pending'
    )
  );

-- Only Admins can delete order items
CREATE POLICY "order_items: admins can delete"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (public.is_admin());
```

---

## Indexes

```sql
-- profiles
CREATE INDEX idx_profiles_role   ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- inventory_items
CREATE INDEX idx_inventory_status      ON public.inventory_items(status);
CREATE INDEX idx_inventory_ingredient  ON public.inventory_items(ingredient);

-- inventory_logs
CREATE INDEX idx_logs_item_id      ON public.inventory_logs(item_id);
CREATE INDEX idx_logs_performed_by ON public.inventory_logs(performed_by);
CREATE INDEX idx_logs_created_at   ON public.inventory_logs(created_at DESC);

-- menu_items
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);

-- orders
CREATE INDEX idx_orders_status     ON public.orders(status);
CREATE INDEX idx_orders_created_by ON public.orders(created_by);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_type       ON public.orders(type);

-- order_items
CREATE INDEX idx_order_items_order_id     ON public.order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON public.order_items(menu_item_id);
```

---

## Seed Data

Run after schema setup to populate default categories and menu items.

```sql
-- Default menu categories
INSERT INTO public.menu_categories (name, sort_order) VALUES
  ('Grills',       1),
  ('Rice & Sides', 2),
  ('Snacks',       3),
  ('Drinks',       4);

-- Menu items
INSERT INTO public.menu_items (category_id, name, description, price) VALUES
  -- Grills
  ((SELECT id FROM public.menu_categories WHERE name = 'Grills'), 'Beef Suya',         'Spiced skewered beef, grilled over charcoal',          12.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Grills'), 'Chicken Suya',      'Tender chicken skewers with suya spice blend',          10.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Grills'), 'Grilled Tilapia',   'Whole tilapia marinated and grilled to perfection',     14.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Grills'), 'Pork Ribs',         'Slow-grilled pork ribs with smoky glaze',               16.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Grills'), 'Mixed Grill Plate', 'Beef, chicken & fish with sides',                       20.00),
  -- Rice & Sides
  ((SELECT id FROM public.menu_categories WHERE name = 'Rice & Sides'), 'Jollof Rice',     'Party-style smoky tomato jollof rice',      8.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Rice & Sides'), 'Fried Plantains', 'Sweet ripe plantains, golden fried',        5.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Rice & Sides'), 'Coleslaw',        'Creamy house-made coleslaw',                4.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Rice & Sides'), 'Fried Yam',       'Crispy yam wedges, lightly seasoned',       5.50),
  ((SELECT id FROM public.menu_categories WHERE name = 'Rice & Sides'), 'Ofada Rice',      'Local ofada rice with ayamase sauce',       9.00),
  -- Snacks
  ((SELECT id FROM public.menu_categories WHERE name = 'Snacks'), 'Puff Puff',  'Deep-fried dough balls, lightly sweetened',   4.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Snacks'), 'Chin Chin',  'Crunchy fried snack, signature blend',        3.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Snacks'), 'Suya Wrap',  'Suya strips in a soft flatbread wrap',        7.00),
  -- Drinks
  ((SELECT id FROM public.menu_categories WHERE name = 'Drinks'), 'Zobo (Hibiscus)', 'Chilled hibiscus flower drink',                   3.00),
  ((SELECT id FROM public.menu_categories WHERE name = 'Drinks'), 'Malt Drink',      'Cold non-alcoholic malt',                         2.50),
  ((SELECT id FROM public.menu_categories WHERE name = 'Drinks'), 'Bottled Water',   'Still or sparkling',                              1.50),
  ((SELECT id FROM public.menu_categories WHERE name = 'Drinks'), 'Fresh Juice',     'Watermelon or pineapple, freshly blended',        4.00);

-- Inventory items
INSERT INTO public.inventory_items (ingredient, unit, current_stock, threshold, weekly_usage) VALUES
  ('Beef Ribeye',      'kg',     18,   10,  35),
  ('Chicken Thighs',   'kg',      6,    8,  22),
  ('Suya Spice Blend', 'bags',    3,    5,   8),
  ('Charcoal',         'bags',   40,   15,  20),
  ('Vegetable Oil',    'L',      12,   10,  15),
  ('Plantains',        'crates',  2,    3,   6),
  ('Tilapia (whole)',  'kg',      9,    8,  18),
  ('Jollof Rice',      'kg',      7,   10,  25),
  ('Hibiscus Flowers', 'kg',      1.5,  2,   3),
  ('Onions',           'kg',     22,   10,  14),
  ('Tomato Paste',     'kg',      5,    6,   9),
  ('Salt',             'kg',      8,    3,   2);
```

---

## Entity Relationship Summary

```
auth.users (Supabase managed)
    |
    | 1:1
    v
profiles
    |
    |------------ 1:many ---------> orders
    |                                   |
    |                                   | 1:many
    |                                   v
    |                               order_items
    |                                   |
    |                                   | many:1
    |                                   v
    |                               menu_items
    |                                   |
    |                                   | many:1
    |                                   v
    |                               menu_categories
    |
    |------------ 1:many ---------> inventory_logs
                                        |
                                        | many:1
                                        v
                                    inventory_items
```

### Key Relationships

| From            | To                | Type    | Via                         |
|-----------------|-------------------|---------|-----------------------------|
| `profiles`      | `orders`          | 1:many  | `orders.created_by`         |
| `orders`        | `order_items`     | 1:many  | `order_items.order_id`      |
| `menu_items`    | `order_items`     | 1:many  | `order_items.menu_item_id`  |
| `menu_categories` | `menu_items`    | 1:many  | `menu_items.category_id`    |
| `inventory_items` | `inventory_logs`| 1:many  | `inventory_logs.item_id`    |
| `profiles`      | `inventory_logs`  | 1:many  | `inventory_logs.performed_by` |

---

## Role Permission Matrix

| Action                  | Admin | Inventory Manager | Order Taker |
|-------------------------|:-----:|:-----------------:|:-----------:|
| Read all profiles       | yes   | yes               | yes         |
| Create / edit profiles  | yes   | no                | no          |
| Read inventory          | yes   | yes               | yes         |
| Add / edit inventory    | yes   | yes               | no          |
| Delete inventory        | yes   | yes               | no          |
| Read inventory logs     | yes   | yes               | yes         |
| Write inventory logs    | yes   | yes               | no          |
| Manage menu categories  | yes   | no                | no          |
| Manage menu items       | yes   | no                | no          |
| Create orders           | yes   | yes               | yes         |
| Read all orders         | yes   | no                | no          |
| Read own orders         | yes   | yes               | yes         |
| Update order status     | yes   | no                | no          |
| Cancel own pending order| yes   | yes               | yes         |
| Delete orders           | yes   | no                | no          |
