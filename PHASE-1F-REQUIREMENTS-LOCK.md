# Phase 1F — Requirements Lock

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DESIGN COMPLETE

---

## 1. Executive Summary

เอกสารนี้สรุป Requirements ทั้งหมดของระบบ E-Saraban โดยแบ่งเป็น 4 ประเภท:

1. **LOCKED** — ยืนยันแล้ว ห้ามเปลี่ยนแปลง
2. **OPEN** — ต้องตัดสินใจจาก Project Owner
3. **UNVERIFIED** — ยังไม่มีหลักฐานเพียงพอ
4. **BLOCKING** — ทำให้ Phase 2 ยังเริ่มไม่ได้

---

## 2. LOCKED Requirements

### 2.1 Source of Truth

**LOCKED:** Google Sheets 10 Sheets เป็น Source of Truth

```
1. Users
2. Positions
3. Departments
4. Units
5. Documents
6. Incoming
7. Outgoing
8. Workflow
9. Signatures
10. AuditLog
```

**ห้าม:**
- ❌ สร้าง Database Schema ใหม่เพื่อแทน Google Sheets
- ❌ แก้ไขข้อมูลใน Google Sheets
- ❌ เพิ่ม Column ใน Google Sheets
- ❌ ลบข้อมูลใน Google Sheets

---

### 2.2 Architecture Principles

**LOCKED:**

1. **Authentication vs Authorization Separation**
   - Authentication: พิสูจน์ตัวตน
   - Authorization: ตรวจสอบสิทธิ์
   - แยกกันชัดเจน

2. **Fail-Closed Principle**
   - หากไม่สามารถตรวจสอบ authorization ได้ → DENY
   - ห้าม bypass authorization
   - ห้าม allow all

3. **Server-Side Enforcement**
   - Authorization ต้องตรวจสอบฝั่ง server
   - Frontend ไม่สามารถ bypass ได้

4. **No Secrets in Frontend**
   - ❌ ไม่มี credentials ใน frontend
   - ❌ ไม่มี API keys ใน frontend
   - ❌ ไม่มี service account keys ใน frontend

---

### 2.3 Confirmed Data Structure

**LOCKED:**

#### Users Sheet
```
- User_ID (Primary Key) — CONFIRMED
- ชื่อ-สกุล
- Position_ID (Foreign Key → Positions) — CONFIRMED
- ตำแหน่ง (Denormalized)
- Department_ID (Foreign Key → Departments) — CONFIRMED
- Unit_ID (Foreign Key → Units) — LIKELY
- Role (Enum: MAYOR, CLERK, OFFICE_HEAD, DIVISION_HEAD, STAFF_HEAD, STAFF, ADMIN)
- Email
- สถานะ (Enum: ใช้งาน)
- Can_View_All (Boolean: ✔/✗)
- Can_Sign (Boolean: ✔/✗)
```

#### Confirmed Primary Keys
```
Users.User_ID — CONFIRMED
Positions.Position_ID — CONFIRMED
Departments.Department_ID — CONFIRMED
Signatures.Signature_ID — CONFIRMED
```

#### Confirmed Foreign Keys
```
Users.Position_ID → Positions.Position_ID — CONFIRMED
Users.Department_ID → Departments.Department_ID — CONFIRMED
Signatures.User_ID → Users.User_ID — CONFIRMED
```

---

### 2.4 Confirmed Roles

**LOCKED:**

```
1. MAYOR — นายกเทศมนตรี
2. CLERK — ปลัดเทศบาล
3. OFFICE_HEAD — หัวหน้าสำนักปลัด
4. DIVISION_HEAD — ผู้อำนวยการกอง
5. STAFF_HEAD — หัวหน้างาน
6. STAFF — เจ้าหน้าที่
7. ADMIN — ธุรการกลาง
```

**ห้าม:**
- ❌ เพิ่ม Role ใหม่
- ❌ ลบ Role ที่มีอยู่
- ❌ เปลี่ยนชื่อ Role

---

### 2.5 Security Requirements

**LOCKED:**

#### Secrets Protection
```
✅ ไม่อยู่ frontend
✅ ไม่อยู่ Git
✅ ไม่อยู่ Google Sheets
✅ ไม่ hard-code
✅ Google Service Account — Server-side only
```

