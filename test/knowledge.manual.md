tags.
</FORMAT-DESCRIPTION>
<META:type="md">
<META:checksum="338520d05fa4a193891029973ffe07b9">
<META:size="81887">
<META:lines="2519">
<META:date="2025-02-27T22:49:12.401Z">
<CONTENT>
---
date: 2025-02-27 22:52:23
---

# Project Specifications "Knowledge Base"

This project specifications will help you understand the project architecture and features.

It might not be up to date, always refer to code as source of truth.

---
File name: documentation/01. Global Functional Analysis/01. Project functional Summary.md
Last modification: 2025-02-25 09:30:39
---

````md
# Club Expense Tracking System: Functional Analysis Summary

## 1. Project Theme Identification

### Core Theme
An expense tracking system for club members that:
- Tracks travel-related expenses (kilometers, tolls, gasoline, etc.) for events
- Enables club managers to generate expense summaries per member and per event
- Produces yearly expense summaries for members with options to convert expenses to donations
- Generates appropriate fiscal declarations for both members and club managers regarding donations for tax purposes

## 2. Expected Functionality Definition

### User Registration and Management
- Club managers registration
- Club members registration (by invitation from club managers only)
- User details input for both user types
- Car details input for members (especially for French fiscal information)
- Account deletion functionality for all users

### Club Manager Functionalities
- Event creation and management
- Setting expense submission deadlines for events
- Invitation system to register club members
- Dashboard with KPIs and expense summaries (filtered by event and member)
- Data visualization with filtering capabilities
- Expense validation workflow with feedback mechanism
- Club member management (inactivate/delete accounts)
- On-demand fiscal reporting generation showing donation amounts per member
- Notifications when club members add expenses
- Subscription to premium plan with payment system for additional features

### Club Member Functionalities
- Expense entry per event (labeled expenses or kilometers driven with personal vehicle)
- Expense categorization (tolls, gasoline, kilometers, etc.)
- Personal dashboard showing yearly expense review (with global and per-event views)
- Document download functionality for donation confirmations and fiscal declarations

### Platform Administrator Functionalities
- Dashboard showing:
  - Number of clubs and users per club
  - Revenue generated from subscriptions
  - Overall expenses handled by the platform
- Club and club user management
- System Configuration:
  - Global system settings management
  - Tax calculation parameters configuration
  - System-wide limits and thresholds
- Content Management:
  - Terms of service, privacy policy, and help documentation editing
  - Email template management
  - FAQ creation and updates
- Support Functions:
  - Support ticket management
  - Override capabilities for dispute resolution
  - Password reset and account recovery
- Analytics & Reporting:
  - Platform-wide usage analytics
  - Data export for compliance and auditing
  - System performance monitoring
- Security Management:
  - Security log review
  - IP blocking and access control
  - Club verification processes
- Financial Administration:
  - Payment processor integration management
  - Subscription billing issue handling
  - Refund processing

### System Functionalities
- Mileage calculation using French government's grid (based on vehicle power)
- CSV export for event or club member expenses
- Audit trail/history of all expense-related activities
- Backup/recovery system for fiscal documents

### Future Considerations
- Approval workflows
- Bulk operations
- Multi-currency support

## 3. Application Scope and Platform Specification

### Web Platform
- Cloud-hosted solution
- Accessible to all user types (club managers, club members, platform administrator)
- Full functionality for all user roles
- Responsive design

### Mobile Applications
- Available for both Android and iOS platforms
- Published on respective app stores (Google Play and Apple App Store)
- Camera functionality for:
  - Taking pictures of receipts as expense evidence
  - Capturing odometer readings to document vehicle mileage
- Primary focus on club member functionality, specifically expense input
- Online-only functionality (no offline access required)
- Connected to the cloud-hosted database for real-time data synchronization

### Cross-Platform Requirements
- Authentication methods:
  - Username/password
  - Google OAuth
- REST API for communication between applications and database
- Push notifications for mobile users
- Data retention policy: 5 years minimum
- No specific accessibility compliance requirements

## 4. User Profiles and Persona Development

### Club Member
**Profile Characteristics:**
- Comfortable with basic mobile app usage
- Needs simple, intuitive interfaces
- Typically tracking expenses on-the-go during or immediately after events
- Uses the system approximately weekly (based on event frequency)

**Key Pain Points:**
- Difficulty remembering to track kilometers driven to/from events
- No current reminders or easy way to log travel expenses
- Manual calculations of distances and costs
- Cumbersome process to submit expenses to club managers

**Primary Goals:**
- Quick and easy expense logging, especially for mileage
- Minimal administrative burden
- Clear visibility into potential tax benefits
- Simple access to required documentation

### Club Manager
**Profile Characteristics:**
- Basic to moderate technical proficiency
- Uses the system sporadically, often at month-end
- Manages multiple events (approximately weekly) and associated expenses
- Needs both mobile and desktop functionality

**Key Pain Points:**
- Collecting complete expense information from multiple club members
- Generating donation documentation from submitted expenses
- Creating and managing fiscal documents for tax authorities
- Tracking which members have submitted expenses for which events

**Primary Goals:**
- Streamlined expense collection and validation
- Automated generation of donation and fiscal documents
- Clear overview of club finances and member participation
- Simplified reporting for tax compliance

### Platform Administrator
**Profile Characteristics:**
- Higher technical proficiency
- Administrative focus on system management and oversight
- Needs comprehensive dashboards and control capabilities

**Key Pain Points:**
- Managing multiple clubs with varying needs
- Ensuring system reliability and performance
- Tracking business metrics and subscription revenue

**Primary Goals:**
- Maintain platform integrity
- Monitor business growth and usage patterns
- Provide necessary support to clubs and members
- Ensure regulatory compliance

## 5. Additional Considerations

### Data Privacy & Compliance
- GDPR compliance for handling personal and financial information
- French-specific data protection requirements
- Secure storage of sensitive financial information
- Clear user consent mechanisms for data processing
- Data minimization principles implementation
- Transparency in data usage policies

### Localization
- Primary language support for French
- French fiscal regulation compliance
- French tax document formatting
- Adaptation to French mileage reimbursement calculations

### Error Handling & Edge Cases
- Flexible deadline handling (deadlines serve as information only)
- Clear communication mechanism for rejected expenses
- Club manager feedback system for expense rejections

### Integration Requirements
- Integration with mapping services for mileage verification
- Stripe payment gateway integration for subscription management

### Future Considerations
- Detailed reporting and analytics requirements to be specified later
- Additional payment gateway options beyond Stripe
- Potential integrations with accounting software
````

---
File name: documentation/01. Global Functional Analysis/03. Database Schema Design.md
Last modification: 2025-02-26 09:22:21
---

````md
# Club Expense Tracking System - Complete Database Schema Design

## 1. Conceptual Model

### Core Entities

1. **User**
   - Base entity for all users in the system
   - Contains common attributes: gender, first name, last name, email, postal address
   - Timestamps for creation and updates
   - Authentication information
 
2. **Role**
   - Defines permissions in the system
   - Types: Platform Administrator, Club Manager, Club Member

3. **Club**
   - Organization entity that groups members
   - Basic information about the club
   - Configuration settings
   - Subscription status (premium/standard)

4. **ClubMembership**
   - Junction entity connecting Users to Clubs
   - Defines role within the club (manager or regular member)
   - Status of membership (active/inactive)

5. **Vehicle**
   - Belongs to a user
   - Contains registration, power rating, manufacturer details
   - Used for mileage expense calculations

6. **Event**
   - Organized by a club
   - Has date, location, description
   - Expense submission deadline

7. **Expense**
   - Submitted by club members for events
   - Different expense types (mileage, tolls, gasoline, etc.)
   - Amount, currency (Euro), description
   - Status (submitted, approved, converted to donation)

8. **ExpenseCategory**
   - Types of expenses (mileage, tolls, gasoline, etc.)
   - Associated rules or calculations

9. **FiscalParameter**
   - Yearly parameters for calculations
   - Mileage rates based on vehicle power
   - Tax-related parameters

10. **FiscalDocument**
    - Generated tax documents
    - References to related expenses and members
    - Document type and fiscal year

11. **Notification**
    - System notifications
    - Type, message, status
    - Target user(s)

12. **AuditLog**
    - Tracks changes to critical data
    - Records user, timestamp, and nature of changes

13. **Subscription**
   - Tracks premium subscriptions for clubs
   - Includes payment history, plan details, and expiration dates
   - Provides historical record of subscription changes

14. **DonationRecord**
   - Tracks when expenses are converted to donations
   - Maintains history of donation conversions for tax purposes
   - Could include donation certificates and acknowledgments

15. **SystemConfiguration**
   - Stores global system parameters
   - Contains default values and system-wide settings
   - Centralizes configuration management

16. **ExpenseEvidence**
   - Stores links to receipt images and other supporting documents
   - Maintains proof of expenses for audit purposes
   - Multiple pieces of evidence could be attached to a single expense

17. **FeedbackMessage**
   - Tracks communication between club managers and members about expenses
   - Records reasons for rejection or requests for additional information
   - Maintains a conversation history about expense submissions

### Entity Relationships

1. **User to Role**
   - Many-to-many through UserRole
   - A user can have multiple roles

2. **User to Club**
   - Many-to-many through ClubMembership
   - A user can be a member of multiple clubs
   - A club has multiple members

3. **User to Vehicle**
   - One-to-many: A user can register multiple vehicles
   - Vehicles belong to a single user

4. **Club to Event**
   - One-to-many: A club organizes multiple events
   - An event belongs to a single club

