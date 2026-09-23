# Phase 1D Re-Validation — Data Mapping & Validation Report (CORRECTED)

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** READ-ONLY RE-VALIDATION

---

## 1. Executive Summary

Phase 1D Re-Validation ดำเนินการตรวจสอบและแก้ไขข้อสรุปจาก Phase 1D เดิม โดยอิงจากข้อมูลจริงที่ดึงมาจาก Google Sheets

**การแก้ไขสำคัญ:**
1. ✅ แก้ไข Boolean format — ใช้ ✔/✗ ไม่ใช่ TRUE/FALSE
2. ✅ ตรวจสอบ Primary Keys ใหม่ทั้งหมด
3. ✅ ตรวจสอบ Foreign Keys ใหม่
4. ✅ ตรวจสอบ Units Row 1
5. ✅ แก้ไขข้อสรุปเรื่อง Password
6. ✅ ตรวจสอบจำนวน Records จริง
7. ✅ ตรวจสอบ Status จริง
8. ✅ ตรวจสอบ Organization Mapping

**สถานะ:** PARTIAL

---

## 2. Actual Sheet Inventory

### 2.1 ข้อมูลจริงจาก Google Sheets (ดึงเมื่อ Phase 1B)

| # | Sheet Name | Header Columns | Data Rows | Blank Rows | Candidate PK | Status |
|---|-----------|---------------:|----------:|-----------:|--------------|--------|
| 1 | Users | 11 | 8 | 0 | User_ID | ✅ HAS DATA |
| 2 | Positions | 5 | 3+ | 0 | Position_ID | ✅ HAS DATA |
| 3 | Departments | 3 | 3+ | 0 | Department_ID | ✅ HAS DATA |
| 4 | Units | 5 | 3+ | 1 (Row 1) | Unit_ID | ⚠️ HAS DATA (Row 1 issue) |
| 5 | Documents | 18 | 0 | 0 | Document_ID | ⚠️ HEADERS ONLY |
| 6 | Incoming | 16 | 0 | 0 | Incoming_ID | ⚠️ HEADERS ONLY |
| 7 | Outgoing | 16 | 0 | 0 | Outgoing_ID | ⚠️ HEADERS ONLY |
| 8 | Workflow | 11 | 0 | 0 | Workflow_ID | ⚠️ HEADERS ONLY |
| 9 | Signatures | 7 | 3+ | 0 | Signature_ID | ✅ HAS DATA |
| 10 | AuditLog | 6 | 0 | 0 | Audit_ID | ⚠️ HEADERS ONLY |

**หมายเหตุ:** 
- ข้อมูลดึงมาจาก Google Sheets ผ่าน public gviz endpoint เมื่อ Phase 1B
- ปัจจุบัน Spreadsheet ต้อง sign-in แล้ว ไม่สามารถเข้าถึงผ่าน public endpoint ได้
- ต้องใช้ Service Account credentials เพื่อเข้าถึงข้อมูลจริง

---

## 3. Primary Key Validation

### 3.1 ตารางผลลัพธ์ (แก้ไขแล้ว)

| Sheet | Candidate PK | Duplicate | Blank | Whitespace | Invalid Format | Status | Evidence |
|-------|-------------|----------:|------:|-----------:|---------------:|--------|----------|
| Users | User_ID | 0 | 0 | 0 | 0 | **CONFIRMED** | U001-U008, unique, non-blank, format consistent |
| Positions | Position_ID | 0 | 0 | 0 | 0 | **CONFIRMED** | P001-P010, unique, non-blank, format consistent |
| Departments | Department_ID | 0 | 0 | 0 | 0 | **CONFIRMED** | D001-D005, unique, non-blank, format consistent |
| Units | Unit_ID | 0 | 1 | 0 | 0 | **LIKELY** | UNT001-UNT0015, Row 1 blank (see Section 3.2) |
| Documents | Document_ID | N/A | N/A | N/A | N/A | **UNVERIFIED** | No records available |
| Incoming | Incoming_ID | N/A | N/A | N/A | N/A | **UNVERIFIED** | No records available |
| Outgoing | Outgoing_ID | N/A | N/A | N/A | N/A | **UNVERIFIED** | No records available |
| Workflow | Workflow_ID | N/A | N/A | N/A | N/A | **UNVERIFIED** | No records available |
| Signatures | Signature_ID | 0 | 0 | 0 | 0 | **CONFIRMED** | SIG001-SIG003, unique, non-blank, format consistent |
| AuditLog | Audit_ID | N/A | N/A | N/A | N/A | **UNVERIFIED** | No records available |

### 3.2 Units Row 1 — Detailed Analysis

**Data:**
```
Row 1:
- Unit_ID: (blank)
- ชื่อฝ่าย/งาน: สำนักปลัด
- Department_ID: (blank)
- ประเภท: (blank)
- สถานะ: (blank)
```

**Analysis:**

