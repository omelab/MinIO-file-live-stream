-- Products table
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  unit VARCHAR(50) DEFAULT 'pcs',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribution Houses table
CREATE TABLE distribution_houses (
  distribution_house_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE warehouses (
  warehouse_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transport/Vehicle table
CREATE TABLE transports (
  transport_id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(100) NOT NULL,
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  vehicle_type VARCHAR(100),
  capacity DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribution House Stock Log
CREATE TABLE distribution_house_stock_log (
  id SERIAL PRIMARY KEY,
  distribution_house_id INT NOT NULL REFERENCES distribution_houses(distribution_house_id),
  date DATE NOT NULL,
  product_id INT NOT NULL REFERENCES products(product_id),

  opening_stock DECIMAL(10,2) DEFAULT 0,
  stock_in DECIMAL(10,2) DEFAULT 0,
  stock_out DECIMAL(10,2) DEFAULT 0,
  closing_stock DECIMAL(10,2) DEFAULT 0,

  reference_type VARCHAR(50) CHECK (
    reference_type IN (
      'Purchase',
      'Production', 
      'DH_to_DH_Transfer_In',
      'DH_to_DH_Transfer_Out',
      'DH_to_WH_Transfer_Out',
      'WH_to_DH_Return_In'
    )
  ),
  reference_id INT NULL,
  transport_id INT NULL REFERENCES transports(transport_id),

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL
);

-- Warehouse Stock Log
CREATE TABLE warehouse_stock_log (
  id SERIAL PRIMARY KEY,
  warehouse_id INT NOT NULL REFERENCES warehouses(warehouse_id),
  date DATE NOT NULL,
  product_id INT NOT NULL REFERENCES products(product_id),

  opening_stock DECIMAL(10,2) DEFAULT 0,
  stock_in DECIMAL(10,2) DEFAULT 0,
  stock_out DECIMAL(10,2) DEFAULT 0,
  closing_stock DECIMAL(10,2) DEFAULT 0,

  reference_type VARCHAR(50) CHECK (
    reference_type IN (
      'Receive_from_DH',
      'Receive_from_WH',
      'Sale',
      'Customer_Return',
      'WH_to_WH_Transfer_In',
      'WH_to_WH_Transfer_Out',
      'WH_to_DH_Return_Out'
    )
  ),
  reference_id INT NULL,
  transport_id INT NULL REFERENCES transports(transport_id),

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL
);

-- Daily Stock Summary for reporting
CREATE TABLE daily_stock_summary (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  location_type VARCHAR(20) CHECK (location_type IN ('Distribution','Warehouse')),
  location_id INT NOT NULL,
  product_id INT NOT NULL REFERENCES products(product_id),
  closing_stock DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_dh_stock_log_date ON distribution_house_stock_log(date);
CREATE INDEX idx_dh_stock_log_product ON distribution_house_stock_log(product_id);
CREATE INDEX idx_dh_stock_log_dh ON distribution_house_stock_log(distribution_house_id);
CREATE INDEX idx_wh_stock_log_date ON warehouse_stock_log(date);
CREATE INDEX idx_wh_stock_log_product ON warehouse_stock_log(product_id);
CREATE INDEX idx_wh_stock_log_wh ON warehouse_stock_log(warehouse_id);
CREATE INDEX idx_daily_stock_summary ON daily_stock_summary(date, location_type, location_id, product_id);