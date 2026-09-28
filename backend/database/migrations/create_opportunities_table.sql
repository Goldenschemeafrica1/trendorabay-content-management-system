CREATE TABLE opportunities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Basic information
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    description TEXT NOT NULL,

    -- Category
    category VARCHAR(100) NOT NULL,

    -- Organization
    organization_name VARCHAR(255),
    organization_logo VARCHAR(1000),
    organization_website VARCHAR(1000),

    -- Opportunity type
    opportunity_type ENUM(
        'free',
        'partner',
        'sponsored'
    ) NOT NULL DEFAULT 'free',

    -- Status
    status ENUM(
        'draft',
        'pending',
        'published',
        'expired',
        'rejected',
        'archived'
    ) NOT NULL DEFAULT 'draft',

    -- Display
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(1000),

    -- Location
    country VARCHAR(100),
    city VARCHAR(100),
    location VARCHAR(255),
    remote BOOLEAN NOT NULL DEFAULT FALSE,

    -- Eligibility and requirements
    eligibility TEXT,
    requirements TEXT,
    benefits TEXT,
    application_instructions TEXT,

    -- Application
    application_url VARCHAR(1000),
    application_email VARCHAR(255),

    -- Dates
    application_open_date DATETIME NULL,
    deadline DATETIME NULL,
    published_at DATETIME NULL,
    expires_at DATETIME NULL,

    -- Partner / Affiliate
    partner_name VARCHAR(255),
    partner_url VARCHAR(1000),
    affiliate_url VARCHAR(1000),
    affiliate_network VARCHAR(100),

    -- Monetization
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT NULL,
    currency VARCHAR(10) DEFAULT 'KES',

    commission_type ENUM(
        'none',
        'percentage',
        'fixed'
    ) NOT NULL DEFAULT 'none',

    commission_value DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Tracking
    views INT UNSIGNED NOT NULL DEFAULT 0,
    clicks INT UNSIGNED NOT NULL DEFAULT 0,
    applications INT UNSIGNED NOT NULL DEFAULT 0,
    conversions INT UNSIGNED NOT NULL DEFAULT 0,

    -- Submission
    submitted_by BIGINT UNSIGNED NULL,

    submission_source ENUM(
        'admin',
        'editor',
        'organization',
        'user',
        'partner'
    ) NOT NULL DEFAULT 'admin',

    -- Admin review
    reviewed_by BIGINT UNSIGNED NULL,

    review_status ENUM(
        'not_reviewed',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'not_reviewed',

    review_notes TEXT,

    -- Additional information
    tags VARCHAR(1000),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_opportunity_type (opportunity_type),
    INDEX idx_deadline (deadline),
    INDEX idx_featured (featured),
    INDEX idx_published_at (published_at),
    INDEX idx_country (country),
    INDEX idx_remote (remote),
    INDEX idx_submission_source (submission_source),
    INDEX idx_review_status (review_status)
);