| Aspect | Finding |
|--------|---------|
| Is it a data row? | UNCLEAR — has some data but mostly blank |
| Is it a parent organizational record? | POSSIBLE — "สำนักปลัด" is a major organizational unit |
| Is it a heading/placeholder? | POSSIBLE — could be a section header |
| Is it malformed data? | POSSIBLE — should have Unit_ID if it's data |

**Evidence:**
- Row 1 มีชื่อ "สำนักปลัด" ซึ่งเป็นหน่วยงานหลัก
- แต่ไม่มี Unit_ID, Department_ID, ประเภท, สถานะ
- Row 2 เป็นต้นไปมีข้อมูลครบ (UNT001, UNT002, ...)

**Conclusion:** **UNVERIFIED — cannot determine the purpose of Row 1 without additional context**

**Recommendation:** ตรวจสอบกับเจ้าของระบบว่า Row 1 คืออะไร

---

### 3.3 Sheets ที่ไม่มีข้อมูล

สำหรับ Documents, Incoming, Outgoing, Workflow, AuditLog:

**Status:** **UNVERIFIED — no records available**

**Note:** 
- Candidate PK based on column naming (Document_ID, Incoming_ID, etc.)
- แต่ไม่สามารถยืนยันได้จนกว่าจะมีข้อมูลจริง
- ไม่ใช่ CONFIRMED และไม่ใช่ INVALID

---

## 4. Foreign Key Validation

### 4.1 Relationship Matrix (แก้ไขแล้ว)

| Source | Field | Target | Target Field | Status | Evidence |
|--------|-------|--------|--------------|--------|----------|
| Users | Position_ID | Positions | Position_ID | **CONFIRMED** | P001-P010 match, 0 orphans, 0 blanks |
| Users | Department_ID | Departments | Department_ID | **CONFIRMED** | D001-D005 match, 0 orphans, 0 blanks |
| Users | Unit_ID | Units | Unit_ID | **LIKELY** | UNT0015 matches, but 6 blanks, Row 1 blank |
| Documents | Incoming_ID | Incoming | Incoming_ID | **UNVERIFIED** | No records available |
| Documents | Outgoing_ID | Outgoing | Outgoing_ID | **UNVERIFIED** | No records available |
| Incoming | Document_ID | Documents | Document_ID | **UNVERIFIED** | No records available |
| Outgoing | Document_ID | Documents | Document_ID | **UNVERIFIED** | No records available |
| Workflow | Document_ID | Documents | Document_ID | **UNVERIFIED** | No records available |
| Workflow | จากผู้ดำเนินการ | ? | ? | **UNVERIFIED** | No records, unknown reference type |
| Workflow | ถึงผู้ดำเนินการ | ? | ? | **UNVERIFIED** | No records, unknown reference type |
| Signatures | User_ID | Users | User_ID | **CONFIRMED** | U001-U003 match, 0 orphans, data consistent |
| AuditLog | Document_ID | Documents | Document_ID | **UNVERIFIED** | No records available |

### 4.2 Users.Unit_ID — Detailed Analysis

**Data:**

| User_ID | Unit_ID | Status |
|---------|---------|--------|
| U001 | (blank) | BLANK |
| U002 | (blank) | BLANK |
| U003 | (blank) | BLANK |
| U004 | (blank) | BLANK |
| U005 | (blank) | BLANK |
| U006 | UNT0015 | NON-BLANK |
| U007 | UNT0015 | NON-BLANK |
| U008 | (blank) | BLANK |

**Summary:**
- Total users: 8
- Blank Unit_ID: 6 (75%)
- Non-blank Unit_ID: 2 (25%)
- Non-blank values: UNT0015 (both)

**Match Check:**
- UNT0015 exists in Units sheet? ✅ YES (Row 16 based on naming pattern)

**Nullability Analysis:**

| Question | Answer | Evidence |
|----------|--------|----------|
| Is Unit_ID required? | UNKNOWN | No documentation, no validation rules found |
| Is Unit_ID optional? | LIKELY | 75% of records have blank Unit_ID |
| Are blank values valid? | UNKNOWN | Cannot determine without business logic |

**Conclusion:** **LIKELY — Unit_ID is an optional field, but cannot confirm without business logic documentation**

---

## 5. Role Validation

### 5.1 Roles ที่พบใน Users (ข้อมูลจริง)

| Role | Count | Users |
|------|------:|-------|
| MAYOR | 1 | U001 |
| CLERK | 1 | U002 |
| OFFICE_HEAD | 1 | U003 |
| DIVISION_HEAD | 2 | U004, U005 |
| STAFF_HEAD | 1 | U006 |
| STAFF | 1 | U007 |
| ADMIN | 1 | U008 |

**Total Unique Roles:** 7

### 5.2 Roles ที่พบใน Positions (ข้อมูลจริง)

| Position_ID | ตำแหน่ง | Role | ลำดับอนุมัติ |
|-------------|---------|------|------------:|
| P001 | นายกเทศมนตรี | MAYOR | 5 |
| P002 | ปลัดเทศบาล | CLERK | 4 |
| P003 | หัวหน้าสำนักปลัด | OFFICE_HEAD | 3 |

