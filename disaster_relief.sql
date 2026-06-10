-- 1. DISASTER

CREATE TABLE DISASTER (
    DisasterID      VARCHAR2(10)   PRIMARY KEY,
    DisasterType    VARCHAR2(50)   NOT NULL,
    Severity        VARCHAR2(20)   NOT NULL CHECK (Severity IN ('Low','Medium','High','Critical')),
    StartDate       DATE           NOT NULL,
    Status          VARCHAR2(20)   NOT NULL CHECK (Status IN ('Active','Contained','Resolved'))
);

-- 2. ORGANIZATION 

CREATE TABLE ORGANIZATION (
    OrgID           VARCHAR2(10)   PRIMARY KEY,
    OrgName         VARCHAR2(100)  NOT NULL,
    OrgType         VARCHAR2(50)   NOT NULL,
    Phone           VARCHAR2(20),
    Email           VARCHAR2(100)
);

-- 3. SHELTER

CREATE TABLE SHELTER (
    ShelterID       VARCHAR2(10)   PRIMARY KEY,
    Status          VARCHAR2(20)   NOT NULL CHECK (Status IN ('Open','Full','Closed')),
    Capacity        NUMBER(6)      NOT NULL,
    CurrOccupancy   NUMBER(6)     DEFAULT 0 NOT NULL,
    Latitude        NUMBER(10,6),
    Longitude       NUMBER(10,6),
    City            VARCHAR2(100),
    District        VARCHAR2(100),
    CONSTRAINT chk_occupancy CHECK (CurrOccupancy <= Capacity)
);

-- 4. LOGISTICS HUB

CREATE TABLE LOGISTICS_HUB (
    HubID               VARCHAR2(10)   PRIMARY KEY,
    OperationalStatus   VARCHAR2(20)   NOT NULL CHECK (OperationalStatus IN ('Active','Inactive','Maintenance')),
    StorageCapacity     NUMBER(10)     NOT NULL,
    Latitude            NUMBER(10,6),
    Longitude           NUMBER(10,6)
);

-- 5. PERSON (Superclass)

CREATE TABLE PERSON (
    PersonID        VARCHAR2(10)   PRIMARY KEY,
    FullName        VARCHAR2(100)  NOT NULL,
    DOB             DATE,
    Gender          VARCHAR2(10)   CHECK (Gender IN ('Male','Female','Other')),
    ContactNumber   VARCHAR2(20),
    Street          VARCHAR2(100),
    City            VARCHAR2(100),
    District        VARCHAR2(100),
    PostalCode      VARCHAR2(20)
);

-- 6. VICTIM (Subclass of PERSON)

CREATE TABLE VICTIM (
    VictimID        VARCHAR2(10)   PRIMARY KEY,
    PersonID        VARCHAR2(10)   NOT NULL UNIQUE,
    InjuryStatus    VARCHAR2(50),
    RegDate         DATE           NOT NULL,
    CONSTRAINT fk_victim_person FOREIGN KEY (PersonID) REFERENCES PERSON(PersonID) ON DELETE CASCADE
);

-- Multivalued attribute for Victim's Need Types
CREATE TABLE VICTIM_NEEDS (
    VictimID        VARCHAR2(10)   NOT NULL,
    NeedType        VARCHAR2(50)   NOT NULL,
    CONSTRAINT pk_victim_needs PRIMARY KEY (VictimID, NeedType),
    CONSTRAINT fk_vneeds_victim FOREIGN KEY (VictimID) REFERENCES VICTIM(VictimID) ON DELETE CASCADE
);

-- 7. VOLUNTEER (Subclass of PERSON)