5. **Event to Expense**
   - One-to-many: An event has multiple expenses
   - An expense is associated with a single event

6. **User to Expense**
   - One-to-many: A user submits multiple expenses
   - An expense is submitted by a single user

7. **Expense to ExpenseCategory**
   - Many-to-one: Many expenses can be of the same category
   - Each expense has one category

8. **FiscalParameter to Expense Calculations**
   - Used to calculate expense amounts, particularly for mileage
   - Yearly parameters affect calculations

9. **Club to FiscalDocument**
   - One-to-many: A club generates multiple fiscal documents
   - A fiscal document belongs to a single club

10. **User to Notification**
    - One-to-many: A user receives multiple notifications
    - A notification targets specific user(s)

11. **Expense to ExpenseEvidence**
    - One-to-many: An expense can have multiple pieces of evidence
    - Evidence belongs to a single expense

12. **Expense to FeedbackMessage**
    - One-to-many: An expense can have multiple feedback messages
    - Messages are associated with a single expense

13. **Club to Subscription**
    - One-to-many: A club can have multiple subscriptions over time
    - A subscription belongs to a single club

14. **User/Club to DonationRecord**
    - A donation record connects a user, club, and fiscal year
    - Summarizes donations for tax purposes

### Conceptual Entity-Relationship Diagram

```
+----------+     +----------------+     +-------+
|   User   |-----| ClubMembership |-----|  Club |
+----------+     +----------------+     +-------+
    |  |                                    |
    |  |                                    |
    |  v                                    v
+----------+                           +--------+
| Vehicle  |                           |  Event |
+----------+                           +--------+
                                           |
+-------------------+                      |
| FiscalParameter   |                      |
+-------------------+                      v
          |                         +-----------+
          |                         |  Expense  |
          v                         +-----------+
+------------------+                      |
| ExpenseCategory  |<---------------------+
+------------------+                      |
                                          |
                                          v
+---------------+     +----------------+  |  +-------------------+
| FiscalDocument|<----|    AuditLog    |  |  |  ExpenseEvidence  |
+---------------+     +----------------+  |  +-------------------+
                                          |
+-------------+     +----------------+    |
| Notification |     | DonationRecord |<--+
+-------------+     +----------------+    |
                                          v
+------------------+     +--------------------+
| Subscription     |     |  FeedbackMessage   |
+------------------+     +--------------------+

+-------------------+
| SystemConfiguration |
+-------------------+
```

## 2. Logical Schema Design

### User
- **Fields**:
  - `user_id` (PK): BIGINT (auto-increment)
  - `user_uuid`: UUID (unique) - for external references
  - `user_email`: VARCHAR(255) - unique
  - `user_password_hash`: VARCHAR(255)
  - `user_first_name`: VARCHAR(100)
  - `user_last_name`: VARCHAR(100)
  - `user_gender`: CHAR(1) - 'M', 'F', 'O' (Other)
  - `user_postal_address`: TEXT
  - `user_phone_number`: VARCHAR(20)
  - `user_is_active`: BOOLEAN
  - `user_created_at`: TIMESTAMP
  - `user_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `user_id`
  - Unique Index: `user_uuid`
  - Unique Index: `user_email`

### Role
- **Fields**:
  - `role_id` (PK): INTEGER (auto-increment)
  - `role_name`: VARCHAR(50) - e.g., 'platform_admin', 'club_manager', 'club_member'
  - `role_description`: TEXT
  - `role_created_at`: TIMESTAMP
  - `role_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `role_id`
  - Unique Index: `role_name`

### UserRole
- **Fields**:
  - `urol_id` (PK): BIGINT (auto-increment)
  - `urol_user_id` (FK): BIGINT - references User(user_id)
  - `urol_role_id` (FK): INTEGER - references Role(role_id)
  - `urol_created_at`: TIMESTAMP
  - `urol_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `urol_id`
  - Foreign Key: `urol_user_id`
  - Foreign Key: `urol_role_id`
  - Unique Index: `(urol_user_id, urol_role_id)`

### Club
- **Fields**:
  - `club_id` (PK): BIGINT (auto-increment)
  - `club_uuid`: UUID (unique) - for external references
  - `club_name`: VARCHAR(255)
  - `club_description`: TEXT
  - `club_address`: TEXT
  - `club_is_active`: BOOLEAN
  - `club_created_at`: TIMESTAMP
  - `club_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `club_id`
  - Unique Index: `club_uuid`
  - Index: `club_name`

### Subscription
- **Fields**:
  - `sub_id` (PK): BIGINT (auto-increment)
  - `sub_uuid`: UUID (unique) - for external references
  - `sub_club_id` (FK): BIGINT - references Club(club_id)
  - `sub_plan_type`: VARCHAR(50) - e.g., 'standard', 'premium'
  - `sub_start_date`: DATE
  - `sub_end_date`: DATE
  - `sub_payment_status`: VARCHAR(50)
  - `sub_payment_reference`: VARCHAR(255)
  - `sub_created_at`: TIMESTAMP
  - `sub_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `sub_id`
  - Unique Index: `sub_uuid`
  - Foreign Key: `sub_club_id`
  - Index: `sub_end_date`

### ClubMembership
- **Fields**:
  - `memb_id` (PK): BIGINT (auto-increment)
  - `memb_user_id` (FK): BIGINT - references User(user_id)
  - `memb_club_id` (FK): BIGINT - references Club(club_id)
  - `memb_is_manager`: BOOLEAN
  - `memb_join_date`: DATE
  - `memb_status`: VARCHAR(20) - e.g., 'active', 'inactive'
  - `memb_created_at`: TIMESTAMP
  - `memb_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `memb_id`
  - Foreign Key: `memb_user_id`
  - Foreign Key: `memb_club_id`
  - Unique Index: `(memb_user_id, memb_club_id)`
  - Index: `memb_status`

### Vehicle
- **Fields**:
  - `veh_id` (PK): BIGINT (auto-increment)
  - `veh_uuid`: UUID (unique) - for external references
  - `veh_user_id` (FK): BIGINT - references User(user_id)
  - `veh_registration`: VARCHAR(20)
  - `veh_manufacturer`: VARCHAR(100)
  - `veh_model`: VARCHAR(100)
  - `veh_power_rating`: INTEGER
  - `veh_year`: INTEGER
  - `veh_is_active`: BOOLEAN
  - `veh_created_at`: TIMESTAMP
  - `veh_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `veh_id`
  - Unique Index: `veh_uuid`
  - Foreign Key: `veh_user_id`
  - Unique Index: `veh_registration`

### Event
- **Fields**:
  - `evt_id` (PK): BIGINT (auto-increment)
  - `evt_uuid`: UUID (unique) - for external references
  - `evt_club_id` (FK): BIGINT - references Club(club_id)
  - `evt_name`: VARCHAR(255)
  - `evt_description`: TEXT
  - `evt_location`: TEXT
  - `evt_start_date`: TIMESTAMP
  - `evt_end_date`: TIMESTAMP
  - `evt_expense_deadline`: TIMESTAMP
  - `evt_status`: VARCHAR(20) - e.g., 'upcoming', 'active', 'completed'
  - `evt_created_at`: TIMESTAMP
  - `evt_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `evt_id`
  - Unique Index: `evt_uuid`
  - Foreign Key: `evt_club_id`
  - Index: `evt_start_date`
  - Index: `evt_status`

### ExpenseCategory
- **Fields**:
  - `ecat_id` (PK): INTEGER (auto-increment)
  - `ecat_name`: VARCHAR(100) - e.g., 'mileage', 'toll', 'gasoline'
  - `ecat_description`: TEXT
  - `ecat_requires_receipt`: BOOLEAN
  - `ecat_is_active`: BOOLEAN
  - `ecat_created_at`: TIMESTAMP
  - `ecat_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `ecat_id`
  - Unique Index: `ecat_name`

### FiscalParameter
- **Fields**:
  - `fprm_id` (PK): BIGINT (auto-increment)
  - `fprm_fiscal_year`: INTEGER
  - `fprm_name`: VARCHAR(100)
  - `fprm_value`: TEXT - JSON to store complex parameters like mileage rates
  - `fprm_effective_from`: DATE
  - `fprm_effective_to`: DATE
  - `fprm_created_at`: TIMESTAMP
  - `fprm_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `fprm_id`
  - Unique Index: `(fprm_fiscal_year, fprm_name)`
  - Index: `fprm_fiscal_year`

### Expense
- **Fields**:
  - `exp_id` (PK): BIGINT (auto-increment)
  - `exp_uuid`: UUID (unique) - for external references
  - `exp_user_id` (FK): BIGINT - references User(user_id)
  - `exp_club_id` (FK): BIGINT - references Club(club_id)
  - `exp_event_id` (FK): BIGINT - references Event(evt_id)
  - `exp_category_id` (FK): INTEGER - references ExpenseCategory(ecat_id)
  - `exp_vehicle_id` (FK): BIGINT - references Vehicle(veh_id), nullable
  - `exp_amount`: DECIMAL(10,2)
  - `exp_currency`: VARCHAR(3) - default 'EUR'
  - `exp_description`: TEXT
  - `exp_date`: DATE
  - `exp_status`: VARCHAR(20) - e.g., 'draft', 'submitted', 'approved', 'rejected'
  - `exp_is_donation`: BOOLEAN - default false
  - `exp_kilometers`: DECIMAL(10,2) - nullable, for mileage expenses
  - `exp_created_at`: TIMESTAMP
  - `exp_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `exp_id`
  - Unique Index: `exp_uuid`
  - Foreign Key: `exp_user_id`
  - Foreign Key: `exp_club_id`
  - Foreign Key: `exp_event_id`
  - Foreign Key: `exp_category_id`
  - Foreign Key: `exp_vehicle_id`
  - Index: `exp_date`
  - Index: `exp_status`
  - Index: `exp_is_donation`

### ExpenseEvidence
- **Fields**:
  - `evid_id` (PK): BIGINT (auto-increment)
  - `evid_expense_id` (FK): BIGINT - references Expense(exp_id)
  - `evid_file_path`: VARCHAR(255)
  - `evid_file_type`: VARCHAR(50)
  - `evid_upload_date`: TIMESTAMP
  - `evid_description`: TEXT
  - `evid_created_at`: TIMESTAMP
  - `evid_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `evid_id`
  - Foreign Key: `evid_expense_id`