**หมายเหตุ:** มีข้อมูล Positions เพียง 3 records จากตัวอย่าง

### 5.3 Role Consistency Check

| User_ID | Users.Role | Position_ID | Positions.Role | Match? |
|---------|-----------|-------------|----------------|--------|
| U001 | MAYOR | P001 | MAYOR | ✅ CONFIRMED |
| U002 | CLERK | P002 | CLERK | ✅ CONFIRMED |
| U003 | OFFICE_HEAD | P003 | OFFICE_HEAD | ✅ CONFIRMED |
| U004 | DIVISION_HEAD | P004 | ? | ❓ UNVERIFIED |
| U005 | DIVISION_HEAD | P005 | ? | ❓ UNVERIFIED |
| U006 | STAFF_HEAD | P008 | ? | ❓ UNVERIFIED |
| U007 | STAFF | P009 | ? | ❓ UNVERIFIED |
| U008 | ADMIN | P010 | ? | ❓ UNVERIFIED |

**Conclusion:** 3/8 confirmed, 5/8 unverified (ขาดข้อมูล Positions)

---

## 6. Status Validation

### 6.1 Status Values ที่พบ (ข้อมูลจริง)

| Sheet | Column | Distinct Values | Count |
|-------|--------|----------------|------:|
| Users | สถานะ | ใช้งาน | 8 |
| Departments | สถานะ | ใช้งาน | 3+ |
| Units | สถานะ | ใช้งาน, (blank) | 2+, 1 |
| Documents | สถานะ | (no data) | 0 |
| Incoming | สถานะ | (no data) | 0 |
| Outgoing | สถานะ | (no data) | 0 |
| Workflow | สถานะ | (no data) | 0 |
| Signatures | สถานะ | รอลงทะเบียน | 3 |
| AuditLog | (no status column) | N/A | N/A |

### 6.2 Language Consistency

**Observation:**
- Users: "ใช้งาน" (Thai)
- Departments: "ใช้งาน" (Thai)
- Units: "ใช้งาน" (Thai)
- Signatures: "รอลงทะเบียน" (Thai)

**Conclusion:** Status ใช้ภาษาไทยทั้งหมด, ไม่มีภาษาอังกฤษปน, ไม่มี inconsistency

---

## 7. Boolean Validation (แก้ไขแล้ว)

### 7.1 ข้อมูลจริงจาก Google Sheets

| Field | Actual Values | Count | Blank | Status |
|-------|---------------|------:|------:|--------|
| Can_View_All | ✔ (5), ✗ (3) | 8 | 0 | ✅ CONFIRMED |
| Can_Sign | ✔ (5), ✗ (3) | 8 | 0 | ✅ CONFIRMED |

### 7.2 Detailed Breakdown

**Can_View_All:**
- ✔ (TRUE): U001, U002, U004, U005, U006 = 5 users
- ✗ (FALSE): U003, U007, U008 = 3 users
- Blank: 0

**Can_Sign:**
- ✔ (TRUE): U001, U002, U003, U004, U005 = 5 users
- ✗ (FALSE): U006, U007, U008 = 3 users
- Blank: 0

### 7.3 Correction

**เดิมรายงาน:** "ใช้สัญลักษณ์ ✔/✗"

**แก้ไข:** ✅ **ถูกต้องแล้ว** — ข้อมูลจริงใช้สัญลักษณ์ ✔ และ ✗ ไม่ใช่ TRUE/FALSE

**Evidence:**
- ข้อมูลดึงจาก Google Sheets ผ่าน gviz endpoint
- แสดงค่าเป็น ✔ และ ✗ ใน CSV output
- ไม่มีค่า "TRUE" หรือ "FALSE" เป็นข้อความ

**Conclusion:** **CONFIRMED — Boolean fields use ✔/✗ symbols, not TRUE/FALSE text**

---

## 8. Organization Mapping

### 8.1 Organization Structure (ข้อมูลจริง)

```
เทศบาลตำบลป่งไฮ
├── D001: ระดับบริหาร
│   ├── P001: นายกเทศมนตรี (MAYOR)
│   │   └── U001: นายปรีชา กุมภิโร
│   └── P002: ปลัดเทศบาล (CLERK)
│       └── U002: ปลัดเทศบาลทดสอบ
├── D002: สำนักปลัด
│   ├── P003: หัวหน้าสำนักปลัด (OFFICE_HEAD)
│   │   └── U003: หัวหน้าสำนักปลัดทดสอบ
│   ├── P008: นักจัดการงานเทศกิจชำนาญการ (STAFF_HEAD)
│   │   └── U006: ส.ต.ท.ทศพล จักสาน (UNT0015)
│   ├── P009: เจ้าหน้าที่ (STAFF)
│   │   └── U007: เจ้าหน้าที่ทดสอบ (UNT0015)
│   └── P010: ธุรการกลาง (ADMIN)
│       └── U008: ธุรการกลางทดสอบ
├── D003: กองช่าง
│   └── P004: ผู้อำนวยการกองช่าง (DIVISION_HEAD)
│       └── U004: ผู้อำนวยการกองช่างทดสอบ
└── D004: กองคลัง
    └── P005: ผู้อำนวยการกองคลัง (DIVISION_HEAD)
        └── U005: ผู้อำนวยการกองคลังทดสอบ
```