CREATE TABLE VOLUNTEER (
    VolunteerID     VARCHAR2(10)   PRIMARY KEY,
    PersonID        VARCHAR2(10)   NOT NULL UNIQUE,
    Availability    VARCHAR2(20)   CHECK (Availability IN ('Available','Unavailable','On Duty')),
    TrainingLevel   VARCHAR2(30),
    OrgID           VARCHAR2(10),
    CONSTRAINT fk_vol_person FOREIGN KEY (PersonID) REFERENCES PERSON(PersonID) ON DELETE CASCADE,
    CONSTRAINT fk_vol_org    FOREIGN KEY (OrgID)    REFERENCES ORGANIZATION(OrgID)
);

-- Multivalued attribute for Volunteer Skills

CREATE TABLE VOLUNTEER_SKILLS (
    VolunteerID     VARCHAR2(10)   NOT NULL,
    Skill           VARCHAR2(50)   NOT NULL,
    CONSTRAINT pk_vol_skills PRIMARY KEY (VolunteerID, Skill),
    CONSTRAINT fk_vskills_vol FOREIGN KEY (VolunteerID) REFERENCES VOLUNTEER(VolunteerID) ON DELETE CASCADE
);

-- 8. SUPPLY (Superclass)

CREATE TABLE SUPPLY (
    SupplyID        VARCHAR2(10)   PRIMARY KEY,
    SupplyName      VARCHAR2(100)  NOT NULL,
    Quantity        NUMBER(10)     NOT NULL CHECK (Quantity >= 0),
    ExpiryDate      DATE,
    HubID           VARCHAR2(10),
    CONSTRAINT fk_supply_hub FOREIGN KEY (HubID) REFERENCES LOGISTICS_HUB(HubID)
);

-- Disjoint specialization of SUPPLY

CREATE TABLE FOOD_SUPPLY (
    SupplyID        VARCHAR2(10)   PRIMARY KEY,
    FoodType        VARCHAR2(50)   NOT NULL,
    CONSTRAINT fk_food_supply FOREIGN KEY (SupplyID) REFERENCES SUPPLY(SupplyID) ON DELETE CASCADE
);

CREATE TABLE MEDICAL_SUPPLY (
    SupplyID        VARCHAR2(10)   PRIMARY KEY,
    MedType         VARCHAR2(50)   NOT NULL,
    CONSTRAINT fk_med_supply FOREIGN KEY (SupplyID) REFERENCES SUPPLY(SupplyID) ON DELETE CASCADE
);

CREATE TABLE EQUIPMENT_SUPPLY (
    SupplyID        VARCHAR2(10)   PRIMARY KEY,
    EquipType       VARCHAR2(50)   NOT NULL,
    CONSTRAINT fk_equip_supply FOREIGN KEY (SupplyID) REFERENCES SUPPLY(SupplyID) ON DELETE CASCADE
);

-- 9. DONOR (External entity)

CREATE TABLE DONOR (
    DonorID         VARCHAR2(10)   PRIMARY KEY,
    DonorName       VARCHAR2(100)  NOT NULL,
    DonorContact    VARCHAR2(100)
);

-- 10. DONATION

CREATE TABLE DONATION (
    DonationID      VARCHAR2(10)   PRIMARY KEY,
    Amount          NUMBER(12,2)   NOT NULL CHECK (Amount > 0),
    DonationDate    DATE           NOT NULL,
    DonationType    VARCHAR2(50)   NOT NULL,
    Status          VARCHAR2(20)   NOT NULL CHECK (Status IN ('Pending','Received','Allocated'))
);

-- 11. BENEFICIARY (Union/Category of Victim + Supply)

CREATE TABLE BENEFICIARY (
    BeneficiaryID   VARCHAR2(10)   PRIMARY KEY,
    VictimID        VARCHAR2(10)   NOT NULL,
    CONSTRAINT fk_ben_victim FOREIGN KEY (VictimID) REFERENCES VICTIM(VictimID) ON DELETE CASCADE
);

-- BENEFICIARY_SUPPLY = RECEIVES relationship (M:N)

