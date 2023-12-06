DROP DATABASE IF EXISTS ministore;
CREATE DATABASE IF NOT EXISTS ministore;
USE ministore;

-- Create Tables
CREATE TABLE staffs (
    staff_id INT AUTO_INCREMENT NOT NULL,
    staff_name NVARCHAR(100) NOT NULL,
    role NVARCHAR(50),
    username NVARCHAR(100) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    phone_number NVARCHAR(20),
    status INT,
    image NVARCHAR(200),
    email NVARCHAR(200),
    work_days NVARCHAR(200),
    leave_balance INT,
    PRIMARY KEY (staff_id)
);

CREATE TABLE timesheets (
	timesheet_id INT AUTO_INCREMENT NOT NULL,
    shift_id INT NOT NULL,
    staff_id INT NOT NULL,
	salary_id INT,
    check_in_time TIME,
    check_out_time TIME,
    status INT,
    note_title NVARCHAR(100),
    note_content NVARCHAR(400),
    PRIMARY KEY (timesheet_id)
);

CREATE TABLE shiftcoverrequests (
	shift_cover_request_id INT AUTO_INCREMENT NOT NULL,
    shift_id INT NOT NULL,
    staff_id INT,
    note NVARCHAR(400),
    status INT,
    PRIMARY KEY (shift_cover_request_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE SET NULL
);

CREATE TABLE shifttemplates (
	shift_template_id INT AUTO_INCREMENT NOT NULL,
    start_time TIME,
    end_time TIME,
    name NVARCHAR(50),
    salary_coefficient FLOAT,
    role NVARCHAR(50),
    PRIMARY KEY (shift_template_id)
);

CREATE TABLE shifts (
	shift_id INT AUTO_INCREMENT NOT NULL,
    staff_id INT NOT NULL,
    timesheet_id INT,
    shift_cover_request_id INT,
    date DATE,
    published TINYINT(1),
	start_time TIME,
    end_time TIME,
    name NVARCHAR(50),
    salary_coefficient FLOAT,
    role NVARCHAR(50),
	PRIMARY KEY (shift_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE cascade,
    FOREIGN KEY (timesheet_id) REFERENCES timesheets(timesheet_id) ON DELETE SET NULL,
    FOREIGN KEY (shift_cover_request_id) REFERENCES shiftcoverrequests(shift_cover_request_id) ON DELETE SET NULL
);

CREATE TABLE scheduletemplates (
	schedule_template_id INT AUTO_INCREMENT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(400),
    num_of_shifts INT,
    PRIMARY KEY (schedule_template_id)
);

CREATE TABLE scheduleshifttemplates (
    schedule_shift_template_id INT AUTO_INCREMENT NOT NULL,
    schedule_template_id INT NOT NULL,
    staff_id INT NOT NULL,
    date DATE,
	start_time TIME,
    end_time TIME,
	salary_coefficient FLOAT,
    name NVARCHAR(50),
    role NVARCHAR(50),
    PRIMARY KEY (schedule_shift_template_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE cascade,
    FOREIGN KEY (schedule_template_id) REFERENCES scheduletemplates(schedule_template_id) ON DELETE cascade
);

CREATE TABLE leaverequests (
	leave_request_id INT AUTO_INCREMENT NOT NULL,
	staff_id INT NOT NULL,
    leave_type NVARCHAR(20),
	start_date DATE,
	end_date DATE,
	status INT,
	reason NVARCHAR(500),
    admin_reply NVARCHAR(500),
	PRIMARY KEY (leave_request_id),
	FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE cascade
);

CREATE TABLE salaries (
	salary_id INT AUTO_INCREMENT NOT NULL,
    staff_id INT NOT NULL,
    hourly_wage NVARCHAR(10),
    effective_date DATE,
    termination_date DATE,
    PRIMARY KEY (salary_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE cascade
);

CREATE TABLE holidays (
	holiday_id INT AUTO_INCREMENT NOT NULL,
	name NVARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
	coefficient FLOAT,
	PRIMARY KEY (holiday_id)
);

CREATE TABLE categories (
	category_id INT AUTO_INCREMENT NOT NULL,
	name NVARCHAR(100),
    description NVARCHAR(300),
	PRIMARY KEY (category_id)
);

CREATE TABLE products (
	product_id INT AUTO_INCREMENT NOT NULL,
	category_id INT,
	barcode NVARCHAR(20),
    name NVARCHAR(100) NOT NULL,
	description NVARCHAR(400),
	price FLOAT,
	inventory INT,
	PRIMARY KEY (product_id),
	FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE orders (
	order_id INT AUTO_INCREMENT NOT NULL,
	order_date DATETIME NOT NULL,
	grand_total FLOAT,
    payment_status INT,
    staff_id INT,
	PRIMARY KEY (order_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE SET NULL
);

CREATE TABLE orderitems (
	order_item_id INT AUTO_INCREMENT NOT NULL,
	order_id INT NOT NULL,
	product_id INT NOT NULL,
	quantity INT,
	PRIMARY KEY (order_item_id),
	FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE cascade,
	FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE cascade
);


alter table timesheets add FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE cascade;
alter table timesheets add FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE cascade;
alter table timesheets add FOREIGN KEY (salary_id) REFERENCES salaries(salary_id) ON DELETE SET NULL;
alter table shiftcoverrequests add FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE cascade;