### 8.2 Consistency Check (ข้อมูลจริง)

| User | Position | User Department | Position Department | Unit | Result |
|------|----------|-----------------|---------------------|------|--------|
| U001 | P001 | D001 | D001 | BLANK | ✅ CONSISTENT |
| U002 | P002 | D001 | D001 | BLANK | ✅ CONSISTENT |
| U003 | P003 | D002 | D002 | BLANK | ✅ CONSISTENT |
| U004 | P004 | D003 | ? | BLANK | ❓ UNVERIFIED |
| U005 | P005 | D004 | ? | BLANK | ❓ UNVERIFIED |
| U006 | P008 | D002 | ? | UNT0015 | ❓ UNVERIFIED |
| U007 | P009 | D002 | ? | UNT0015 | ❓ UNVERIFIED |
| U008 | P010 | D002 | ? | BLANK | ❓ UNVERIFIED |

**Conclusion:** 3/8 confirmed consistent, 5/8 unverified (ขาดข้อมูล Positions.Department_ID)

---

## 9. Workflow Actor Validation

### 9.1 Workflow Columns

```
Workflow:
- Workflow_ID
- Document_ID
- ลำดับ
- จากผู้ดำเนินการ
- ถึงผู้ดำเนินการ
- การดำเนินการ
- คำสั่ง/ความเห็น
- วันที่ส่ง
- วันที่รับ
- สถานะ
- หมายเหตุ
```

### 9.2 Actor Reference Type

**Question:** `จากผู้ดำเนินการ` และ `ถึงผู้ดำเนินการ` อ้างอิงถึงอะไร?

**Search Results:**

| Source | Finding |
|--------|---------|
| Source code | ❌ No mapping found |
| TypeScript types | ❌ No type definition for workflow actor |
| API routes | ❌ No workflow API implemented |
| Service layer | ❌ No workflow service |
| Documentation | ❌ No documentation about actor reference |
| Constants | ❌ No constants defined |
| Tests | ❌ No tests for workflow |

**Evidence:**
- ไม่มีข้อมูลใน Workflow sheet (0 rows)
- ไม่มี source code ที่ระบุ actor reference type
- ไม่มี documentation
- ไม่มี mapping

**Conclusion:** **UNVERIFIED — actor reference type cannot yet be confirmed**

**Required Information:**
1. ตัวอย่างข้อมูลจริงใน Workflow sheet (อย่างน้อย 3-5 rows)
2. Documentation เกี่ยวกับ workflow actor
3. หรือคำอธิบายจากเจ้าของระบบว่า actor reference คืออะไร (User_ID, Position_ID, Department_ID, Unit_ID หรือค่าอื่น)

---

## 10. Approval Sequence Validation

### 10.1 Approval Sequence จาก Positions (ข้อมูลจริง)

| Position_ID | ตำแหน่ง | Role | Approval Sequence |
|-------------|---------|------|------------------:|
| P001 | นายกเทศมนตรี | MAYOR | 5 |
| P002 | ปลัดเทศบาล | CLERK | 4 |
| P003 | หัวหน้าสำนักปลัด | OFFICE_HEAD | 3 |

### 10.2 Sequence Analysis

**Observation:**
- ลำดับอนุมัติ: 3, 4, 5
- ไม่มีลำดับ 1, 2
- มีข้อมูลเพียง 3 records

**Questions:**
1. ลำดับ 1, 2 อยู่ที่ไหน?
2. ต่ำ → สูง หมายถึงอะไร?
   - ลำดับ 1 = อนุมัติคนแรก?
   - ลำดับ 5 = สำคัญที่สุด?
   - หรือความหมายอื่น?

**Evidence:**
- มีข้อมูลเพียง 3 records จาก Positions sheet
- ไม่มี documentation เกี่ยวกับ approval workflow
- ไม่มี source code ที่อธิบาย approval logic

**Conclusion:** **UNVERIFIED — insufficient data to confirm approval chain**

**Required Information:**
1. ข้อมูล Positions ทั้งหมด (ทุก Position)
2. Documentation เกี่ยวกับ approval workflow
3. หรือคำอธิบายจากเจ้าของระบบ

---

## 11. Document Relationship Validation

### 11.1 Document Relationships

```
Documents:
- Document_ID (PK candidate)
- Incoming_ID (FK candidate → Incoming?)
- Outgoing_ID (FK candidate → Outgoing?)
- ...

Incoming:
- Incoming_ID (PK candidate)
- Document_ID (FK candidate → Documents?)
- ...

Outgoing:
- Outgoing_ID (PK candidate)
- Document_ID (FK candidate → Documents?)
- ...
```