#### Password Security (If Application-Managed)
```
✅ ห้ามเก็บ plaintext
✅ ต้องใช้ salted hash
✅ ต้องมี rate limiting
✅ ต้องป้องกัน brute force
✅ ต้องมี password reset ที่ปลอดภัย
```

#### Authorization Security
```
✅ Server-side enforcement
✅ Fail-closed principle
✅ Audit log สำหรับ critical actions
```

---

### 2.6 Password Security Requirement

**LOCKED:**

```
Password Security Requirements:
✅ ห้ามเก็บ password แบบ plaintext
✅ ห้าม hard-code password
✅ ห้ามใส่ password ลงใน Google Sheets Users
✅ ห้ามแสดง password ใน log
✅ Password Source: NOT FOUND / UNVERIFIED
✅ Password Column in Users Sheet: NOT PRESENT
```

**ห้าม:**
- ❌ สร้าง Password Column ใน Google Sheets
- ❌ สร้าง Password Sheet ใน Google Sheets
- ❌ ใช้ Email เป็น Password
- ❌ ใช้ User_ID เป็น Password
- ❌ Hard-code password ใน source code
- ❌ เก็บ password ใน Git repository

---

## 3. OPEN Requirements

### 3.1 Authentication Architecture

**OPEN — ต้องตัดสินใจจาก Project Owner:**

| ID | Requirement | Status | Owner |
|----|-------------|--------|-------|
| ADR-001 | Authentication Provider | OPEN | Project Owner |
| ADR-002 | Password Management Architecture | OPEN | Project Owner |
| ADR-003 | Identity Mapping | OPEN | Project Owner |
| ADR-004 | MFA | OPEN | Project Owner |
| ADR-008 | Authentication Budget | OPEN | Project Owner |

**Password Management Architecture — OPEN:**

คำถาม: Password จะถูกจัดการโดยใคร/ที่ไหน?

ทางเลือก:
1. External Identity Provider (Google, Microsoft, Auth0, Firebase)
2. Platform Authentication
3. Application-managed Authentication

**หมายเหตุ:** Password Security Requirement (ห้าม plaintext, ห้าม hard-code) เป็น LOCKED แล้ว แต่ Password Management Architecture (จะจัดการโดยใคร) ยังเป็น OPEN

---

### 3.2 Authorization Rules

**OPEN — ต้องตัดสินใจจาก Project Owner:**

| ID | Requirement | Status | Owner |
|----|-------------|--------|-------|
| ADR-005 | Role Permissions | OPEN | Project Owner |
| ADR-006 | Can_View_All Scope | OPEN | Project Owner |
| ADR-007 | Can_Sign Scope | OPEN | Project Owner |

---

### 3.3 Business Rules

**OPEN — ต้องตัดสินใจจาก Project Owner:**

| ID | Requirement | Status | Owner |
|----|-------------|--------|-------|
| BR-001 | Workflow Actor Reference | OPEN | Project Owner |
| BR-002 | Approval Sequence Meaning | OPEN | Project Owner |
| BR-003 | Units Row 1 Purpose | OPEN | Project Owner |
| BR-004 | Unit_ID Nullability | OPEN | Project Owner |

---

## 4. UNVERIFIED Requirements

### 4.1 Data Relationships

**UNVERIFIED — ยังไม่มีหลักฐานเพียงพอ:**

| Relationship | Status | Reason |
|-------------|--------|--------|
| Users.Unit_ID → Units.Unit_ID | LIKELY | Row 1 blank, many blank values |
| Documents.Incoming_ID → Incoming.Incoming_ID | UNVERIFIED | No data |
| Documents.Outgoing_ID → Outgoing.Outgoing_ID | UNVERIFIED | No data |
| Incoming.Document_ID → Documents.Document_ID | UNVERIFIED | No data |
| Outgoing.Document_ID → Documents.Document_ID | UNVERIFIED | No data |
| Workflow.Document_ID → Documents.Document_ID | UNVERIFIED | No data |
| Workflow.จากผู้ดำเนินการ → ? | UNVERIFIED | Unknown reference type |
| Workflow.ถึงผู้ดำเนินการ → ? | UNVERIFIED | Unknown reference type |
| AuditLog.Document_ID → Documents.Document_ID | UNVERIFIED | No data |

---

### 4.2 Data Issues

**UNVERIFIED — ต้องตรวจสอบ:**

