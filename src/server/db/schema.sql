-- Execute this directly in your PostgreSQL client

-- Enable uuid-ossp extension for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'mechanic', 'trainee')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cars
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (payment_status IN ('pending_payment', 'paid')),
  mechanic_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  mechanic_review_rating INT CHECK (mechanic_review_rating BETWEEN 1 AND 5),
  mechanic_review_comment TEXT,
  mechanic_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: progress_logs
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checked_out_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (checked_out_at IS NULL OR checked_out_at > checked_in_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS time_entries_one_open_per_user
  ON time_entries (user_id)
  WHERE checked_out_at IS NULL;

-- Quotation tables migrated from the Quotation service
CREATE TABLE IF NOT EXISTS quotation_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  density DOUBLE PRECISION NOT NULL,
  price_per_kg DOUBLE PRECISION NOT NULL,
  price_per_hour_machine DOUBLE PRECISION NOT NULL,
  price_per_hour_operator DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spacer_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  bolt_count INT NOT NULL,
  bolt_pattern DOUBLE PRECISION NOT NULL,
  thickness_mm DOUBLE PRECISION NOT NULL,
  center_bore DOUBLE PRECISION NOT NULL,
  is_hub_centric BOOLEAN NOT NULL DEFAULT FALSE,
  material_id UUID NOT NULL REFERENCES quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pulley_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outer_diameter DOUBLE PRECISION NOT NULL,
  inner_bore_diameter DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  groove_count INT NOT NULL,
  groove_type TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gear_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teeth_count INT NOT NULL,
  module DOUBLE PRECISION NOT NULL,
  pitch_diameter DOUBLE PRECISION NOT NULL,
  outer_diameter DOUBLE PRECISION NOT NULL,
  width DOUBLE PRECISION NOT NULL,
  tooth_height DOUBLE PRECISION NOT NULL,
  gear_type TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES quotation_materials(id),
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