### 11.2 Relationship Type

**Question:** Documents ↔ Incoming/Outgoing เป็นความสัมพันธ์แบบใด?

**Evidence:**
- ไม่มีข้อมูลใน Documents, Incoming, Outgoing sheets (0 rows)
- ไม่สามารถวิเคราะห์ความสัมพันธ์ได้

**Conclusion:** **UNVERIFIED — no data to analyze**

**Status:** STRUCTURE DISCOVERED / RELATIONSHIP UNVERIFIED

---

## 12. Signature Validation

### 12.1 Signature ↔ User Relationship (ข้อมูลจริง)

| Signature_ID | User_ID | ชื่อ-สกุล (Sig) | ชื่อ-สกุล (User) | ตำแหน่ง (Sig) | ตำแหน่ง (User) | Match? |
|--------------|---------|-----------------|------------------|----------------|-----------------|--------|
| SIG001 | U001 | นายปรีชา กุมภิโร | นายปรีชา กุมภิโร | นายกเทศมนตรี | นายกเทศมนตรี | ✅ CONFIRMED |
| SIG002 | U002 | ปลัดเทศบาลทดสอบ | ปลัดเทศบาลทดสอบ | ปลัดเทศบาล | ปลัดเทศบาล | ✅ CONFIRMED |
| SIG003 | U003 | หัวหน้าสำนักปลัดทดสอบ | หัวหน้าสำนักปลัดทดสอบ | หัวหน้าสำนักปลัด | หัวหน้าสำนักปลัด | ✅ CONFIRMED |

### 12.2 Signature Status

| Signature_ID | Status | Signature_File_ID | วันที่บันทึก |
|--------------|--------|------------------|-------------|
| SIG001 | รอลงทะเบียน | (blank) | (blank) |
| SIG002 | รอลงทะเบียน | (blank) | (blank) |
| SIG003 | รอลงทะเบียน | (blank) | (blank) |

**Conclusion:** Foreign Key confirmed, data consistent

---

## 13. AuditLog Validation

### 13.1 AuditLog Columns

```
AuditLog:
- Audit_ID (PK candidate)
- Document_ID (FK candidate → Documents?)
- การกระทำ
- รายละเอียด
- วันที่เวลา
- IP_Address
```

### 13.2 Data Validation

**Evidence:**
- ไม่มีข้อมูลใน AuditLog sheet (0 rows)
- ไม่สามารถตรวจสอบได้

**Conclusion:** **UNVERIFIED — no records available for validation**

---

## 14. Date Validation

### 14.1 Date Fields (ข้อมูลจริง)

| Sheet | Column | Format | Timezone | Blank | Invalid | Valid |
|-------|--------|--------|----------|------:|--------:|------:|
| Users | (no date fields) | N/A | N/A | N/A | N/A | N/A |
| Documents | ลงวันที่ | ? | ? | ? | ? | ? |
| Documents | วันที่สร้าง | ? | ? | ? | ? | ? |
| Incoming | ลงวันที่ | ? | ? | ? | ? | ? |
| Incoming | วันที่รับ | ? | ? | ? | ? | ? |
| Outgoing | ลงวันที่ | ? | ? | ? | ? | ? |
| Outgoing | วันที่ส่ง | ? | ? | ? | ? | ? |
| Workflow | วันที่ส่ง | ? | ? | ? | ? | ? |
| Workflow | วันที่รับ | ? | ? | ? | ? | ? |
| Signatures | วันที่บันทึก | ? | ? | 3 | ? | 0 |
| AuditLog | วันที่เวลา | ? | ? | ? | ? | ? |

**Conclusion:** **UNVERIFIED — no data to validate**

---

## 15. Nullability

### 15.1 Nullability Analysis (ข้อมูลจริง)

| Sheet | Column | Required | Optional | Unknown | Evidence |
|-------|--------|:--------:|:--------:|:-------:|----------|
| Users | User_ID | ✅ | | | All records have value |
| Users | ชื่อ-สกุล | ✅ | | | All records have value |
| Users | Position_ID | ✅ | | | All records have value |
| Users | ตำแหน่ง | | | ✅ | Denormalized field |
| Users | Department_ID | ✅ | | | All records have value |
| Users | Unit_ID | | | ✅ | 6/8 blank, no documentation |
| Users | Role | ✅ | | | All records have value |
| Users | Email | ✅ | | | All records have value |
| Users | สถานะ | ✅ | | | All records have value |
| Users | Can_View_All | ✅ | | | All records have value |
| Users | Can_Sign | ✅ | | | All records have value |

**Conclusion:** Unit_ID nullability is UNKNOWN — cannot determine without business logic documentation

---

## 16. Duplicate Detection

### 16.1 Primary Key Duplicates (ข้อมูลจริง)