### DonationRecord
- **Fields**:
  - `don_id` (PK): BIGINT (auto-increment)
  - `don_uuid`: UUID (unique) - for external references
  - `don_user_id` (FK): BIGINT - references User(user_id)
  - `don_club_id` (FK): BIGINT - references Club(club_id)
  - `don_fiscal_year`: INTEGER
  - `don_total_amount`: DECIMAL(10,2)
  - `don_certificate_number`: VARCHAR(100)
  - `don_issue_date`: DATE
  - `don_status`: VARCHAR(20)
  - `don_created_at`: TIMESTAMP
  - `don_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `don_id`
  - Unique Index: `don_uuid`
  - Foreign Key: `don_user_id`
  - Foreign Key: `don_club_id`
  - Index: `don_fiscal_year`
  - Unique Index: `don_certificate_number`

### FiscalDocument
- **Fields**:
  - `fdoc_id` (PK): BIGINT (auto-increment)
  - `fdoc_uuid`: UUID (unique) - for external references
  - `fdoc_club_id` (FK): BIGINT - references Club(club_id)
  - `fdoc_type`: VARCHAR(50) - e.g., 'donation_certificate', 'tax_report'
  - `fdoc_fiscal_year`: INTEGER
  - `fdoc_file_path`: VARCHAR(255)
  - `fdoc_generation_date`: TIMESTAMP
  - `fdoc_status`: VARCHAR(20)
  - `fdoc_created_at`: TIMESTAMP
  - `fdoc_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `fdoc_id`
  - Unique Index: `fdoc_uuid`
  - Foreign Key: `fdoc_club_id`
  - Index: `fdoc_fiscal_year`
  - Index: `fdoc_type`

### FeedbackMessage
- **Fields**:
  - `fmsg_id` (PK): BIGINT (auto-increment)
  - `fmsg_expense_id` (FK): BIGINT - references Expense(exp_id)
  - `fmsg_sender_id` (FK): BIGINT - references User(user_id)
  - `fmsg_message`: TEXT
  - `fmsg_is_read`: BOOLEAN
  - `fmsg_created_at`: TIMESTAMP
  - `fmsg_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `fmsg_id`
  - Foreign Key: `fmsg_expense_id`
  - Foreign Key: `fmsg_sender_id`
  - Index: `fmsg_created_at`

### Notification
- **Fields**:
  - `notf_id` (PK): BIGINT (auto-increment)
  - `notf_user_id` (FK): BIGINT - references User(user_id)
  - `notf_type`: VARCHAR(50) - e.g., 'expense_submitted', 'subscription_renewed'
  - `notf_title`: VARCHAR(255)
  - `notf_message`: TEXT
  - `notf_is_read`: BOOLEAN
  - `notf_created_at`: TIMESTAMP
  - `notf_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `notf_id`
  - Foreign Key: `notf_user_id`
  - Index: `notf_type`
  - Index: `notf_is_read`
  - Index: `notf_created_at`

### SystemConfiguration
- **Fields**:
  - `conf_id` (PK): INTEGER (auto-increment)
  - `conf_key`: VARCHAR(100)
  - `conf_value`: TEXT
  - `conf_description`: TEXT
  - `conf_created_at`: TIMESTAMP
  - `conf_updated_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `conf_id`
  - Unique Index: `conf_key`

### AuditLog
- **Fields**:
  - `alog_id` (PK): BIGINT (auto-increment)
  - `alog_user_id` (FK): BIGINT - references User(user_id), nullable
  - `alog_entity_type`: VARCHAR(50) - e.g., 'user', 'expense', 'club'
  - `alog_entity_id`: VARCHAR(36)
  - `alog_action`: VARCHAR(20) - e.g., 'create', 'update', 'delete'
  - `alog_previous_state`: JSONB - nullable
  - `alog_new_state`: JSONB - nullable
  - `alog_ip_address`: VARCHAR(45)
  - `alog_user_agent`: TEXT
  - `alog_created_at`: TIMESTAMP
- **Indexes**:
  - Primary Key: `alog_id`
  - Foreign Key: `alog_user_id`
  - Index: `alog_entity_type`
  - Index: `alog_entity_id`
  - Index: `alog_action`
  - Index: `alog_created_at`

## 3. Physical Schema Optimization

### Data Type Optimization

#### Integer Types
- Use `SERIAL` or `BIGSERIAL` for auto-incrementing primary keys
- `INT` for standard integer values (4 bytes)
- `BIGINT` for larger integer values or when future growth is expected (8 bytes)
- Use `SMALLINT` (2 bytes) for limited-range integers like ratings or status codes

#### Text Types
- `VARCHAR(n)` for variable-length strings with a reasonable maximum length
- `TEXT` for longer strings with no practical limit
- `CHAR(1)` for single-character codes (like gender)
- `CITEXT` (case-insensitive text) for email addresses and usernames

#### Date and Time Types
- `TIMESTAMP WITH TIME ZONE` for created_at/updated_at fields to handle timezone issues
- `DATE` for date-only values (without time component)

#### Boolean Type
- `BOOLEAN` for true/false flags

#### Numeric Types
- `DECIMAL(10,2)` for currency amounts (supports exactly 8 digits before decimal, 2 after)
- `NUMERIC(10,2)` for kilometers and other precise measurements

#### UUID Type
- Native `UUID` type for universally unique identifiers

### Indexing Strategy

#### Primary Key Indexes
- All tables have BIGSERIAL or SERIAL primary keys which are automatically indexed

#### Foreign Key Indexes
- All foreign key columns should be indexed to improve join performance

#### Unique Indexes
- UUID fields for external references
- Email addresses
- Registration numbers
- Certificate numbers

#### Compound Indexes
- For frequently combined search criteria:
  - `(memb_user_id, memb_club_id)` on ClubMembership
  - `(exp_club_id, exp_date)` on Expense for club reports
  - `(exp_user_id, exp_date)` on Expense for user reports
  - `(exp_event_id, exp_status)` on Expense for event summary reports

#### Partial Indexes
- For queries that filter on specific statuses:
  - `exp_status = 'submitted'` for pending expenses review
  - `exp_is_donation = true` for donation reports

#### Search Optimization
- Consider GIN indexes for JSONB columns in AuditLog
- Consider adding a trigram index for text search on names and descriptions

### Table Partitioning

#### Expense Table
- Partition by `exp_club_id` to isolate club data
- Alternatively, partition by date range (e.g., by fiscal year) for historical data

#### AuditLog Table
- Partition by `alog_created_at` date ranges for efficient archiving
- Improves performance for large audit trails

### Materialized Views

#### Club Expense Summaries
```sql
CREATE MATERIALIZED VIEW club_expense_summary AS
SELECT 
    exp_club_id,
    DATE_TRUNC('month', exp_date) AS month,
    SUM(exp_amount) AS total_amount,
    COUNT(*) AS expense_count
FROM expense
GROUP BY exp_club_id, DATE_TRUNC('month', exp_date);
```

#### Member Donation Summaries
```sql
CREATE MATERIALIZED VIEW member_donation_summary AS
SELECT 
    exp_user_id,
    exp_club_id,
    EXTRACT(YEAR FROM exp_date) AS fiscal_year,
    SUM(exp_amount) AS donation_amount,
    COUNT(*) AS donation_count
FROM expense
WHERE exp_is_donation = true
GROUP BY exp_user_id, exp_club_id, EXTRACT(YEAR FROM exp_date);
```

### Constraint Definitions

#### Check Constraints
```sql
-- Ensure positive expense amounts
ALTER TABLE expense ADD CONSTRAINT positive_amount CHECK (exp_amount > 0);

-- Ensure event end date is after start date
ALTER TABLE event ADD CONSTRAINT valid_event_dates CHECK (evt_end_date > evt_start_date);

-- Ensure expense date is not in the future
ALTER TABLE expense ADD CONSTRAINT valid_expense_date CHECK (exp_date <= CURRENT_DATE);

-- Ensure mileage is positive for mileage expenses
ALTER TABLE expense ADD CONSTRAINT valid_mileage 
    CHECK (exp_category_id != (SELECT ecat_id FROM expense_category WHERE ecat_name = 'mileage') OR exp_kilometers > 0);
```

#### Foreign Key Constraints
```sql
-- Example for ClubMembership table
ALTER TABLE club_membership 
    ADD CONSTRAINT fk_memb_user 
    FOREIGN KEY (memb_user_id) 
    REFERENCES user(user_id) 
    ON DELETE RESTRICT;

ALTER TABLE club_membership 
    ADD CONSTRAINT fk_memb_club 
    FOREIGN KEY (memb_club_id) 
    REFERENCES club(club_id) 
    ON DELETE CASCADE;