CREATE TABLE BENEFICIARY_SUPPLY (
    BeneficiaryID   VARCHAR2(10)   NOT NULL,
    SupplyID        VARCHAR2(10)   NOT NULL,
    DateReceived    DATE           DEFAULT SYSDATE,
    CONSTRAINT pk_ben_supply PRIMARY KEY (BeneficiaryID, SupplyID),
    CONSTRAINT fk_bs_ben    FOREIGN KEY (BeneficiaryID) REFERENCES BENEFICIARY(BeneficiaryID) ON DELETE CASCADE,
    CONSTRAINT fk_bs_supply FOREIGN KEY (SupplyID)      REFERENCES SUPPLY(SupplyID)
);

-- 12. RELATIONSHIP: MAKES (Donor 1 -> N Donation)

CREATE TABLE MAKES (
    DonorID         VARCHAR2(10)   NOT NULL,
    DonationID      VARCHAR2(10)   NOT NULL,
    CONSTRAINT pk_makes PRIMARY KEY (DonorID, DonationID),
    CONSTRAINT fk_makes_donor    FOREIGN KEY (DonorID)    REFERENCES DONOR(DonorID) ON DELETE CASCADE,
    CONSTRAINT fk_makes_donation FOREIGN KEY (DonationID) REFERENCES DONATION(DonationID) ON DELETE CASCADE
);

-- 13. RELATIONSHIP: RECEIVED_BY (Donation N -> 1 Organization)

CREATE TABLE RECEIVED_BY (
    DonationID      VARCHAR2(10)   NOT NULL,
    OrgID           VARCHAR2(10)   NOT NULL,
    CONSTRAINT pk_received_by PRIMARY KEY (DonationID, OrgID),
    CONSTRAINT fk_rb_donation FOREIGN KEY (DonationID) REFERENCES DONATION(DonationID) ON DELETE CASCADE,
    CONSTRAINT fk_rb_org      FOREIGN KEY (OrgID)      REFERENCES ORGANIZATION(OrgID)
);

-- 14. RELATIONSHIP: DONATES_TO (Donor M -> N Organization)

CREATE TABLE DONATES_TO (
    DonorID         VARCHAR2(10)   NOT NULL,
    OrgID           VARCHAR2(10)   NOT NULL,
    CONSTRAINT pk_donates_to PRIMARY KEY (DonorID, OrgID),
    CONSTRAINT fk_dt_donor FOREIGN KEY (DonorID) REFERENCES DONOR(DonorID) ON DELETE CASCADE,
    CONSTRAINT fk_dt_org   FOREIGN KEY (OrgID)   REFERENCES ORGANIZATION(OrgID)
);

-- VIEW: Available Space in Shelter (derived attribute)

CREATE OR REPLACE VIEW SHELTER_AVAILABILITY AS
SELECT 
    ShelterID,
    Status,
    Capacity,
    CurrOccupancy,
    (Capacity - CurrOccupancy) AS AvailableSpace,
    City,
    District
FROM SHELTER;

-- SAMPLE DATA

-- DISASTER
INSERT INTO DISASTER VALUES ('DIS001', 'Flood',      'High',     DATE '2025-07-15', 'Active');
INSERT INTO DISASTER VALUES ('DIS002', 'Earthquake',  'Critical', DATE '2025-06-01', 'Contained');
INSERT INTO DISASTER VALUES ('DIS003', 'Wildfire',    'Medium',   DATE '2025-08-20', 'Resolved');
INSERT INTO DISASTER VALUES ('DIS004', 'Cyclone',     'High',     DATE '2025-09-10', 'Active');

-- ORGANIZATION
INSERT INTO ORGANIZATION VALUES ('ORG001', 'Relief Pakistan',      'NGO',             '0300-1234567', 'relief@pk.org');
INSERT INTO ORGANIZATION VALUES ('ORG002', 'Red Crescent Society', 'International',   '0321-7654321', 'redcrescent@org');
INSERT INTO ORGANIZATION VALUES ('ORG003', 'Edhi Foundation',      'Charity',         '0333-1112222', 'edhi@foundation.pk');
INSERT INTO ORGANIZATION VALUES ('ORG004', 'NDMA Pakistan',        'Government Body', '051-9201595',  'ndma@gov.pk');