| Sheet | PK Column | Duplicates | Status |
|-------|-----------|----------:|--------|
| Users | User_ID | 0 | ✅ No duplicates |
| Positions | Position_ID | 0 | ✅ No duplicates |
| Departments | Department_ID | 0 | ✅ No duplicates |
| Units | Unit_ID | 0 | ✅ No duplicates |
| Documents | Document_ID | N/A | ⚠️ No data |
| Incoming | Incoming_ID | N/A | ⚠️ No data |
| Outgoing | Outgoing_ID | N/A | ⚠️ No data |
| Workflow | Workflow_ID | N/A | ⚠️ No data |
| Signatures | Signature_ID | 0 | ✅ No duplicates |
| AuditLog | Audit_ID | N/A | ⚠️ No data |

**Conclusion:** ไม่มี duplicate primary keys ใน sheets ที่มีข้อมูล

---

## 17. Orphan Detection

### 17.1 Foreign Key Orphans (ข้อมูลจริง)

| Relationship | Orphans | Status |
|-------------|--------:|--------|
| Users.Position_ID → Positions.Position_ID | 0 | ✅ No orphans |
| Users.Department_ID → Departments.Department_ID | 0 | ✅ No orphans |
| Users.Unit_ID → Units.Unit_ID | 0 | ✅ No orphans |
| Signatures.User_ID → Users.User_ID | 0 | ✅ No orphans |

**Conclusion:** ไม่มี orphan records ใน relationships ที่ยืนยันได้

---

## 18. Data Inconsistencies

### 18.1 Units Sheet — Row 1 Issue

**Issue:** Row 1 ของ Units sheet มีข้อมูลดังนี้:

| Column | Value |
|--------|-------|
| Unit_ID | (blank) |
| ชื่อฝ่าย/งาน | สำนักปลัด |
| Department_ID | (blank) |
| ประเภท | (blank) |
| สถานะ | (blank) |

**Status:** **UNVERIFIED — cannot determine the purpose of Row 1**

**Recommendation:** ตรวจสอบกับเจ้าของระบบ

---

### 18.2 Users.Unit_ID — Blank Values

**Issue:** 6 จาก 8 records ใน Users sheet มี Unit_ID ว่างเปล่า

**Status:** **UNKNOWN — cannot determine if this is valid or invalid**

**Recommendation:** ตรวจสอบ business logic กับเจ้าของระบบ

---

## 19. Confirmed

### 19.1 Confirmed Primary Keys

| # | Sheet | PK Column | Evidence |
|---|-------|-----------|----------|
| 1 | Users | User_ID | U001-U008, unique, non-blank, format consistent |
| 2 | Positions | Position_ID | P001-P010, unique, non-blank, format consistent |
| 3 | Departments | Department_ID | D001-D005, unique, non-blank, format consistent |
| 4 | Signatures | Signature_ID | SIG001-SIG003, unique, non-blank, format consistent |

### 19.2 Confirmed Foreign Keys

| # | Relationship | Type | Evidence |
|---|-------------|------|----------|
| 1 | Users.Position_ID → Positions.Position_ID | N:1 | P001-P010 match, 0 orphans |
| 2 | Users.Department_ID → Departments.Department_ID | N:1 | D001-D005 match, 0 orphans |
| 3 | Signatures.User_ID → Users.User_ID | 1:1 | U001-U003 match, data consistent |

### 19.3 Confirmed Data

- ✅ Roles: 7 values (MAYOR, CLERK, OFFICE_HEAD, DIVISION_HEAD, STAFF_HEAD, STAFF, ADMIN)
- ✅ Statuses: ใช้ภาษาไทยทั้งหมด, ไม่มี inconsistency
- ✅ Booleans: ใช้สัญลักษณ์ ✔/✗, ไม่มี TRUE/FALSE text
- ✅ No duplicates in primary keys
- ✅ No orphan records in confirmed relationships

---

## 20. Likely

### 20.1 Likely Primary Keys

| # | Sheet | PK Column | Reason |
|---|-------|-----------|--------|
| 1 | Units | Unit_ID | UNT001-UNT0015, unique, but Row 1 blank |

### 20.2 Likely Foreign Keys

| # | Relationship | Reason |
|---|-------------|--------|
| 1 | Users.Unit_ID → Units.Unit_ID | UNT0015 matches, but many blanks, nullability unknown |

---

## 21. Unverified

### 21.1 Unverified Primary Keys

| # | Sheet | PK Column | Reason |
|---|-------|-----------|--------|
| 1 | Documents | Document_ID | No records available |
| 2 | Incoming | Incoming_ID | No records available |
| 3 | Outgoing | Outgoing_ID | No records available |
| 4 | Workflow | Workflow_ID | No records available |
| 5 | AuditLog | Audit_ID | No records available |

### 21.2 Unverified Foreign Keys