```

### Row-Level Security Policies

Since we're using Supabase, we can leverage PostgreSQL's Row-Level Security (RLS) to enforce data isolation:

```sql
-- Enable RLS on expense table
ALTER TABLE expense ENABLE ROW LEVEL SECURITY;

-- Policy for club managers to see all expenses in their club
CREATE POLICY club_manager_expense_policy ON expense
    USING (
        exp_club_id IN (
            SELECT memb_club_id 
            FROM club_membership 
            WHERE memb_user_id = current_user_id() 
            AND memb_is_manager = true
        )
    );

-- Policy for members to see only their own expenses
CREATE POLICY member_expense_policy ON expense
    USING (exp_user_id = current_user_id());

-- Policy for platform admins to see all expenses
CREATE POLICY admin_expense_policy ON expense
    USING (
        current_user_has_role('platform_admin')
    );
```

### Database Functions

#### Fiscal Year Calculation
```sql
CREATE OR REPLACE FUNCTION get_fiscal_year(expense_date DATE) 
RETURNS INTEGER AS $$
BEGIN
    -- In France, fiscal year is the calendar year
    RETURN EXTRACT(YEAR FROM expense_date);
END;
$$ LANGUAGE plpgsql;
```

#### Club Manager Check
```sql
CREATE OR REPLACE FUNCTION is_club_manager(user_id BIGINT, club_id BIGINT) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM club_membership 
        WHERE memb_user_id = user_id 
        AND memb_club_id = club_id 
        AND memb_is_manager = true
    );
END;
$$ LANGUAGE plpgsql;
```

#### Expense Validation
```sql
CREATE OR REPLACE FUNCTION validate_expense() 
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user is a member of the club
    IF NOT EXISTS (
        SELECT 1 
        FROM club_membership 
        WHERE memb_user_id = NEW.exp_user_id 
        AND memb_club_id = NEW.exp_club_id
    ) THEN
        RAISE EXCEPTION 'User is not a member of this club';
    END IF;
    
    -- Check if event belongs to the club
    IF NOT EXISTS (
        SELECT 1 
        FROM event 
        WHERE evt_id = NEW.exp_event_id 
        AND evt_club_id = NEW.exp_club_id
    ) THEN
        RAISE EXCEPTION 'Event does not belong to this club';
    END IF;
    
    -- Check if expense deadline has passed
    IF EXISTS (
        SELECT 1 
        FROM event 
        WHERE evt_id = NEW.exp_event_id 
        AND evt_expense_deadline < CURRENT_TIMESTAMP
    ) THEN
        RAISE EXCEPTION 'Expense deadline has passed for this event';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_validation_trigger
BEFORE INSERT OR UPDATE ON expense
FOR EACH ROW EXECUTE FUNCTION validate_expense();
```

### Performance Optimization for Supabase

1. **Connection Pooling**:
   - Configure appropriate connection pool sizes in Supabase settings

2. **Prepared Statements**:
   - Use parameterized queries in the application code

3. **Supabase Storage Integration**:
   - For file evidence storage, utilize direct links to Supabase Storage
   - Store only file references in the database, not the files themselves

4. **RLS Policies**:
   - Optimize RLS policies to avoid excessive checks
   - Use simple conditions for better performance

5. **PostgREST Optimization**:
   - Structure the schema to work well with PostgREST's automatic API generation
   - Consider using views for complex queries that will be exposed via API

### Backup and Disaster Recovery

1. **Point-in-Time Recovery**:
   - Enable WAL (Write-Ahead Logging) archiving
   - Configure regular snapshots

2. **Retention Policy**:
   - Implement a backup retention policy that meets the 5+ year requirement for fiscal data

3. **Regular Testing**:
   - Schedule regular restoration tests to verify backup integrity

## Summary

This database schema design provides a comprehensive foundation for the Club Expense Tracking System. It supports the core functionality of tracking expenses, managing club memberships, generating fiscal documentation, and ensuring data isolation between clubs.

Key features of the design include:
- Intuitive entity relationships that model the business domain
- Clear naming conventions with entity-specific prefixes
- Efficient indexing strategy for common query patterns
- Row-level security for multi-tenancy data isolation
- Performance optimizations for reporting and analytics
- Integration with Supabase for both database and file storage

The schema balances normalization principles with practical performance considerations, resulting in a design that is both maintainable and efficient.

````

---
File name: documentation/01. Global Functional Analysis/02. System Architecture.md
Last modification: 2025-02-25 11:12:00
---

````md
# Club Expense Tracking System - Architecture Summary

## Overview

This document outlines the high-level system architecture for the Club Expense Tracking System, designed to help clubs track member expenses, generate fiscal documentation for donations, and manage events. The architecture balances functionality with practical implementation considerations.

## System Purpose

The system allows:
- Tracking travel-related expenses (kilometers, tolls, gasoline) for club events
- Generating expense summaries per member and per event
- Producing yearly expense summaries with options to convert expenses to donations
- Generating appropriate fiscal declarations for tax purposes

## Architecture Diagram

```mermaid
flowchart TD
    subgraph "Client Layer"
        A1[Web Application] 
        A2[Mobile Apps - iOS/Android]
    end

    subgraph "Backend Layer"
        B[API Server]
        C[Authentication]
    end

    subgraph "Data Layer"
        D1[(Primary Database)]
        D2[(File Storage)]
    end

    subgraph "External Services"
        E1[Mapping Service]
        E2[Payment Gateway]
        E3[Email Service]
    end

    %% Connections
    A1 & A2 --> B
    B --- C
    B --> D1 & D2
    B --> E1 & E2 & E3
```

## System Components

### 1. Client Layer

#### Web Application
- **Technology**: Svelte with SvelteKit
- **Features**:
  - Responsive design for desktop and mobile browsers
  - Complete functionality for all user roles
  - Primary interface for club managers and administrators
  - Data visualization for expense reports and analytics
  - Document generation and export
  
#### Mobile Applications
- **Technology**: Svelte with Capacitor
- **Platforms**: iOS and Android
- **Features**:
  - Focused on club member expense entry
  - Camera integration for receipt capture
  - Odometer reading documentation
  - Real-time synchronization with backend
  - Push notifications for events and deadlines

### 2. Backend Layer

#### API Server
- **Technology**: Python with FastAPI
- **Architecture**: Monolithic with internal modularization
- **Core Modules**:
  - Club and member management
  - Event creation and management
  - Expense tracking and validation
  - Fiscal document generation
  - Reporting and analytics
  - Notification handling
  
#### Authentication
- **Technology**: Built-in authentication system with JWT tokens
- **Methods**:
  - Username/password
  - Google OAuth
- **Features**:
  - Role-based access control (Platform Admin, Club Manager, Club Member)
  - Invitation-only registration for club members
  - Session management
  - Password reset functionality

### 3. Data Layer

#### Primary Database
- **Technology**: PostgreSQL hosted on Supabase
- **Schema Highlights**:
  - Users and roles
  - Clubs and memberships
  - Events and deadlines
  - Expense categories and entries
  - Vehicles and mileage rates
  - Donation tracking
  - Audit logs
  - System settings

#### File Storage
- **Technology**: Supabase Storage
- **Content**:
  - Receipt images
  - Generated fiscal documents (PDFs)
  - Export files (CSV)
  - User profile pictures
  - System backups

### 4. External Services

#### Mapping Service
- **Purpose**: Distance calculation and validation for mileage expenses
- **Implementation**: Integration with mapping APIs (Google Maps, OpenStreetMap)

#### Payment Gateway
- **Purpose**: Processing subscription payments for premium features
- **Implementation**: Stripe integration

#### Email Service
- **Purpose**: Sending notifications and documents
- **Implementation**: SMTP server or third-party email service

## User Roles and Access Control

### Platform Administrator
- System-wide configuration
- Club management
- User management
- Analytics dashboard
- Support functions

### Club Manager
- Club configuration
- Member invitation and management
- Event creation and management
- Expense approval
- Report generation
- Fiscal documentation

### Club Member
- Personal profile management
- Expense submission
- Personal dashboard
- Document download

## Security Considerations

- **Authentication**: Secure login with password hashing and OAuth
- **Authorization**: Role-based access control for all API endpoints
- **Data Protection**: TLS for all communications
- **Privacy**: GDPR compliance for handling personal data
- **Audit Trail**: Logging of all expense-related activities
- **Backup**: Regular database backups with 5-year retention

## Scalability and Performance

- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Cache frequently accessed data
- **Horizontal Scaling**: Ability to add API servers as load increases
- **Vertical Scaling**: Database server resources can be increased
- **CDN Integration**: For static assets and files

## Development and Deployment

### Development Workflow
1. Database schema design
2. Core API development
3. Web interface implementation
4. Mobile app development
5. Integration with external services
6. Testing and quality assurance

### Deployment Options
- Containerized deployment with Docker
- Cloud hosting (AWS, GCP, Azure)
- VPS or dedicated server hosting
- CI/CD pipeline for automated deployment

## Future Considerations

- **Multi-currency Support**: Expansion beyond Euro for international clubs
- **Advanced Analytics**: More sophisticated reporting and visualizations
- **Approval Workflows**: Multi-level approval for expenses
- **Accounting Software Integration**: Export data to popular accounting systems
- **Offline Mode**: Support for offline expense entry in mobile apps

## Conclusion

This architecture provides a pragmatic approach to implementing the Club Expense Tracking System. It balances functionality with development efficiency, while allowing for future growth and enhancement. The use of Svelte for the frontend offers performance advantages and development speed, while the PostgreSQL database provides a solid foundation for data management and reporting.

````

---
File name: documentation/02. API_Design/01. api_endpoints.md
Last modification: 2025-02-27 16:06:37
---

````md
# AssoTrack API Design

## Base URL
- Production: `https://api.assotrack.com/v1`
- Development: `https://dev-api.assotrack.com/v1`