| Issue | Status | Reason |
|-------|--------|--------|
| Units Row 1 | UNVERIFIED | ไม่ทราบว่าคือข้อมูลจริง, heading, placeholder หรือข้อมูลผิดรูปแบบ |
| Users.Unit_ID blanks | UNVERIFIED | 6 จาก 8 users มี Unit_ID ว่างเปล่า |
| Positions data completeness | UNVERIFIED | มีข้อมูลเพียง 3 records จาก 10+ |

---

### 4.3 Business Logic

**UNVERIFIED — ต้องมีหลักฐานเพิ่มเติม:**

| Item | Status | Reason |
|------|--------|--------|
| Workflow Actor Reference | UNVERIFIED | ไม่มีข้อมูลจริงใน Workflow sheet |
| Approval Sequence Meaning | UNVERIFIED | ไม่มี documentation |
| Can_View_All Exact Scope | UNVERIFIED | ต้องตัดสินใจจาก Project Owner |
| Can_Sign Exact Scope | UNVERIFIED | ต้องตัดสินใจจาก Project Owner |

---

## 5. BLOCKING Requirements

### 5.1 Phase 2 Blockers

**BLOCKING — ต้องตัดสินใจก่อนเริ่ม Phase 2:**

| ID | Requirement | Status | Impact |
|----|-------------|--------|--------|
| ADR-001 | Authentication Provider | OPEN | BLOCKING |
| ADR-002 | Password Management | OPEN | BLOCKING |
| ADR-003 | Identity Mapping | OPEN | BLOCKING |
| ADR-005 | Role Permissions | OPEN | BLOCKING |
| ADR-006 | Can_View_All Scope | OPEN | BLOCKING |
| ADR-007 | Can_Sign Scope | OPEN | BLOCKING |

---

### 5.2 Phase 2 Gate

**Phase 2 จะเริ่มได้เมื่อ:**

```
Authentication Provider        = DECIDED
Password Management            = DECIDED
Identity Mapping               = DECIDED
Role Permission                = DECIDED
Can_View_All Scope             = DECIDED
Can_Sign Scope                 = DECIDED
```

**Current Status:** ALL OPEN → **Phase 2 BLOCKED**

---

## 6. IMPLEMENTATION LATER

### 6.1 Can Be Implemented After Decisions

**ทราบแนวทางแล้ว แต่ยังไม่ implement:**

| Item | Status | Notes |
|------|--------|-------|
| Session implementation | IMPLEMENTATION LATER | ต้องตัดสินใจ authentication ก่อน |
| Login UI | IMPLEMENTATION LATER | ต้องตัดสินใจ authentication ก่อน |
| Login API | IMPLEMENTATION LATER | ต้องตัดสินใจ authentication ก่อน |
| Authorization middleware | IMPLEMENTATION LATER | ต้องตัดสินใจ permissions ก่อน |
| Audit events | IMPLEMENTATION LATER | ต้องตัดสินใจ audit requirements ก่อน |
| Password reset | IMPLEMENTATION LATER | ต้องตัดสินใจ password management ก่อน |

---

## 7. Requirements Summary

### 7.1 By Category

| Category | LOCKED | OPEN | UNVERIFIED | BLOCKING |
|----------|-------:|-----:|-----------:|---------:|
| Source of Truth | 1 | 0 | 0 | 0 |
| Architecture | 4 | 0 | 0 | 0 |
| Data Structure | 7 | 0 | 9 | 0 |
| Roles | 7 | 0 | 0 | 0 |
| Security | 6 | 0 | 0 | 0 |
| Password Security | 1 | 0 | 0 | 0 |
| Password Management | 0 | 1 | 0 | 1 |
| Authentication | 0 | 4 | 0 | 4 |
| Authorization | 0 | 3 | 0 | 3 |
| Business Rules | 0 | 4 | 4 | 0 |
| **Total** | **26** | **12** | **13** | **8** |

**หมายเหตุ:** แยก Password เป็น 2 ส่วน:
- Password Security (LOCKED) = ข้อกำหนดความปลอดภัยที่ห้าม plaintext, ห้าม hard-code
- Password Management (OPEN) = การตัดสินใจว่าจะจัดการ password โดยใคร/ที่ไหน

---

### 7.2 By Priority