-- SHELTER
INSERT INTO SHELTER VALUES ('SHL001', 'Open',   500, 320, 31.5497, 74.3436, 'Lahore',    'Gulberg');
INSERT INTO SHELTER VALUES ('SHL002', 'Full',   300, 300, 30.1575, 71.5249, 'Multan',    'Saddar');
INSERT INTO SHELTER VALUES ('SHL003', 'Open',   200, 80,  33.7215, 73.0433, 'Rawalpindi','Sadiqabad');
INSERT INTO SHELTER VALUES ('SHL004', 'Closed', 400, 0,   31.4504, 73.1350, 'Faisalabad','D Ground');

-- LOGISTICS HUB
INSERT INTO LOGISTICS_HUB VALUES ('HUB001', 'Active',      50000, 31.5497, 74.3436);
INSERT INTO LOGISTICS_HUB VALUES ('HUB002', 'Active',      30000, 30.1575, 71.5249);
INSERT INTO LOGISTICS_HUB VALUES ('HUB003', 'Maintenance', 20000, 33.7215, 73.0433);
INSERT INTO LOGISTICS_HUB VALUES ('HUB004', 'Inactive',    15000, 31.4504, 73.1350);

-- PERSON
INSERT INTO PERSON VALUES ('PER001', 'Ayesha Noor',    DATE '1990-03-12', 'Female', '0301-1111111', 'House 5, St 3', 'Lahore',     'Gulberg',   '54000');
INSERT INTO PERSON VALUES ('PER002', 'Bilal Ahmed',    DATE '1985-07-22', 'Male',   '0302-2222222', 'House 9, St 7', 'Multan',     'Saddar',    '60000');
INSERT INTO PERSON VALUES ('PER003', 'Sara Khan',      DATE '1995-11-05', 'Female', '0303-3333333', 'Flat 2, Blk A', 'Islamabad',  'F-8',       '44000');
INSERT INTO PERSON VALUES ('PER004', 'Usman Tariq',    DATE '1988-01-30', 'Male',   '0304-4444444', 'House 1, St 1', 'Rawalpindi', 'Sadiqabad', '46000');
INSERT INTO PERSON VALUES ('PER005', 'Fatima Malik',   DATE '2000-05-18', 'Female', '0305-5555555', 'House 7, St 2', 'Faisalabad', 'D Ground',  '38000');
INSERT INTO PERSON VALUES ('PER006', 'Hassan Raza',    DATE '1992-09-25', 'Male',   '0306-6666666', 'House 3, St 9', 'Lahore',     'DHA',       '54000');
INSERT INTO PERSON VALUES ('PER007', 'Zainab Ali',     DATE '1998-12-01', 'Female', '0307-7777777', 'House 6, St 5', 'Karachi',    'Clifton',   '75000');
INSERT INTO PERSON VALUES ('PER008', 'Omar Sheikh',    DATE '1983-04-14', 'Male',   '0308-8888888', 'House 8, St 6', 'Quetta',     'Satellite', '87000');

-- VICTIM
INSERT INTO VICTIM VALUES ('VIC001', 'PER001', 'Minor Injury',  DATE '2025-07-16');
INSERT INTO VICTIM VALUES ('VIC002', 'PER002', 'Critical',      DATE '2025-06-02');
INSERT INTO VICTIM VALUES ('VIC003', 'PER003', 'No Injury',     DATE '2025-07-17');
INSERT INTO VICTIM VALUES ('VIC004', 'PER005', 'Moderate',      DATE '2025-09-11');