## Authentication
All API endpoints use JWT token authentication. Tokens are provided in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Authentication endpoints that don't require an existing token:
- `/auth/login`
- `/auth/register` (invitation only)
- `/auth/oauth/google`
- `/auth/refresh-token`
- `/auth/forgot-password`
- `/auth/reset-password`

## API Endpoints by Resource

### Authentication
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/auth/login` | POST | Authenticate user credentials | Any |
| `/auth/register` | POST | Register new user (requires invitation) | Any |
| `/auth/oauth/google` | POST | Authenticate with Google OAuth | Any |
| `/auth/refresh-token` | POST | Refresh JWT token | Any |
| `/auth/forgot-password` | POST | Request password reset | Any |
| `/auth/reset-password` | POST | Reset password with token | Any |
| `/auth/logout` | POST | Invalidate token | Any |

### Users
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/users/me` | GET | Get current user profile | Any |
| `/users/me` | PATCH | Update current user profile | Any |
| `/users` | GET | List users (with filters) | Admin |
| `/users/{user_id}` | GET | Get user details | Admin, ClubManager (for members) |
| `/users/{user_id}` | PATCH | Update user details | Admin |
| `/users/{user_id}` | DELETE | Mark user as inactive | Admin |
| `/users/me/vehicles` | GET | List user's vehicles | Member, Manager, Admin |
| `/users/me/vehicles` | POST | Add new vehicle | Member, Manager, Admin |
| `/users/me/vehicles/{vehicle_id}` | GET | Get vehicle details | Member, Manager, Admin |
| `/users/me/vehicles/{vehicle_id}` | PATCH | Update vehicle | Member, Manager, Admin |
| `/users/me/vehicles/{vehicle_id}` | DELETE | Delete vehicle | Member, Manager, Admin |

### Clubs
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/clubs` | GET | List clubs (with filters) | Admin |
| `/clubs` | POST | Create new club | Admin |
| `/clubs/{club_id}` | GET | Get club details | Admin, ClubManager, Member (own club) |
| `/clubs/{club_id}` | PATCH | Update club | Admin, ClubManager |
| `/clubs/{club_id}` | DELETE | Deactivate club | Admin |
| `/clubs/{club_id}/members` | GET | List club members | Admin, ClubManager |
| `/clubs/{club_id}/members` | POST | Add member to club | Admin, ClubManager |
| `/clubs/{club_id}/members/{user_id}` | GET | Get member details | Admin, ClubManager |
| `/clubs/{club_id}/members/{user_id}` | PATCH | Update member role | Admin, ClubManager |
| `/clubs/{club_id}/members/{user_id}` | DELETE | Remove member from club | Admin, ClubManager |
| `/clubs/{club_id}/invitations` | GET | List pending invitations | Admin, ClubManager |
| `/clubs/{club_id}/invitations` | POST | Send invitation | Admin, ClubManager |
| `/clubs/{club_id}/invitations/{invitation_id}` | DELETE | Cancel invitation | Admin, ClubManager |
| `/clubs/{club_id}/subscription` | GET | Get subscription details | Admin, ClubManager |
| `/clubs/{club_id}/subscription` | POST | Create/update subscription | Admin, ClubManager |

### Events
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/clubs/{club_id}/events` | GET | List club events | Admin, ClubManager, Member |
| `/clubs/{club_id}/events` | POST | Create new event | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}` | GET | Get event details | Admin, ClubManager, Member |
| `/clubs/{club_id}/events/{event_id}` | PATCH | Update event | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}` | DELETE | Cancel event | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}/participants` | GET | List event participants | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}/participants` | POST | Add participant | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}/participants/{user_id}` | DELETE | Remove participant | Admin, ClubManager |

### Expenses
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/expenses` | GET | List all expenses (admin only) | Admin |
| `/clubs/{club_id}/expenses` | GET | List club expenses | Admin, ClubManager |
| `/clubs/{club_id}/events/{event_id}/expenses` | GET | List event expenses | Admin, ClubManager |
| `/users/me/expenses` | GET | List own expenses | Member, Manager, Admin |
| `/users/me/expenses` | POST | Submit new expense | Member, Manager, Admin |
| `/users/me/expenses/{expense_id}` | GET | Get expense details | Member (own), Manager, Admin |
| `/users/me/expenses/{expense_id}` | PATCH | Update expense | Member (own, if not validated) |
| `/users/me/expenses/{expense_id}` | DELETE | Delete expense | Member (own, if not validated) |
| `/clubs/{club_id}/expenses/{expense_id}` | GET | Get expense details | ClubManager, Admin |
| `/clubs/{club_id}/expenses/{expense_id}/validate` | POST | Validate/reject expense | ClubManager, Admin |
| `/expenses/{expense_id}/evidence` | POST | Upload evidence | Member (own), Manager, Admin |
| `/expenses/{expense_id}/evidence/{evidence_id}` | GET | Get evidence | Member (own), Manager, Admin |
| `/expenses/{expense_id}/evidence/{evidence_id}` | DELETE | Delete evidence | Member (own, if not validated), Manager, Admin |

### Fiscal Documents
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/clubs/{club_id}/fiscal-documents` | GET | List club fiscal documents | Admin, ClubManager |
| `/clubs/{club_id}/fiscal-documents` | POST | Generate club fiscal documents | Admin, ClubManager |
| `/clubs/{club_id}/fiscal-documents/{document_id}` | GET | Get document details | Admin, ClubManager |
| `/clubs/{club_id}/fiscal-documents/{document_id}/download` | GET | Download document | Admin, ClubManager |
| `/users/me/fiscal-documents` | GET | List own fiscal documents | Member, Manager, Admin |
| `/users/me/fiscal-documents/{document_id}` | GET | Get document details | Member (own), Manager, Admin |
| `/users/me/fiscal-documents/{document_id}/download` | GET | Download document | Member (own), Manager, Admin |

### Donations
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/clubs/{club_id}/donations` | GET | List club donations | Admin, ClubManager |
| `/clubs/{club_id}/donations/summary` | GET | Get donation summary | Admin, ClubManager |
| `/users/me/donations` | GET | List own donations | Member, Manager, Admin |
| `/users/me/donations/summary` | GET | Get own donation summary | Member, Manager, Admin |

### Reports
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/clubs/{club_id}/reports/expenses` | GET | Generate expense report | Admin, ClubManager |
| `/clubs/{club_id}/reports/donations` | GET | Generate donation report | Admin, ClubManager |
| `/clubs/{club_id}/reports/members` | GET | Generate member activity report | Admin, ClubManager |
| `/clubs/{club_id}/reports/events` | GET | Generate events report | Admin, ClubManager |

### System Settings (Admin Only)
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/admin/fiscal-parameters` | GET | List fiscal parameters | Admin |
| `/admin/fiscal-parameters` | POST | Create fiscal parameter | Admin |
| `/admin/fiscal-parameters/{year}` | GET | Get fiscal parameter | Admin |
| `/admin/fiscal-parameters/{year}` | PATCH | Update fiscal parameter | Admin |
| `/admin/system-config` | GET | Get system configuration | Admin |
| `/admin/system-config` | PATCH | Update system configuration | Admin |
| `/admin/audit-logs` | GET | View audit logs | Admin |

### Notifications
| Endpoint | Method | Description | Roles |
|----------|--------|-------------|-------|
| `/users/me/notifications` | GET | Get user notifications | Any |
| `/users/me/notifications/{notification_id}` | PATCH | Mark notification as read | Any |
| `/users/me/notifications/settings` | GET | Get notification settings | Any |
| `/users/me/notifications/settings` | PATCH | Update notification settings | Any |

## Rate Limiting
- Standard tier: 60 requests per minute
- Premium tier: 120 requests per minute
- Admin: 180 requests per minute

