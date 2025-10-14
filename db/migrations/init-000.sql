-- Drop existing tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS absences CASCADE;

DROP TABLE IF EXISTS feedback CASCADE;

DROP TABLE IF EXISTS profiles CASCADE;

DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table with hierarchical manager relationship
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	role TEXT CHECK (role IN ('manager', 'employee')) NOT NULL,
	department VARCHAR(255),
	manager_id INTEGER REFERENCES users(id),
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table with sensitive salary data
CREATE TABLE profiles (
	user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	phone VARCHAR(50),
	address TEXT,
	emergency_contact JSONB,
	-- { name, phone, relationship }
	salary_sensitive JSONB,
	-- { amount, currency, bonus_eligible }
	bio TEXT,
	start_date DATE,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table for coworker/manager feedback
CREATE TABLE feedback (
	id SERIAL PRIMARY KEY,
	target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	body_raw TEXT NOT NULL,
	body_polished TEXT,
	-- nullable; filled if AI polish succeeds
	created_at TIMESTAMP DEFAULT NOW()
);

-- Absences table for employee requests
CREATE TABLE absences (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	start_date DATE NOT NULL,
	end_date DATE NOT NULL,
	reason TEXT NOT NULL,
	status TEXT CHECK (status IN ('requested', 'approved', 'rejected')) DEFAULT 'requested',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_users_manager_id ON users(manager_id);

CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_feedback_target_user ON feedback(target_user_id);

CREATE INDEX idx_feedback_author_user ON feedback(author_user_id);

CREATE INDEX idx_absences_user_id ON absences(user_id);

CREATE INDEX idx_absences_status ON absences(status);

-- Useful views for RBAC queries
-- View to find coworkers (same manager, excluding self)
CREATE
OR REPLACE VIEW coworkers AS
SELECT
	u1.id as user_id,
	u2.id as coworker_id,
	u2.name as coworker_name,
	u2.email as coworker_email,
	u2.department as coworker_department
FROM
	users u1
	JOIN users u2 ON u1.manager_id = u2.manager_id
WHERE
	u1.manager_id IS NOT NULL
	AND u1.id != u2.id;

-- View to find direct reports for managers
CREATE
OR REPLACE VIEW direct_reports AS
SELECT
	m.id as manager_id,
	e.id as employee_id,
	e.name as employee_name,
	e.email as employee_email,
	e.department as employee_department
FROM
	users m
	JOIN users e ON m.id = e.manager_id
WHERE
	m.role = 'manager';

-- Default admin suer. It will be used to create the initial users (only MVP)
INSERT INTO
	users (
		name,
		email,
		role,
		department,
		manager_id,
		password_hash
	)
VALUES
	(
		'Admin User',
		'admin@hrmvp.com',
		'manager',
		'Executive',
		NULL,
		crypt('AdminHRMVP!2025', gen_salt('bf'))
	);