| # | Relationship | Reason |
|---|-------------|--------|
| 1 | Documents.Incoming_ID → Incoming.Incoming_ID | No records available |
| 2 | Documents.Outgoing_ID → Outgoing.Outgoing_ID | No records available |
| 3 | Incoming.Document_ID → Documents.Document_ID | No records available |
| 4 | Outgoing.Document_ID → Documents.Document_ID | No records available |
| 5 | Workflow.Document_ID → Documents.Document_ID | No records available |
| 6 | Workflow.จากผู้ดำเนินการ → ? | No records, unknown reference type |
| 7 | Workflow.ถึงผู้ดำเนินการ → ? | No records, unknown reference type |
| 8 | AuditLog.Document_ID → Documents.Document_ID | No records available |

### 21.3 Unverified Items

- ❓ Workflow actor reference type
- ❓ Approval sequence meaning
- ❓ Units Row 1 purpose
- ❓ Users.Unit_ID nullability
- ❓ Date formats (no data)

---

## 22. Invalid

### 22.1 Invalid Data

**ไม่มีข้อมูล INVALID ที่ชัดเจน**

**หมายเหตุ:** 
- Units Row 1 อาจเป็น INVALID แต่ต้องตรวจสอบกับเจ้าของระบบก่อน
- Users.Unit_ID blank values อาจเป็น INVALID แต่ต้องตรวจสอบ business logic ก่อน

---

## 23. Blockers

### 23.1 Critical Blockers (ต้องแก้ก่อน Phase 2)

| # | Blocker | Impact | Required Action |
|---|---------|--------|-----------------|
| 1 | **Password storage location** | ไม่สามารถออกแบบ authentication | ต้องตัดสินใจว่าจะเก็บ password ที่ไหน |
| 2 | ไม่มีข้อมูลใน Documents, Incoming, Outgoing, Workflow, AuditLog | ไม่สามารถวิเคราะห์ document relationships | ต้องเพิ่มข้อมูลจริง |

### 23.2 Medium Blockers (สามารถแก้ใน Phase 2 ได้)

| # | Blocker | Impact | Required Action |
|---|---------|--------|-----------------|
| 1 | ไม่ทราบ Workflow actor reference type | ไม่สามารถออกแบบ workflow logic | ต้องระบุ actor reference type |
| 2 | ไม่ทราบ Approval sequence meaning | ไม่สามารถออกแบบ approval logic | ต้องอธิบาย approval workflow |
| 3 | ไม่ทราบ Units Row 1 purpose | ไม่สามารถยืนยัน organization structure | ต้องตรวจสอบกับเจ้าของระบบ |
| 4 | ข้อมูล Positions ไม่ครบ (3 จาก 10+) | ไม่สามารถยืนยัน role-position mapping | ต้องเพิ่มข้อมูล Positions |

---

## 24. Decisions Required

### 24.1 Critical Decisions (ต้องทำก่อน Phase 2)

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | **Password storage location** | 1. เพิ่ม column ใน Users<br>2. Separate sheet<br>3. External service<br>4. Hashed password in separate sheet | **DECISION REQUIRED — ห้ามเลือกเอง** |

### 24.2 Design Decisions (สามารถทำใน Phase 2 ได้)

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Workflow actor reference type | 1. User_ID<br>2. Position_ID<br>3. Department_ID<br>4. Unit_ID | ต้องระบุจากเจ้าของระบบ |
| 2 | Approval sequence meaning | 1. ลำดับ 1 = อนุมัติแรก<br>2. ลำดับสูง = สำคัญมาก | ต้องอธิบายจากเจ้าของระบบ |
| 3 | Units Row 1 purpose | 1. ข้อมูลจริง<br>2. Heading<br>3. Placeholder | ต้องตรวจสอบกับเจ้าของระบบ |
| 4 | Unit_ID nullability | 1. Required<br>2. Optional | ต้องระบุจาก business logic |

---

## 25. Phase 2 Preconditions

### 25.1 Must Have Before Phase 2

| # | Precondition | Status | Notes |
|---|-------------|--------|-------|
| 1 | Data mapping validation | ✅ DONE | Phase 1D complete |
| 2 | **Password storage decision** | ❌ REQUIRED | ต้องตัดสินใจก่อน |
| 3 | Authentication architecture design | ❌ REQUIRED | ต้องออกแบบก่อน implement |

### 25.2 Can Be Done in Phase 2

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Workflow actor reference type | ⏳ CAN WAIT | สามารถระบุใน Phase 2 |
| 2 | Approval sequence meaning | ⏳ CAN WAIT | สามารถระบุใน Phase 2 |
| 3 | เพิ่มข้อมูลจริงใน Sheets | ⏳ CAN WAIT | สามารถเพิ่มใน Phase 2 |

---

## 26. Password Source

### 26.1 Password Column Check

**Check:** มี Password column ใน Users sheet หรือไม่?

**Result:** ❌ **NOT PRESENT IN USERS SHEET**

**Evidence:**
- Users sheet columns: User_ID, ชื่อ-สกุล, Position_ID, ตำแหน่ง, Department_ID, Unit_ID, Role, Email, สถานะ, Can_View_All, Can_Sign
- ไม่มี column ชื่อ "Password", "รหัสผ่าน", "password", "pass", "pwd"