-- VICTIM NEEDS (multivalued)
INSERT INTO VICTIM_NEEDS VALUES ('VIC001', 'Food');
INSERT INTO VICTIM_NEEDS VALUES ('VIC001', 'Shelter');
INSERT INTO VICTIM_NEEDS VALUES ('VIC002', 'Medical');
INSERT INTO VICTIM_NEEDS VALUES ('VIC002', 'Food');
INSERT INTO VICTIM_NEEDS VALUES ('VIC003', 'Shelter');
INSERT INTO VICTIM_NEEDS VALUES ('VIC004', 'Food');
INSERT INTO VICTIM_NEEDS VALUES ('VIC004', 'Equipment');

-- VOLUNTEER
INSERT INTO VOLUNTEER VALUES ('VOL001', 'PER004', 'Available',   'Advanced', 'ORG001');
INSERT INTO VOLUNTEER VALUES ('VOL002', 'PER006', 'On Duty',     'Basic',    'ORG002');
INSERT INTO VOLUNTEER VALUES ('VOL003', 'PER007', 'Available',   'Intermediate', 'ORG003');
INSERT INTO VOLUNTEER VALUES ('VOL004', 'PER008', 'Unavailable', 'Advanced', 'ORG001');

-- VOLUNTEER SKILLS (multivalued)
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL001', 'First Aid');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL001', 'Search , Rescue');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL002', 'Medical Support');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL003', 'Logistics');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL003', 'Communication');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL004', 'First Aid');
INSERT INTO VOLUNTEER_SKILLS VALUES ('VOL004', 'Heavy Machinery');

-- SUPPLY (parent)
INSERT INTO SUPPLY VALUES ('SUP001', 'Rice Bags',       1000, DATE '2026-12-31', 'HUB001');
INSERT INTO SUPPLY VALUES ('SUP002', 'Paracetamol',     5000, DATE '2026-06-30', 'HUB001');
INSERT INTO SUPPLY VALUES ('SUP003', 'Rescue Ropes',    200,  NULL,              'HUB002');
INSERT INTO SUPPLY VALUES ('SUP004', 'Mineral Water',   3000, DATE '2025-12-01', 'HUB002');
INSERT INTO SUPPLY VALUES ('SUP005', 'Bandages',        2000, DATE '2027-01-01', 'HUB001');
INSERT INTO SUPPLY VALUES ('SUP006', 'Tents',           150,  NULL,              'HUB002');

-- SUPPLY SUBTYPES
INSERT INTO FOOD_SUPPLY      VALUES ('SUP001', 'Dry Food');
INSERT INTO FOOD_SUPPLY      VALUES ('SUP004', 'Water');
INSERT INTO MEDICAL_SUPPLY   VALUES ('SUP002', 'Analgesic');
INSERT INTO MEDICAL_SUPPLY   VALUES ('SUP005', 'Wound Care');
INSERT INTO EQUIPMENT_SUPPLY VALUES ('SUP003', 'Rope Equipment');
INSERT INTO EQUIPMENT_SUPPLY VALUES ('SUP006', 'Shelter Equipment');

-- DONOR
INSERT INTO DONOR VALUES ('DON001', 'Alkhidmat Foundation', '0300-9999999');
INSERT INTO DONOR VALUES ('DON002', 'Anonymous Donor',      NULL);
INSERT INTO DONOR VALUES ('DON003', 'Imran Welfare Trust',  '0321-8888888');
INSERT INTO DONOR VALUES ('DON004', 'Community Fund PK',    '0333-7777777');

-- DONATION
INSERT INTO DONATION VALUES ('DNT001', 500000.00,  DATE '2025-07-20', 'Cash',     'Received');
INSERT INTO DONATION VALUES ('DNT002', 250000.00,  DATE '2025-06-10', 'In-Kind',  'Allocated');
INSERT INTO DONATION VALUES ('DNT003', 100000.00,  DATE '2025-08-25', 'Cash',     'Pending');
INSERT INTO DONATION VALUES ('DNT004', 750000.00,  DATE '2025-09-15', 'Cash',     'Received');