## Error Responses
All error responses follow the format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error information (optional)
    }
  }
}
```

Common error codes:
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Unexpected server error
````

---
File name: documentation/02. API_Design/04. security_controls.md
Last modification: 2025-02-27 16:27:27
---

````md
# Security Controls and Rate Limiting

This document outlines the security controls and rate limiting strategies for the AssoTrack API.

## Authentication Security

### JWT Token Configuration
- **Token Lifetime**: Access tokens expire after 1 hour
- **Refresh Token Lifetime**: Refresh tokens expire after 7 days
- **Token Signing Algorithm**: RS256 (asymmetric signatures)
- **Token Payload**: Contains user ID, role, permissions, and expiration time
- **Token Storage**: 
  - Client-side: HTTPOnly cookies with Secure flag (web application)
  - Mobile: Secure storage mechanisms (Keychain for iOS, EncryptedSharedPreferences for Android)

### Password Policy
- Minimum length: 10 characters
- Must contain at least one uppercase letter, one lowercase letter, one number, and one special character
- Passwords are hashed using bcrypt with appropriate work factor
- Password history check: Cannot reuse last 5 passwords
- Account lockout after 5 failed attempts (unlocks after 15 minutes)

### OAuth 2.0 Integration
- Google OAuth integration with proper configuration
- State parameter to prevent CSRF attacks
- Limited requested scopes (email, profile)
- Proper validation of OAuth tokens

## API Security Controls

### Transport Layer Security
- TLS 1.2+ required for all API communications
- Strong cipher suites enforced
- HTTP Strict Transport Security (HSTS) enabled
- Certificate pinning for mobile applications

### Input Validation
- All inputs validated for:
  - Type correctness
  - Length constraints
  - Format constraints (regex where appropriate)
  - Content validation (e.g., file uploads)
- Parameterized queries for all database operations
- API schema validation using Pydantic models

### Output Encoding
- Proper content-type headers
- Character encoding specified (UTF-8)
- HTML/JS encoding for any user-generated content

### Cross-Origin Resource Sharing (CORS)
- Restrictive CORS policy:
  - Allowed origins: Only the official web application domain
  - Allowed methods: GET, POST, PUT, PATCH, DELETE
  - Allowed headers: Authorization, Content-Type
  - Credentials: true
  - Max age: 3600 seconds

### Security Headers
- Content-Security-Policy: Restrictive policy to prevent XSS
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Feature-Policy: Restrictive to limit browser features

## Rate Limiting

### General Rate Limiting Strategy
Rate limits are applied based on the following factors:
- User role
- Endpoint sensitivity
- IP address
- Authentication status

### Rate Limit Tiers
| Tier | Requests per Minute | User Type |
|------|---------------------|-----------|
| Anonymous | 30 | Unauthenticated requests |
| Standard | 60 | Authenticated club members |
| Premium | 120 | Clubs with premium subscription |
| Admin | 180 | Platform administrators |

### Endpoint-Specific Rate Limits
| Endpoint Category | Anonymous | Standard | Premium | Admin |
|-------------------|-----------|----------|---------|-------|
| Authentication | 10/min | 10/min | 10/min | 10/min |
| Read Operations | 30/min | 60/min | 120/min | 180/min |
| Write Operations | 15/min | 30/min | 60/min | 90/min |
| Report Generation | 5/min | 10/min | 20/min | 30/min |

### Rate Limit Headers
The API returns the following headers to help clients manage rate limits:
- `X-RateLimit-Limit`: Total requests allowed in the current window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit window resets

### Rate Limit Enforcement
- Rate limits are enforced using a token bucket algorithm
- Redis is used as the backend for tracking rate limit counters
- Rate limit information is logged for monitoring abuse patterns

### Rate Limit Response
When a rate limit is exceeded, the API returns:
- HTTP Status: 429 Too Many Requests
- JSON body with error details and retry-after information
- `Retry-After` header indicating when the client can retry

## Data Protection

### Sensitive Data Handling
- Personal data is encrypted at rest using AES-256
- Database-level encryption for sensitive fields (PII)
- Masked data in logs (emails, addresses, etc.)
- Minimize data exposure in API responses (principle of least privilege)

### File Upload Controls
- Strict file type validation (MIME type checking)
- File size limits (max 10MB for receipts/evidence)
- Content scanning for malware
- Secure storage with access controls
- No executable file uploads permitted

### Backup and Recovery
- Regular database backups (daily)
- End-to-end encryption for backups
- Defined retention periods in line with data protection regulations
- Tested recovery procedures

## Security Monitoring

### Logging
- Comprehensive logging of security events:
  - Authentication attempts (successful and failed)
  - Authorization decisions
  - Data access and modifications
  - Rate limit violations
  - API errors
- Log format follows structured logging practices
- Logs are centralized and protected from tampering

### Alerting
- Automated alerts for:
  - Multiple failed login attempts
  - Unusual access patterns
  - Rate limit abuse
  - Authorization violations
  - Database connection issues
  - API errors above threshold

### Audit Trail
- Complete audit trail for all data modifications
- Audit logs include:
  - User ID
  - Action timestamp
  - IP address
  - Action performed
  - Resource affected
  - Before/after values
- Immutable audit trail storage

## Incident Response

### Security Incident Procedure
1. Detection and analysis
2. Containment
3. Eradication
4. Recovery
5. Post-incident analysis
6. Reporting (if required)

### Account Lockout and Recovery
- Automated account lockout after suspicious activity
- Secure account recovery workflow
- Multi-factor verification for critical account changes

## Compliance

### GDPR Compliance
- Data minimization principles applied
- Privacy by design in all features
- Data subject rights support
- Data processing records maintained
- Data protection impact assessments for high-risk processing

### French Fiscal Regulations
- Compliance with specific tax authority requirements
- Data retention aligned with fiscal obligations
- Secure storage of fiscal documents
- Proper calculation of donation values and tax benefits

## Security Testing

### Regular Testing
- Automated security scanning in CI/CD pipeline
- Regular penetration testing (yearly)
- Vulnerability assessments (quarterly)
- Dependency scanning for known vulnerabilities
- Security code reviews

### Responsible Disclosure
- Defined responsible disclosure policy
- Process for security researchers to report vulnerabilities
- Bug bounty program consideration
````

---
File name: documentation/02. API_Design/02. request_response_formats.md
Last modification: 2025-02-27 16:14:05
---

````md
# Request and Response Formats

This document defines the standard request and response formats for the AssoTrack API. All examples are in JSON format.

## Authentication

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "member"
  }
}
```

### POST /auth/register
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Smith",
  "invitation_token": "inv_token_123456",
  "address": {
    "street": "123 Main St",
    "city": "Paris",
    "postal_code": "75001",
    "country": "France"
  },
  "gender": "female",
  "birth_date": "1990-01-15"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "user456",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## User Management

### GET /users/me
**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "birth_date": "1985-03-20",
  "address": {
    "street": "123 Main St",
    "city": "Paris",
    "postal_code": "75001",
    "country": "France"
  },
  "club_memberships": [
    {
      "club_id": "club789",
      "club_name": "Paris Running Club",
      "role": "member",
      "joined_at": "2023-01-15T10:30:00Z"
    }
  ],
  "vehicles": [
    {
      "id": "vehicle567",
      "name": "Personal Car",
      "type": "car",
      "fiscal_power": 5,
      "registration_number": "AB-123-CD"
    }
  ],
  "created_at": "2023-01-10T08:15:30Z",
  "updated_at": "2023-02-05T14:22:45Z"
}
```

### PATCH /users/me
**Request:**
```json
{
  "first_name": "Johnny",
  "address": {
    "street": "456 New Street",
    "city": "Paris",
    "postal_code": "75002",
    "country": "France"
  }
}
```

**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "first_name": "Johnny",
  "last_name": "Doe",
  "address": {
    "street": "456 New Street",
    "city": "Paris",
    "postal_code": "75002",
    "country": "France"
  },
  "updated_at": "2023-03-10T09:45:12Z"
}
```

## Vehicles

### POST /users/me/vehicles
**Request:**
```json
{
  "name": "Work Car",
  "type": "car",
  "fiscal_power": 7,
  "registration_number": "EF-789-GH"
}
```

**Response:**
```json
{
  "id": "vehicle890",
  "name": "Work Car",
  "type": "car",
  "fiscal_power": 7,
  "registration_number": "EF-789-GH",
  "created_at": "2023-03-15T11:30:00Z",
  "updated_at": "2023-03-15T11:30:00Z"
}
```

## Clubs

### GET /clubs/{club_id}
**Response:**
```json
{
  "id": "club789",
  "name": "Paris Running Club",
  "description": "Running club for Paris enthusiasts",
  "address": {
    "street": "789 Sports Avenue",
    "city": "Paris",
    "postal_code": "75008",
    "country": "France"
  },
  "email": "contact@parisrunning.org",
  "phone": "+33123456789",
  "subscription_status": "premium",
  "subscription_expiry": "2023-12-31T23:59:59Z",
  "member_count": 42,
  "created_at": "2022-01-01T00:00:00Z",
  "updated_at": "2023-02-15T14:30:22Z"
}
```

### POST /clubs
**Request (Admin only):**
```json
{
  "name": "Lyon Cycling Club",
  "description": "Cycling club for Lyon enthusiasts",
  "address": {
    "street": "123 Cycle Street",
    "city": "Lyon",
    "postal_code": "69001",
    "country": "France"
  },
  "email": "contact@lyoncycling.org",
  "phone": "+33987654321"
}
```

**Response:**
```json
{
  "id": "club456",
  "name": "Lyon Cycling Club",
  "description": "Cycling club for Lyon enthusiasts",
  "address": {
    "street": "123 Cycle Street",
    "city": "Lyon",
    "postal_code": "69001",
    "country": "France"
  },
  "email": "contact@lyoncycling.org",
  "phone": "+33987654321",
  "subscription_status": "free",
  "member_count": 0,
  "created_at": "2023-03-20T10:15:30Z",
  "updated_at": "2023-03-20T10:15:30Z"
}
```

## Events

### POST /clubs/{club_id}/events
**Request:**
```json
{
  "name": "Annual Marathon",
  "description": "Our annual marathon event",
  "start_date": "2023-06-15T08:00:00Z",
  "end_date": "2023-06-15T18:00:00Z",
  "location": {
    "name": "City Park",
    "address": "Park Avenue, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "expense_deadline": "2023-06-30T23:59:59Z",
  "max_participants": 100
}
```

**Response:**
```json
{
  "id": "event123",
  "club_id": "club789",
  "name": "Annual Marathon",
  "description": "Our annual marathon event",
  "start_date": "2023-06-15T08:00:00Z",
  "end_date": "2023-06-15T18:00:00Z",
  "location": {
    "name": "City Park",
    "address": "Park Avenue, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "expense_deadline": "2023-06-30T23:59:59Z",
  "max_participants": 100,
  "participant_count": 0,
  "status": "upcoming",
  "created_at": "2023-03-20T11:30:00Z",
  "updated_at": "2023-03-20T11:30:00Z"
}
```

