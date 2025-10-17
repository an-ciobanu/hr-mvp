-- Drop existing tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS absences CASCADE;

DROP TABLE IF EXISTS feedback CASCADE;

DROP TABLE IF EXISTS profiles CASCADE;

DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table with hierarchical manager relationship
CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	role TEXT CHECK (role IN ('manager', 'employee')) NOT NULL,
	department VARCHAR(255),
	manager_id UUID REFERENCES users(id),
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table with sensitive salary data
CREATE TABLE profiles (
	user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	phone VARCHAR(50),
	address TEXT,
	emergency_contact JSONB,
	-- { name, phone, relationship }
	salary_sensitive JSONB,
	-- { amount, currency }
	bio TEXT,
	start_date DATE,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table for coworker/manager feedback
CREATE TABLE feedback (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	body_raw TEXT NOT NULL,
	body_polished TEXT,
	-- nullable; filled if AI polish succeeds
	created_at TIMESTAMP DEFAULT NOW()
);

-- Absences table for employee requests
CREATE TABLE absences (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Data used for demo purpses
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
	-- Admin user
	(
		'Admin User',
		'admin@hrmvp.com',
		'manager',
		'Executive',
		NULL,
		crypt('AdminHRMVP!2025', gen_salt('bf'))
	),
	-- Manager 1 (reports to admin)
	(
		'Manager One',
		'manager1@hrmvp.com',
		'manager',
		'Sales',
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'admin@hrmvp.com'
		),
		crypt('Manager1!2025', gen_salt('bf'))
	),
	-- Manager 2 (reports to admin)
	(
		'Manager Two',
		'manager2@hrmvp.com',
		'manager',
		'Engineering',
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'admin@hrmvp.com'
		),
		crypt('Manager2!2025', gen_salt('bf'))
	),
	-- Employee 1 (reports to Manager 1)
	(
		'Employee One',
		'employee1@hrmvp.com',
		'employee',
		'Sales',
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager1@hrmvp.com'
		),
		crypt('Employee1!2025', gen_salt('bf'))
	),
	-- Employee 2 (reports to Manager 2)
	(
		'Employee Two',
		'employee2@hrmvp.com',
		'employee',
		'Engineering',
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager2@hrmvp.com'
		),
		crypt('Employee2!2025', gen_salt('bf'))
	),
	-- Employee 3 (reports to Manager 2)
	(
		'Employee Three',
		'employee3@hrmvp.com',
		'employee',
		'Engineering',
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager2@hrmvp.com'
		),
		crypt('Employee3!2025', gen_salt('bf'))
	);

INSERT INTO
	feedback (
		target_user_id,
		author_user_id,
		body_raw,
		body_polished
	)
VALUES
	-- Employee 2 to Employee 1
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee1@hrmvp.com'
		),
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee2@hrmvp.com'
		),
		'Great teamwork on the sales project!',
		NULL
	),
	-- Employee 3 to Employee 2
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee2@hrmvp.com'
		),
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee3@hrmvp.com'
		),
		'Thanks for helping with the onboarding process.',
		NULL
	),
	-- Manager 1 to Employee 1
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee1@hrmvp.com'
		),
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager1@hrmvp.com'
		),
		'Excellent performance this quarter.',
		NULL
	);

-- Demo profiles for all users except admin
INSERT INTO
	profiles (
		user_id,
		phone,
		address,
		emergency_contact,
		salary_sensitive,
		bio,
		start_date
	)
VALUES
	-- Manager 1
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager1@hrmvp.com'
		),
		'0712345678',
		'123 Sales St, City',
		'{"name": "Jane Doe", "phone": "0700000001", "relationship": "Spouse"}',
		'{"amount": 80000, "currency": "EUR"}',
		'Sales manager with 10 years experience.',
		'2022-01-10'
	),
	-- Manager 2
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'manager2@hrmvp.com'
		),
		'0723456789',
		'456 Eng Ave, City',
		'{"name": "John Smith", "phone": "0700000002", "relationship": "Partner"}',
		'{"amount": 85000, "currency": "EUR"}',
		'Engineering manager, passionate about tech.',
		'2022-02-15'
	),
	-- Employee 1
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee1@hrmvp.com'
		),
		'0734567890',
		'789 Sales St, City',
		'{"name": "Emily Roe", "phone": "0700000003", "relationship": "Parent"}',
		'{"amount": 40000, "currency": "EUR"}',
		'Sales associate, team player.',
		'2023-03-01'
	),
	-- Employee 2
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee2@hrmvp.com'
		),
		'0745678901',
		'101 Eng Ave, City',
		'{"name": "Mark Poe", "phone": "0700000004", "relationship": "Sibling"}',
		'{"amount": 42000, "currency": "EUR"}',
		'Junior engineer, quick learner.',
		'2023-04-10'
	),
	-- Employee 3
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee3@hrmvp.com'
		),
		'0756789012',
		'202 Eng Ave, City',
		'{"name": "Anna Lee", "phone": "0700000005", "relationship": "Friend"}',
		'{"amount": 43000, "currency": "EUR"}',
		'Engineer, focused on backend systems.',
		'2023-05-20'
	);

-- Demo absences
INSERT INTO
	absences (user_id, start_date, end_date, reason, status)
VALUES
	-- Employee 3: rejected absence
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee3@hrmvp.com'
		),
		'2025-10-01',
		'2025-10-05',
		'Vacation request',
		'rejected'
	),
	-- Employee 3: pending absence
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee3@hrmvp.com'
		),
		'2025-11-10',
		'2025-11-12',
		'Medical appointment',
		'requested'
	),
	-- Employee 1: accepted absence
	(
		(
			SELECT
				id
			FROM
				users
			WHERE
				email = 'employee1@hrmvp.com'
		),
		'2025-09-15',
		'2025-09-16',
		'Family event',
		'approved'
	);