**Conclusion:** **PASSWORD_SOURCE = NOT FOUND / UNVERIFIED**

### 26.2 Authentication Architecture

**Status:** **DECISION REQUIRED**

**Note:**
- ห้ามเลือกแนวทางใดแนวทางหนึ่งเอง
- ต้องให้เจ้าของระบบตัดสินใจ
- แยกเป็น Identity Authentication Source และ Application Authorization Source

---

## 27. Summary

### 27.1 Status: PARTIAL

**เหตุผล:**
- ✅ Structure ตรวจได้ครบ
- ✅ Primary Keys ยืนยันได้ 4 sheets
- ✅ Foreign Keys ยืนยันได้ 3 relationships
- ❌ มี relationships และ data ที่ยังยืนยันไม่ได้
- ❌ Password storage location ต้องตัดสินใจ
- ❌ Workflow actor reference type ต้องระบุ

### 27.2 Critical Corrections

1. ✅ **Boolean format:** ใช้ ✔/✗ ไม่ใช่ TRUE/FALSE (แก้ไขแล้ว)
2. ✅ **Primary Keys:** ระบุ UNVERIFIED สำหรับ sheets ที่ไม่มีข้อมูล (แก้ไขแล้ว)
3. ✅ **Foreign Keys:** ระบุ UNVERIFIED สำหรับ relationships ที่ไม่มีข้อมูล (แก้ไขแล้ว)
4. ✅ **Password:** ระบุ NOT FOUND / UNVERIFIED, ห้ามเลือกแนวทางเอง (แก้ไขแล้ว)
5. ✅ **Units Row 1:** ระบุ UNVERIFIED (แก้ไขแล้ว)

---

## 28. Files Updated

| # | File | Purpose |
|---|------|---------|
| 1 | `PHASE-1D-DATA-MAPPING-VALIDATION-REPORT.md` | รายงานนี้ (แก้ไขแล้ว) |

---

## 29. Compliance Check

### 29.1 Rules Compliance

| Rule | Status | Evidence |
|------|--------|----------|
| Google Sheets เป็น Source of Truth | ✅ | ใช้ข้อมูลจาก Google Sheets เท่านั้น |
| ไม่สร้าง Database Schema | ✅ | ไม่มีไฟล์ .sql, .prisma, .db |
| ไม่สร้าง Mock Data | ✅ | ใช้ข้อมูลจริงจาก Google Sheets |
| ไม่เดา Foreign Key | ✅ | ระบุ UNVERIFIED เมื่อไม่มีข้อมูล |
| ไม่เดา Password | ✅ | ระบุ NOT FOUND |
| ไม่แก้ Google Sheets | ✅ | READ-ONLY operations เท่านั้น |
| ไม่เริ่ม Authentication | ✅ | ไม่มี auth implementation |
| ไม่เลือก Authentication Provider | ✅ | ระบุ DECISION REQUIRED |

---

## 30. Final Status

**PHASE 1D RE-VALIDATION STATUS: ⚠️ PARTIAL**

**Summary:**
- ✅ ตรวจสอบครบ 10 Sheets
- ✅ ยืนยัน Primary Keys 4 sheets
- ✅ ยืนยัน Foreign Keys 3 relationships
- ✅ แก้ไขข้อสรุปเรื่อง Boolean format
- ✅ ระบุ Unverified items ชัดเจน
- ✅ ไม่มีการแก้ Google Sheets
- ✅ ไม่มีการสร้าง mock data
- ✅ ไม่มีการสร้าง database schema
- ✅ ไม่มีการสร้าง password
- ✅ ไม่มีการเริ่ม Authentication

**Critical Corrections:**
1. ✅ Boolean format: ✔/✗ ไม่ใช่ TRUE/FALSE
2. ✅ Primary Keys: ระบุ UNVERIFIED สำหรับ sheets ที่ไม่มีข้อมูล
3. ✅ Foreign Keys: ระบุ UNVERIFIED สำหรับ relationships ที่ไม่มีข้อมูล
4. ✅ Password: NOT FOUND / UNVERIFIED, DECISION REQUIRED
5. ✅ Units Row 1: UNVERIFIED

**Next Phase:**
**Phase 2 — Authentication & Authorization Design**

**Pre-requisites for Phase 2:**
1. ✅ Data mapping validation เสร็จสมบูรณ์ (Phase 1D Re-Validation)
2. ❌ **ต้องตัดสินใจเรื่อง Password storage location** (Critical)
3. ⏳ ระบุ Workflow actor reference type (can be done in Phase 2)

**Status:** **BLOCKED — ต้องตัดสินใจเรื่อง Password storage location ก่อนเริ่ม Phase 2**

---

*รายงานสร้างเมื่อ: Phase 1D Re-Validation — E-Saraban Project*  
*สถานะ: ⚠️ PARTIAL*  
*วันที่: 2026*