### GET /clubs/{club_id}/events
**Response:**
```json
{
  "total": 2,
  "page": 1,
  "per_page": 10,
  "events": [
    {
      "id": "event123",
      "name": "Annual Marathon",
      "start_date": "2023-06-15T08:00:00Z",
      "end_date": "2023-06-15T18:00:00Z",
      "location": {
        "name": "City Park",
        "address": "Park Avenue, Paris"
      },
      "expense_deadline": "2023-06-30T23:59:59Z",
      "participant_count": 42,
      "status": "upcoming"
    },
    {
      "id": "event456",
      "name": "Weekly Training",
      "start_date": "2023-03-25T17:00:00Z",
      "end_date": "2023-03-25T19:00:00Z",
      "location": {
        "name": "Training Center",
        "address": "Sports Street, Paris"
      },
      "expense_deadline": "2023-04-10T23:59:59Z",
      "participant_count": 15,
      "status": "upcoming"
    }
  ]
}
```

## Expenses

### POST /users/me/expenses
**Request:**
```json
{
  "event_id": "event123",
  "category": "mileage",
  "amount": 120.5,
  "date": "2023-06-15T10:30:00Z",
  "description": "Travel to and from the marathon",
  "vehicle_id": "vehicle567",
  "distance_km": 150,
  "start_location": {
    "name": "Home",
    "address": "456 New Street, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "end_location": {
    "name": "City Park",
    "address": "Park Avenue, Paris",
    "latitude": 48.8600,
    "longitude": 2.3700
  }
}
```

**Response:**
```json
{
  "id": "expense789",
  "event_id": "event123",
  "event_name": "Annual Marathon",
  "user_id": "user123",
  "category": "mileage",
  "amount": 120.5,
  "date": "2023-06-15T10:30:00Z",
  "description": "Travel to and from the marathon",
  "vehicle_id": "vehicle567",
  "vehicle_name": "Personal Car",
  "distance_km": 150,
  "fiscal_power": 5,
  "reimbursement_rate": 0.803,
  "start_location": {
    "name": "Home",
    "address": "456 New Street, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "end_location": {
    "name": "City Park",
    "address": "Park Avenue, Paris",
    "latitude": 48.8600,
    "longitude": 2.3700
  },
  "status": "pending",
  "created_at": "2023-06-15T20:45:12Z",
  "updated_at": "2023-06-15T20:45:12Z"
}
```

### GET /users/me/expenses
**Response:**
```json
{
  "total": 2,
  "page": 1,
  "per_page": 10,
  "expenses": [
    {
      "id": "expense789",
      "event_id": "event123",
      "event_name": "Annual Marathon",
      "category": "mileage",
      "amount": 120.5,
      "date": "2023-06-15T10:30:00Z",
      "status": "pending",
      "created_at": "2023-06-15T20:45:12Z"
    },
    {
      "id": "expense101",
      "event_id": "event456",
      "event_name": "Weekly Training",
      "category": "toll",
      "amount": 15.20,
      "date": "2023-03-25T16:30:00Z",
      "status": "validated",
      "validated_at": "2023-03-26T09:15:00Z",
      "created_at": "2023-03-25T21:10:30Z"
    }
  ]
}
```

### POST /clubs/{club_id}/expenses/{expense_id}/validate
**Request:**
```json
{
  "status": "validated",
  "feedback": "Expense approved. Thank you for the clear documentation."
}
```

**Response:**
```json
{
  "id": "expense789",
  "status": "validated",
  "feedback": "Expense approved. Thank you for the clear documentation.",
  "validated_by": "manager456",
  "validated_at": "2023-06-16T10:20:30Z",
  "updated_at": "2023-06-16T10:20:30Z"
}
```

## Fiscal Documents

### POST /clubs/{club_id}/fiscal-documents
**Request:**
```json
{
  "year": 2023,
  "type": "donation_receipt",
  "format": "pdf"
}
```

**Response:**
```json
{
  "id": "document123",
  "club_id": "club789",
  "year": 2023,
  "type": "donation_receipt",
  "format": "pdf",
  "status": "processing",
  "file_url": null,
  "created_at": "2023-07-05T14:20:30Z",
  "updated_at": "2023-07-05T14:20:30Z"
}
```

### GET /clubs/{club_id}/fiscal-documents
**Response:**
```json
{
  "total": 2,
  "page": 1,
  "per_page": 10,
  "documents": [
    {
      "id": "document123",
      "year": 2023,
      "type": "donation_receipt",
      "format": "pdf",
      "status": "completed",
      "file_url": "https://api.assotrack.com/files/documents/document123.pdf",
      "created_at": "2023-07-05T14:20:30Z",
      "updated_at": "2023-07-05T14:25:45Z"
    },
    {
      "id": "document456",
      "year": 2022,
      "type": "annual_summary",
      "format": "pdf",
      "status": "completed",
      "file_url": "https://api.assotrack.com/files/documents/document456.pdf",
      "created_at": "2023-01-15T10:10:10Z",
      "updated_at": "2023-01-15T10:15:30Z"
    }
  ]
}
```

## Reports

### GET /clubs/{club_id}/reports/expenses
**Request Parameters:**
```
start_date=2023-01-01T00:00:00Z
end_date=2023-06-30T23:59:59Z
format=csv
status=validated
```

**Response:**
```json
{
  "id": "report789",
  "type": "expense_report",
  "parameters": {
    "start_date": "2023-01-01T00:00:00Z",
    "end_date": "2023-06-30T23:59:59Z",
    "format": "csv",
    "status": "validated"
  },
  "status": "completed",
  "file_url": "https://api.assotrack.com/files/reports/report789.csv",
  "created_at": "2023-07-01T09:30:00Z",
  "updated_at": "2023-07-01T09:31:15Z"
}
```

## Notifications

### GET /users/me/notifications
**Response:**
```json
{
  "total": 2,
  "unread": 1,
  "page": 1,
  "per_page": 10,
  "notifications": [
    {
      "id": "notif123",
      "type": "expense_validated",
      "title": "Expense Validated",
      "message": "Your expense 'Travel to Marathon' has been validated",
      "data": {
        "expense_id": "expense789",
        "event_id": "event123"
      },
      "read": false,
      "created_at": "2023-06-16T10:20:35Z"
    },
    {
      "id": "notif456",
      "type": "event_reminder",
      "title": "Upcoming Event",
      "message": "Reminder: Weekly Training is tomorrow at 5:00 PM",
      "data": {
        "event_id": "event456"
      },
      "read": true,
      "created_at": "2023-03-24T09:00:00Z",
      "read_at": "2023-03-24T09:05:22Z"
    }
  ]
}
```

## Admin Endpoints

### GET /admin/fiscal-parameters/{year}
**Response:**
```json
{
  "year": 2023,
  "mileage_rates": [
    {"fiscal_power": 3, "rate": 0.502},
    {"fiscal_power": 4, "rate": 0.575},
    {"fiscal_power": 5, "rate": 0.603},
    {"fiscal_power": 6, "rate": 0.631},
    {"fiscal_power": 7, "rate": 0.661}
  ],
  "max_donation_amount": 20000,
  "max_tax_reduction_percentage": 66,
  "min_donation_amount": 10,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```
````

---
File name: documentation/02. API_Design/03. authorization_rules.md
Last modification: 2025-02-27 16:23:59
---

````md
# Authorization Rules

This document defines the authorization rules for all API endpoints in the AssoTrack system. These rules determine what actions different user roles can perform.

## User Roles

1. **Platform Administrator** (`admin`)
   - Has complete access to all system functionalities
   - Can manage clubs, users, and system settings
   - Can view and modify all data

2. **Club Manager** (`manager`)
   - Can manage their own club's data
   - Can manage club members and events
   - Can validate expenses and generate reports
   - Cannot access data from other clubs

3. **Club Member** (`member`)
   - Can submit and view their own expenses
   - Can view their own fiscal documents
   - Can participate in club events
   - Cannot access other members' data

## Authorization Principles

1. **Role-Based Access Control**: Permissions are based on user roles
2. **Resource Ownership**: Users can only access resources they own or have been granted access to
3. **Club Membership**: Access to club resources is restricted to members of that club
4. **Hierarchical Access**: Higher-level roles inherit permissions from lower-level roles

## Endpoint Authorization Rules

### Authentication Endpoints
| Endpoint | Anonymous | Member | Manager | Admin | Notes |
|----------|-----------|--------|---------|-------|-------|
| `/auth/login` | ✅ | ✅ | ✅ | ✅ | |
| `/auth/register` | ✅ | ✅ | ✅ | ✅ | Requires invitation token |
| `/auth/oauth/google` | ✅ | ✅ | ✅ | ✅ | |
| `/auth/refresh-token` | ✅ | ✅ | ✅ | ✅ | |
| `/auth/forgot-password` | ✅ | ✅ | ✅ | ✅ | |
| `/auth/reset-password` | ✅ | ✅ | ✅ | ✅ | Requires reset token |
| `/auth/logout` | ❌ | ✅ | ✅ | ✅ | |