| Priority | Count | Description |
|----------|------:|-------------|
| Critical (Blocking) | 8 | ต้องตัดสินใจก่อน Phase 2 |
| High (Open) | 4 | ควรตัดสินใจเร็วๆ |
| Medium (Unverified) | 13 | ต้องมีหลักฐานเพิ่มเติม |
| Low (Implementation Later) | 6 | ทราบแนวทางแล้ว |

---

## 8. Decision Required Summary

### 8.1 Must Decide Before Phase 2

| # | Decision | ADR | Impact |
|---|----------|-----|--------|
| 1 | Authentication Provider | ADR-001 | BLOCKING |
| 2 | Password Management | ADR-002 | BLOCKING |
| 3 | Identity Mapping | ADR-003 | BLOCKING |
| 4 | Role Permissions | ADR-005 | BLOCKING |
| 5 | Can_View_All Scope | ADR-006 | BLOCKING |
| 6 | Can_Sign Scope | ADR-007 | BLOCKING |

### 8.2 Should Decide Soon

| # | Decision | ADR | Impact |
|---|----------|-----|--------|
| 1 | MFA | ADR-004 | HIGH |
| 2 | Authentication Budget | ADR-008 | MEDIUM |
| 3 | Workflow Actor Reference | BR-001 | HIGH |
| 4 | Approval Sequence Meaning | BR-002 | HIGH |

### 8.3 Can Decide Later

| # | Decision | ADR | Impact |
|---|----------|-----|--------|
| 1 | Units Row 1 Purpose | BR-003 | LOW |
| 2 | Unit_ID Nullability | BR-004 | LOW |

---

## 9. Compliance Check

### 9.1 Rules Compliance

| Rule | Status | Evidence |
|------|--------|----------|
| Google Sheets เป็น Source of Truth | ✅ | LOCKED |
| ไม่สร้าง Database Schema | ✅ | LOCKED |
| ไม่สร้าง Mock Data | ✅ | LOCKED |
| ไม่เดา Foreign Key | ✅ | UNVERIFIED ระบุชัดเจน |
| ไม่เดา Password | ✅ | LOCKED — NOT FOUND |
| ไม่แก้ Google Sheets | ✅ | LOCKED |
| ไม่เริ่ม Authentication | ✅ | OPEN — ต้องตัดสินใจ |
| ไม่เลือก Provider แทน Owner | ✅ | OPEN — Project Owner ตัดสินใจ |

---

## 10. Next Steps

### 10.1 Before Phase 2

1. **Project Owner ตัดสินใจ:**
   - ADR-001: Authentication Provider
   - ADR-002: Password Management
   - ADR-003: Identity Mapping
   - ADR-005: Role Permissions
   - ADR-006: Can_View_All Scope
   - ADR-007: Can_Sign Scope

2. **บันทึกการตัดสินใจ:**
   - กรอก `PHASE-1F-PROJECT-OWNER-DECISIONS.md`
   - ลงชื่อและวันที่

3. **อัปเดต ADR:**
   - เปลี่ยน Status จาก OPEN เป็น APPROVED
   - บันทึกการตัดสินใจใน ADR

### 10.2 After Decisions

1. **เริ่ม Phase 2:**
   - Authentication Implementation
   - Authorization Implementation
   - Login UI
   - Login API

2. **Resolve Unverified Items:**
   - เพิ่มข้อมูลจริงใน Sheets ที่ว่าง
   - ตรวจสอบ Units Row 1
   - ยืนยัน Workflow Actor Reference
   - ยืนยัน Approval Sequence

---

## 11. Summary

**PHASE 1F REQUIREMENTS LOCK STATUS: ✅ COMPLETE**

**Summary:**
- ✅ LOCKED: 26 requirements (ยืนยันแล้ว)
- ⏳ OPEN: 12 requirements (ต้องตัดสินใจ)
- ❓ UNVERIFIED: 13 requirements (ต้องมีหลักฐาน)
- 🚫 BLOCKING: 8 requirements (ทำให้ Phase 2 BLOCKED)

**Phase 2 Status:** BLOCKED

**Reason:** ต้องตัดสินใจเรื่อง Authentication Architecture และ Authorization Rules ก่อน

---

*รายงานสร้างเมื่อ: Phase 1F — E-Saraban Project*  
*สถานะ: ✅ COMPLETE*  
*วันที่: 2026*