-- BENEFICIARY
INSERT INTO BENEFICIARY VALUES ('BEN001', 'VIC001');
INSERT INTO BENEFICIARY VALUES ('BEN002', 'VIC002');
INSERT INTO BENEFICIARY VALUES ('BEN003', 'VIC003');
INSERT INTO BENEFICIARY VALUES ('BEN004', 'VIC004');

-- BENEFICIARY_SUPPLY (RECEIVES)
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN001', 'SUP001', DATE '2025-07-18');
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN001', 'SUP004', DATE '2025-07-18');
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN002', 'SUP002', DATE '2025-06-05');
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN002', 'SUP005', DATE '2025-06-05');
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN003', 'SUP006', DATE '2025-07-19');
INSERT INTO BENEFICIARY_SUPPLY VALUES ('BEN004', 'SUP001', DATE '2025-09-12');

-- MAKES (Donor -> Donation)
INSERT INTO MAKES VALUES ('DON001', 'DNT001');
INSERT INTO MAKES VALUES ('DON002', 'DNT002');
INSERT INTO MAKES VALUES ('DON003', 'DNT003');
INSERT INTO MAKES VALUES ('DON004', 'DNT004');

-- RECEIVED_BY (Donation -> Org)
INSERT INTO RECEIVED_BY VALUES ('DNT001', 'ORG001');
INSERT INTO RECEIVED_BY VALUES ('DNT002', 'ORG002');
INSERT INTO RECEIVED_BY VALUES ('DNT003', 'ORG003');
INSERT INTO RECEIVED_BY VALUES ('DNT004', 'ORG004');

-- DONATES_TO (Donor -> Org, M:N)
INSERT INTO DONATES_TO VALUES ('DON001', 'ORG001');
INSERT INTO DONATES_TO VALUES ('DON001', 'ORG002');
INSERT INTO DONATES_TO VALUES ('DON002', 'ORG003');
INSERT INTO DONATES_TO VALUES ('DON003', 'ORG001');
INSERT INTO DONATES_TO VALUES ('DON004', 'ORG004');

COMMIT;

-- Show shelter availability (derived attribute)
SELECT * FROM SHELTER_AVAILABILITY;

-- Victims with their needs
SELECT V.VictimID, P.FullName, V.InjuryStatus, VN.NeedType
FROM VICTIM V
JOIN PERSON P ON V.PersonID = P.PersonID
JOIN VICTIM_NEEDS VN ON V.VictimID = VN.VictimID;

-- Volunteers with their skills
SELECT VOL.VolunteerID, P.FullName, VOL.Availability, VS.Skill
FROM VOLUNTEER VOL
JOIN PERSON P ON VOL.PersonID = P.PersonID
JOIN VOLUNTEER_SKILLS VS ON VOL.VolunteerID = VS.VolunteerID;

-- Supply inventory by type
SELECT S.SupplyID, S.SupplyName, S.Quantity, S.ExpiryDate,
       CASE WHEN FS.SupplyID IS NOT NULL THEN 'Food'
            WHEN MS.SupplyID IS NOT NULL THEN 'Medical'
            WHEN ES.SupplyID IS NOT NULL THEN 'Equipment'
       END AS SupplyType
FROM SUPPLY S
LEFT JOIN FOOD_SUPPLY FS ON S.SupplyID = FS.SupplyID
LEFT JOIN MEDICAL_SUPPLY MS ON S.SupplyID = MS.SupplyID
LEFT JOIN EQUIPMENT_SUPPLY ES ON S.SupplyID = ES.SupplyID;

-- Donation summary
SELECT DN.DonationID, DR.DonorName, DN.Amount, DN.DonationType, DN.Status, O.OrgName
FROM DONATION DN
JOIN MAKES M ON DN.DonationID = M.DonationID
JOIN DONOR DR ON M.DonorID = DR.DonorID
JOIN RECEIVED_BY RB ON DN.DonationID = RB.DonationID
JOIN ORGANIZATION O ON RB.OrgID = O.OrgID;