### User Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/users/me` (GET) | ✅ | ✅ | ✅ | |
| `/users/me` (PATCH) | ✅ | ✅ | ✅ | Cannot change role |
| `/users` (GET) | ❌ | ❌ | ✅ | |
| `/users/{user_id}` (GET) | ❌ | ✅ | ✅ | Manager: Only for club members |
| `/users/{user_id}` (PATCH) | ❌ | ❌ | ✅ | |
| `/users/{user_id}` (DELETE) | ❌ | ❌ | ✅ | |
| `/users/me/vehicles` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/vehicles` (POST) | ✅ | ✅ | ✅ | |
| `/users/me/vehicles/{vehicle_id}` (GET) | ✅ | ✅ | ✅ | Own vehicles only |
| `/users/me/vehicles/{vehicle_id}` (PATCH) | ✅ | ✅ | ✅ | Own vehicles only |
| `/users/me/vehicles/{vehicle_id}` (DELETE) | ✅ | ✅ | ✅ | Own vehicles only |

### Club Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/clubs` (GET) | ❌ | ❌ | ✅ | |
| `/clubs` (POST) | ❌ | ❌ | ✅ | |
| `/clubs/{club_id}` (GET) | ✅ | ✅ | ✅ | Member: Only own clubs |
| `/clubs/{club_id}` (PATCH) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}` (DELETE) | ❌ | ❌ | ✅ | |
| `/clubs/{club_id}/members` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/members` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/members/{user_id}` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/members/{user_id}` (PATCH) | ❌ | ✅ | ✅ | Manager: Cannot promote to admin |
| `/clubs/{club_id}/members/{user_id}` (DELETE) | ❌ | ✅ | ✅ | Manager: Cannot remove admins |
| `/clubs/{club_id}/invitations` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/invitations` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/invitations/{invitation_id}` (DELETE) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/subscription` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/subscription` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |

### Event Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/clubs/{club_id}/events` (GET) | ✅ | ✅ | ✅ | Member: Only own clubs |
| `/clubs/{club_id}/events` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}` (GET) | ✅ | ✅ | ✅ | Member: Only own clubs |
| `/clubs/{club_id}/events/{event_id}` (PATCH) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}` (DELETE) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}/participants` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}/participants` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}/participants/{user_id}` (DELETE) | ❌ | ✅ | ✅ | Manager: Only own club |

### Expense Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/expenses` (GET) | ❌ | ❌ | ✅ | |
| `/clubs/{club_id}/expenses` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/events/{event_id}/expenses` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/users/me/expenses` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/expenses` (POST) | ✅ | ✅ | ✅ | |
| `/users/me/expenses/{expense_id}` (GET) | ✅ | ✅ | ✅ | Member: Own expenses only |
| `/users/me/expenses/{expense_id}` (PATCH) | ✅ | ✅ | ✅ | Member: Own expenses only, if not validated |
| `/users/me/expenses/{expense_id}` (DELETE) | ✅ | ✅ | ✅ | Member: Own expenses only, if not validated |
| `/clubs/{club_id}/expenses/{expense_id}` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/expenses/{expense_id}/validate` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/expenses/{expense_id}/evidence` (POST) | ✅ | ✅ | ✅ | Member: Own expenses only |
| `/expenses/{expense_id}/evidence/{evidence_id}` (GET) | ✅ | ✅ | ✅ | Member: Own expenses only |
| `/expenses/{expense_id}/evidence/{evidence_id}` (DELETE) | ✅ | ✅ | ✅ | Member: Own expenses only, if not validated |

### Fiscal Document Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/clubs/{club_id}/fiscal-documents` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/fiscal-documents` (POST) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/fiscal-documents/{document_id}` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/fiscal-documents/{document_id}/download` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/users/me/fiscal-documents` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/fiscal-documents/{document_id}` (GET) | ✅ | ✅ | ✅ | Member: Own documents only |
| `/users/me/fiscal-documents/{document_id}/download` (GET) | ✅ | ✅ | ✅ | Member: Own documents only |

### Donation Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/clubs/{club_id}/donations` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/donations/summary` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/users/me/donations` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/donations/summary` (GET) | ✅ | ✅ | ✅ | |

### Report Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/clubs/{club_id}/reports/expenses` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/reports/donations` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/reports/members` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |
| `/clubs/{club_id}/reports/events` (GET) | ❌ | ✅ | ✅ | Manager: Only own club |

### Admin Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/admin/fiscal-parameters` (GET) | ❌ | ❌ | ✅ | |
| `/admin/fiscal-parameters` (POST) | ❌ | ❌ | ✅ | |
| `/admin/fiscal-parameters/{year}` (GET) | ❌ | ❌ | ✅ | |
| `/admin/fiscal-parameters/{year}` (PATCH) | ❌ | ❌ | ✅ | |
| `/admin/system-config` (GET) | ❌ | ❌ | ✅ | |
| `/admin/system-config` (PATCH) | ❌ | ❌ | ✅ | |
| `/admin/audit-logs` (GET) | ❌ | ❌ | ✅ | |

### Notification Endpoints
| Endpoint | Member | Manager | Admin | Notes |
|----------|--------|---------|-------|-------|
| `/users/me/notifications` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/notifications/{notification_id}` (PATCH) | ✅ | ✅ | ✅ | Own notifications only |
| `/users/me/notifications/settings` (GET) | ✅ | ✅ | ✅ | |
| `/users/me/notifications/settings` (PATCH) | ✅ | ✅ | ✅ | |

## Row-Level Security Policies

For enhanced security, the system implements row-level security in the database with the following policies:

1. **Club Data Isolation**
   - Club managers can only access data related to clubs they manage
   - Club members can only access data related to clubs they belong to

2. **User Data Protection**
   - Users can only access their own personal data
   - Managers can view basic information about their club members
   - Admins can access all user data

3. **Expense Visibility**
   - Members can only view their own expenses
   - Managers can view all expenses within their club
   - Admins can view all expenses in the system

4. **Document Access Control**
   - Members can only access documents generated for them
   - Managers can access all documents related to their club
   - Admins can access all documents in the system

## Audit Trail Requirements

All actions that modify data will be logged in the audit trail, including:
- User ID
- Action type
- Resource affected
- Timestamp
- IP address
- Changes made (before/after values)

The audit trail is accessible only to administrators through the `/admin/audit-logs` endpoint.
````


## Additional Files

> ⚠️ **IMPORTANT**: These files must be taken very seriously as they represent the latest up-to-date versions of our codebase. You MUST rely on these versions and their content imperatively.


### Project Structure

text
.
├── CLAUDE.md
├── LICENSE
├── conversation_log.txt
├── digest.txt
├── documentation
│   ├── 01. Global Functional Analysis
│   │   ├── 01. Project functional Summary.md
│   │   ├── 02. System Architecture.md
│   │   └── 03. Database Schema Design.md
│   └── 02. API_Design
│       ├── 01. api_endpoints.md
│       ├── 02. request_response_formats.md
│       ├── 03. authorization_rules.md
│       └── 04. security_controls.md
├── kb_scripts
│   ├── knowledge.sh
│   └── utcp.sh
├── knowledge_base
│   ├── knowledge 1.md
│   ├── knowledge.md
│   ├── knowledge.md.utcp
│   ├── knowledge.txt
│   └── knowledge_header.md
├── node_modules
│   ├── ansi-styles
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   ├── license
│   │   ├── package.json
│   │   └── readme.md
│   ├── chalk
│   │   ├── index.d.ts
│   │   ├── license
│   │   ├── package.json
│   │   ├── readme.md
│   │   └── source
│   │       ├── index.js
│   │       ├── templates.js
│   │       └── util.js
│   ├── color-convert
│   │   ├── CHANGELOG.md
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── conversions.js
│   │   ├── index.js
│   │   ├── package.json
│   │   └── route.js
│   ├── color-name
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── index.js
│   │   └── package.json
│   ├── commander
│   │   ├── LICENSE
│   │   ├── Readme.md
│   │   ├── esm.mjs
│   │   ├── index.js
│   │   ├── lib
│   │   │   ├── argument.js
│   │   │   ├── command.js
│   │   │   ├── error.js
│   │   │   ├── help.js
│   │   │   ├── option.js
│   │   │   └── suggestSimilar.js
│   │   ├── package-support.json
│   │   ├── package.json
│   │   └── typings
│   │       ├── esm.d.mts
│   │       └── index.d.ts
│   ├── crypto
│   │   ├── README.md
│   │   └── package.json
│   ├── has-flag
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   ├── license
│   │   ├── package.json
│   │   └── readme.md
│   ├── husky
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── husky.sh
│   │   ├── lib
│   │   │   ├── bin.d.ts
│   │   │   ├── bin.js
│   │   │   ├── index.d.ts
│   │   │   └── index.js
│   │   └── package.json
│   ├── supports-color
│   │   ├── browser.js
│   │   ├── index.js
│   │   ├── license
│   │   ├── package.json
│   │   └── readme.md
│   └── utcp
│       ├── README.md
│       ├── UTCP_instructions.md
│       ├── bin
│       │   └── utcp.js
│       ├── jest.config.js
│       ├── lib
│       │   ├── __tests__
│       │   │   ├── classic-text-test.d.ts
│       │   │   ├── classic-text-test.js
│       │   │   ├── large-file-test.d.ts
│       │   │   └── large-file-test.js
│       │   ├── compression.d.ts
│       │   ├── compression.js
│       │   ├── decompression.d.ts
│       │   ├── decompression.js
│       │   ├── index.d.ts
│       │   ├── index.js
│       │   ├── types.d.ts
│       │   ├── types.js
│       │   ├── utils.d.ts
│       │   └── utils.js
│       ├── package.json
│       ├── src
│       │   ├── __tests__
│       │   │   ├── classic-text.test.ts
│       │   │   ├── file-operations.test.ts
│       │   │   ├── large-file-test.ts
│       │   │   └── utcp.test.ts
│       │   ├── compression.ts
│       │   ├── decompression.ts
│       │   ├── index.ts
│       │   ├── types.ts
│       │   └── utils.ts
│       └── tsconfig.json
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
└── unshrinked_kb.md

26 directories, 108 files



2025-02-27 22:52:23