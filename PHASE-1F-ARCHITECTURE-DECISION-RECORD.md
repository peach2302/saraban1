# Phase 1F — Architecture Decision Record (ADR)

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DESIGN / DECISION PREPARATION ONLY

---

## 1. Executive Summary

Phase 1F รวบรวมข้อมูลทั้งหมดจาก Phase 1A–1E มาจัดทำ Architecture Decision Record (ADR) เพื่อเตรียมพร้อมก่อน Phase 2 Implementation

**สถานะ:** ✅ DESIGN COMPLETE

**ADR ทั้งหมด:** 8 รายการ (ADR-001 ถึง ADR-008)

**สถานะของ ADR ทั้งหมด:** OPEN — ต้องรอ Project Owner ตัดสินใจ

---

## 2. Current Verified Architecture

### 2.1 Source of Truth

**Google Sheets 10 Sheets เป็น Source of Truth:**

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

### 2.2 Confirmed Relationships

```
Users.Position_ID → Positions.Position_ID  [CONFIRMED]
Users.Department_ID → Departments.Department_ID  [CONFIRMED]
Signatures.User_ID → Users.User_ID  [CONFIRMED]
```

### 2.3 Unverified Relationships

```
Users.Unit_ID → Units.Unit_ID  [LIKELY]
Documents.Incoming_ID → Incoming.Incoming_ID  [UNVERIFIED]
Documents.Outgoing_ID → Outgoing.Outgoing_ID  [UNVERIFIED]
Incoming.Document_ID → Documents.Document_ID  [UNVERIFIED]
Outgoing.Document_ID → Documents.Document_ID  [UNVERIFIED]
Workflow.Document_ID → Documents.Document_ID  [UNVERIFIED]
Workflow.จากผู้ดำเนินการ → ?  [UNVERIFIED]
Workflow.ถึงผู้ดำเนินการ → ?  [UNVERIFIED]
AuditLog.Document_ID → Documents.Document_ID  [UNVERIFIED]
```

### 2.4 Authentication Situation

```
Password Source: NOT FOUND / UNVERIFIED
Password Column in Users Sheet: NOT PRESENT
Authentication System: NOT IMPLEMENTED
```

---

## 3. Decision Register

| ID | Decision | Status | Owner | Blocking |
|----|----------|--------|-------|----------|
| ADR-001 | Authentication Provider | **✅ DECIDED** | Project Owner | NO |
| ADR-002 | Password Management | **OPEN** | Project Owner | YES |
| ADR-003 | Identity Mapping | **OPEN** | Project Owner | YES |
| ADR-004 | MFA | **OPEN** | Project Owner | YES/NO |
| ADR-005 | Role Permissions | **OPEN** | Project Owner | YES |
| ADR-006 | Can_View_All Scope | **OPEN** | Project Owner | YES |
| ADR-007 | Can_Sign Scope | **OPEN** | Project Owner | YES |
| ADR-008 | Authentication Budget | **OPEN** | Project Owner | NO |

---

## 4. ADR-001: Authentication Provider

### 4.1 Context

ระบบ E-Saraban ต้องมีระบบ Authentication สำหรับพิสูจน์ตัวตนผู้ใช้งาน ปัจจุบันยังไม่มี authentication system ใดๆ

### 4.2 Decision

**Status:** ✅ DECIDED

**Decision:** APPLICATION-MANAGED AUTHENTICATION

**Owner:** PROJECT OWNER

**Date:** 2026

**Implementation Status:** NOT IMPLEMENTED

### 4.3 Options Analysis

#### Option A: External Identity Provider

**Examples:**
- Google Identity / Google Workspace
- Microsoft Entra ID (Azure AD)
- Auth0
- Firebase Authentication

| Aspect | Description |
|--------|-------------|
| Security Responsibility | Provider รับผิดชอบ |
| Password Management | Provider จัดการ |
| MFA | พร้อมใช้ |
| Password Reset | Provider จัดการ |
| Integration Complexity | ปานกลาง |
| Operational Complexity | ต่ำ |
| Cost | อาจมีค่าใช้จ่ายตาม usage |
| Vendor Dependency | สูง |
| Scalability | สูง |
| Maintenance | ต่ำ |

**Pros:**
- ✅ ไม่ต้องจัดการ password เอง
- ✅ มี MFA พร้อมใช้
- ✅ Security ดี
- ✅ User experience ดี (SSO)

**Cons:**
- ⚠️ พึ่งพา third-party
- ⚠️ อาจมีค่าใช้จ่าย
- ⚠️ ต้อง integrate
- ⚠️ ต้องจัดการ mapping กับ Users Sheet

---

#### Option B: Platform Authentication

**Examples:**
- Built-in authentication ของ hosting platform
- Authentication ที่แพลตฟอร์ม Frontend มีอยู่แล้ว

| Aspect | Description |
|--------|-------------|
| Security Responsibility | Platform รับผิดชอบ |
| Password Management | Platform จัดการ |
| MFA | ขึ้นอยู่กับ platform |
| Password Reset | Platform จัดการ |
| Integration Complexity | ต่ำ |
| Operational Complexity | ต่ำ |
| Cost | อาจฟรี/รวมอยู่ใน platform |
| Vendor Dependency | สูง |
| Scalability | ขึ้นอยู่กับ platform |
| Maintenance | ต่ำมาก |

**Pros:**
- ✅ Integration ง่าย
- ✅ Cost ต่ำ
- ✅ Maintenance ต่ำ

**Cons:**
- ⚠️ พึ่งพา platform
- ⚠️ Features จำกัด
- ⚠️ อาจไม่ยืดหยุ่น

---

#### Option C: Application-Managed Authentication

**Description:**
- ระบบจัดการ authentication เอง
- เก็บ password hash ในระบบที่เหมาะสม

| Aspect | Description |
|--------|-------------|
| Security Responsibility | Application รับผิดชอบ |
| Password Management | Application จัดการ |
| MFA | ต้อง implement เอง |
| Password Reset | Application จัดการ |
| Integration Complexity | สูง |
| Operational Complexity | สูง |
| Cost | Development cost สูง |
| Vendor Dependency | ต่ำ |
| Scalability | ขึ้นอยู่กับ implementation |
| Maintenance | สูง |

**Pros:**
- ✅ ควบคุมได้ทั้งหมด
- ✅ ไม่ต้องพึ่งพา third-party
- ✅ ยืดหยุ่นสูง

**Cons:**
- ⚠️ ต้อง implement เองทั้งหมด
- ⚠️ Security responsibility สูง
- ⚠️ Development cost สูง
- ⚠️ ต้องจัดการ password security เอง

---

### 4.4 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. จะใช้ authentication option ไหน?
2. ยอมรับ vendor dependency หรือไม่?
3. มี budget สำหรับ authentication หรือไม่?

---

## 5. ADR-002: Password Management Architecture

### 5.1 Context

Users Sheet ไม่มี Password Column ต้องตัดสินใจว่าจะจัดการ password อย่างไร

**หมายเหตุสำคัญ:** แยก 2 เรื่องออกจากกัน:
1. **Password Security Requirement (LOCKED)** — ข้อกำหนดความปลอดภัยที่ห้าม plaintext, ห้าม hard-code
2. **Password Management Architecture (OPEN)** — การตัดสินใจว่าจะจัดการ password โดยใคร/ที่ไหน

### 5.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

**Scope:** การตัดสินใจว่าจะจัดการ password โดยใคร/ที่ไหน (ไม่ใช่ข้อกำหนดความปลอดภัย)

### 5.3 Options

#### Option 1: Authentication Provider จัดการ

- External IdP จัดการ password ทั้งหมด
- Application ไม่ต้องจัดการ password

#### Option 2: Platform จัดการ

- Platform จัดการ password
- Application ไม่ต้องจัดการ password

#### Option 3: Application จัดการ

- Application จัดการ password เอง
- ต้องมี password security requirements

### 5.4 Password Security Requirements (If Application-Managed)

**Must Have:**
- ❌ ห้ามเก็บ password plaintext
- ✅ ต้องใช้ password hashing algorithm ที่เหมาะสม (bcrypt, Argon2, etc.)
- ✅ ต้องใช้ salted hash
- ✅ ต้องมี rate limiting
- ✅ ต้องป้องกัน brute force
- ✅ ต้องมี password reset ที่ปลอดภัย
- ❌ credentials ต้องไม่อยู่ใน frontend
- ❌ credentials ต้องไม่อยู่ใน source code
- ❌ credentials ต้องไม่อยู่ใน Git
- ❌ credentials ต้องไม่อยู่ใน Google Sheets แบบ plaintext

### 5.5 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. ใครจะรับผิดชอบ password management?
2. ถ้า application-managed จะใช้ password policy อะไร?

---

## 6. ADR-003: Identity Mapping

### 6.1 Context

ต้องตัดสินใจว่าจะ map authenticated identity กับ Users Sheet อย่างไร

### 6.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 6.3 Options

#### Option A: Email-based Mapping

```
Authenticated Email
        ↓
Users.Email
        ↓
Users.User_ID
```

| Aspect | Description |
|--------|-------------|
| Complexity | ต่ำ |
| Stability | Email อาจเปลี่ยน |
| Implementation | ง่าย |
| Data Migration | ไม่จำเป็น |

**Pros:**
- ✅ เข้าใจง่าย
- ✅ ใช้กับระบบเดิมง่าย
- ✅ ไม่ต้องเพิ่ม column

**Cons:**
- ⚠️ Email อาจเปลี่ยน
- ⚠️ ต้องจัดการ duplicate email
- ⚠️ ต้องตรวจ verified email

---

#### Option B: Stable Subject Mapping

```
Provider Subject
        ↓
Stable Identity
        ↓
Users.User_ID
```

| Aspect | Description |
|--------|-------------|
| Complexity | ปานกลาง |
| Stability | Stable |
| Implementation | ต้องเพิ่ม column |
| Data Migration | ต้อง migrate |

**Pros:**
- ✅ Stable identifier
- ✅ ไม่เปลี่ยนตาม email

**Cons:**
- ⚠️ ต้องเพิ่ม column ใน Users Sheet
- ⚠️ ต้อง migrate ข้อมูล
- ⚠️ ขัดกับข้อกำหนด "ห้ามแก้ Google Sheets"

---

### 6.4 Impact on Source of Truth

**Option A (Email-based):**
- ✅ ไม่กระทบ Source of Truth
- ✅ ใช้ Users.Email ที่มีอยู่แล้ว

**Option B (Subject-based):**
- ⚠️ ต้องเพิ่ม column ใน Users Sheet
- ⚠️ ขัดกับข้อกำหนด "ห้ามแก้ Google Sheets"
- ⚠️ ต้องขอ approval จาก Project Owner

### 6.5 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. จะใช้ Email-based หรือ Subject-based?
2. ถ้าใช้ Subject-based ยอมให้เพิ่ม column ใน Users Sheet หรือไม่?

---

## 7. ADR-004: MFA (Multi-Factor Authentication)

### 7.1 Context

ต้องตัดสินใจว่าจะใช้ MFA หรือไม่

### 7.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 7.3 Options

#### Option 1: MFA Required

| Aspect | Description |
|--------|-------------|
| Security | สูง |
| User Experience | ซับซ้อนขึ้น |
| Implementation | ต้องรองรับ MFA |
| Cost | อาจมีค่าใช้จ่าย |
| Risk | ลดความเสี่ยง credential theft |

**Pros:**
- ✅ Security สูง
- ✅ ป้องกัน credential theft
- ✅ เหมาะสำหรับข้อมูลสำคัญ

**Cons:**
- ⚠️ User experience ซับซ้อน
- ⚠️ อาจมีค่าใช้จ่าย
- ⚠️ ต้องมี MFA device

---

#### Option 2: MFA Not Required

| Aspect | Description |
|--------|-------------|
| Security | ปานกลาง |
| User Experience | ง่าย |
| Implementation | ง่าย |
| Cost | ต่ำ |
| Risk | ความเสี่ยงสูงกว่า |

**Pros:**
- ✅ User experience ง่าย
- ⚠️ Implementation ง่าย
- ✅ Cost ต่ำ

**Cons:**
- ⚠️ Security ต่ำกว่า
- ⚠️ ความเสี่ยง credential theft

---

#### Option 3: MFA Conditional

| Aspect | Description |
|--------|-------------|
| Security | ปรับตามความเสี่ยง |
| User Experience | ปรับตามบทบาท |
| Implementation | ซับซ้อน |
| Cost | ปานกลาง |
| Risk | ปรับตามบทบาท |

**Description:**
- MFA สำหรับบทบาทสำคัญ (MAYOR, CLERK)
- ไม่จำเป็นสำหรับบทบาทอื่น

### 7.4 Considerations

**Risk Factors:**
- ประเภทข้อมูลในระบบ (ข้อมูลราชการสำคัญ)
- ผู้ใช้ (เจ้าหน้าที่เทศบาล)
- หน่วยงาน (เทศบาลตำบลป่งไฮ)

**Provider Support:**
- External IdP: รองรับ MFA
- Platform: ขึ้นอยู่กับ platform
- Application-managed: ต้อง implement เอง

### 7.5 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. จะใช้ MFA หรือไม่?
2. ถ้าใช้ จะใช้แบบ Required, Not Required, หรือ Conditional?

---

## 8. ADR-005: Role Permissions

### 8.1 Context

ต้องกำหนด permission matrix สำหรับแต่ละ role

### 8.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 8.3 Confirmed Roles

| Role | Description | Count |
|------|-------------|------:|
| MAYOR | นายกเทศมนตรี | 1 |
| CLERK | ปลัดเทศบาล | 1 |
| OFFICE_HEAD | หัวหน้าสำนักปลัด | 1 |
| DIVISION_HEAD | ผู้อำนวยการกอง | 2 |
| STAFF_HEAD | หัวหน้างาน | 1 |
| STAFF | เจ้าหน้าที่ | 1 |
| ADMIN | ธุรการกลาง | 1 |

### 8.4 Permission Matrix (TBD)

| Role | View | Create | Edit | Register Incoming | Register Outgoing | Route | Assign | Submit | Approve | Reject | Signature Workflow | Archive | View Audit | Manage Users | Manage Organization |
|------|------|--------|------|-------------------|-------------------|-------|--------|--------|---------|--------|-------------------|---------|------------|--------------|---------------------|
| MAYOR | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| CLERK | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| OFFICE_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DIVISION_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| ADMIN | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

**Status:** ALL TBD — ต้องตัดสินใจจาก Project Owner

### 8.5 Role ≠ Position

**Important:**
- Role ไม่ได้ผูกกับ Position แบบ hard-coded
- ใช้ข้อมูลจาก Users.Role และ Positions.Role
- หากพบ discrepancy ให้รายงานเป็น DATA DISCREPANCY

### 8.6 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. แต่ละ role มี permissions อะไรบ้าง?
2. มีข้อยกเว้นหรือไม่?
3. มี conditional permissions หรือไม่?

---

## 9. ADR-006: Can_View_All Scope

### 9.1 Context

ต้องกำหนดความหมายของ Can_View_All = ✔ และ Can_View_All = ✗

### 9.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 9.3 Current Data

| User_ID | Can_View_All | Role |
|---------|--------------|------|
| U001 | ✔ | MAYOR |
| U002 | ✔ | CLERK |
| U003 | ✗ | OFFICE_HEAD |
| U004 | ✗ | DIVISION_HEAD |
| U005 | ✗ | DIVISION_HEAD |
| U006 | ✗ | STAFF_HEAD |
| U007 | ✗ | STAFF |
| U008 | ✗ | ADMIN |

### 9.4 Scope Options

#### Option 1: ทุกเอกสาร

```
Can_View_All = ✔ → ดูเอกสารทั้งหมด (ไม่จำกัด department/unit)
Can_View_All = ✗ → ดูเฉพาะเอกสารใน department/unit ของตัวเอง
```

#### Option 2: ทุกเอกสารใน Department

```
Can_View_All = ✔ → ดูเอกสารทั้งหมดใน department ของตัวเอง
Can_View_All = ✗ → ดูเฉพาะเอกสารใน unit ของตัวเอง
```

#### Option 3: ทุกเอกสารใน Unit

```
Can_View_All = ✔ → ดูเอกสารทั้งหมดใน unit ของตัวเอง
Can_View_All = ✗ → ดูเฉพาะเอกสารของตัวเอง
```

#### Option 4: ทุกเอกสารตาม Role

```
Can_View_All = ✔ → ดูเอกสารตาม role scope
Can_View_All = ✗ → ดูเฉพาะเอกสารของตัวเอง
```

#### Option 5: Combination

```
Can_View_All = ✔ → ดูเอกสารตามหลาย scope (role + department + unit)
Can_View_All = ✗ → ดูเฉพาะเอกสารของตัวเอง
```

### 9.5 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. Can_View_All หมายถึงอะไร?
2. ใช้ scope แบบไหน?
3. มีข้อยกเว้นหรือไม่?

---

## 10. ADR-007: Can_Sign Scope

### 10.1 Context

ต้องกำหนดความหมายของ Can_Sign = ✔ และ Can_Sign = ✗

### 10.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 10.3 Current Data

| User_ID | Can_Sign | Role |
|---------|----------|------|
| U001 | ✔ | MAYOR |
| U002 | ✔ | CLERK |
| U003 | ✔ | OFFICE_HEAD |
| U004 | ✔ | DIVISION_HEAD |
| U005 | ✔ | DIVISION_HEAD |
| U006 | ✔ | STAFF_HEAD |
| U007 | ✗ | STAFF |
| U008 | ✗ | ADMIN |

### 10.4 Important Distinction

**Signature Workflow ≠ Digital Signature (ตามกฎหมาย)**

- **Signature Workflow:** กระบวนการลงนามในระบบ
- **Digital Signature:** การลงนามที่มีผลตามกฎหมาย ต้องมี Digital Signature Provider

**Current System:**
- ❌ ไม่มี Digital Signature Provider
- ❌ ไม่มี legal digital signature capability

**Therefore:**
- ใช้คำว่า "Signature Workflow" เท่านั้น
- จนกว่าจะมี Digital Signature Provider จริง

### 10.5 Scope Options

#### Option 1: Permission to Enter Signature Workflow

```
Can_Sign = ✔ → สามารถเข้าสู่ signature workflow
Can_Sign = ✗ → ไม่สามารถเข้าสู่ signature workflow
```

#### Option 2: Actual Digital Signature (ตามกฎหมาย)

```
Can_Sign = ✔ → สามารถลงนามดิจิทัล (ต้องมี provider)
Can_Sign = ✗ → ไม่สามารถลงนามดิจิทัล
```

### 10.6 Recommendation

**LIKELY:** Can_Sign หมายถึง Permission to enter signature workflow

**Reason:**
- ไม่มี Digital Signature Provider
- ใช้คำว่า "Signature Workflow" เท่านั้น

### 10.7 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. Can_Sign หมายถึงอะไร?
2. Signature Workflow หรือ Digital Signature?
3. มีข้อยกเว้นหรือไม่?

---

## 11. ADR-008: Authentication Budget

### 11.1 Context

ต้องตัดสินใจเรื่อง budget สำหรับ authentication

### 11.2 Decision

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Decision:** NOT DECIDED

**Owner:** PROJECT OWNER

### 11.3 Cost Considerations

| Option | Cost Type | Estimated Cost |
|--------|-----------|----------------|
| External IdP | Subscription | อาจมีค่าใช้จ่ายรายเดือน/รายปี |
| Platform Auth | Included | อาจรวมอยู่ใน platform |
| Application-managed | Development | Development cost สูง |

### 11.4 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. มี budget สำหรับ authentication เท่าไหร่?
2. ยอมรับค่าใช้จ่ายรายเดือน/รายปี หรือไม่?

---

## 12. Architecture Diagram

```
                   ┌─────────────────────┐
                   │ Authentication      │
                   │ Provider            │
                   └──────────┬──────────┘
                              │
                       Verified Identity
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Backend             │
                   │ Identity Resolver   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Google Sheets       │
                   │ Users               │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Authorization       │
                   │ Context             │
                   └──────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       Role              Department/Unit    Special Permission
                                                  │
                                      ┌───────────┴───────────┐
                                      ▼                       ▼
                               Can_View_All              Can_Sign
                                      │                       │
                                      └───────────┬───────────┘
                                                  ▼
                                           E-Saraban
```

---

## 13. Authentication Context Model

```
AuthenticatedIdentity
    ↓
UserResolver
    ↓
Users Sheet
    ↓
AuthorizationContext
```

**AuthorizationContext ประกอบด้วย:**
- User_ID
- Email
- Role
- Position_ID
- Department_ID
- Unit_ID
- Can_View_All
- Can_Sign
- Status

---

## 14. Authorization Rules (Principles)

```
IF identity not authenticated
    DENY

IF user not found
    DENY

IF user status not active
    DENY

IF permission not granted
    DENY

IF resource outside permitted scope
    DENY

IF document ownership/assignment fails
    DENY

IF privileged permission unavailable
    DENY
```

**Principle:** Fail Closed

---

## 15. Open Questions

### 15.1 Critical Questions

| # | Question | Status | Blocking |
|---|----------|--------|----------|
| 1 | Authentication Provider จะเป็นอะไร? | ✅ DECIDED — Application-managed | NO |
| 2 | Password จะถูกจัดการโดยใคร? | OPEN — Storage Schema PENDING | YES |
| 3 | Users.Email เป็น Identity Mapping Key หรือไม่? | OPEN — Validation PENDING | YES |
| 4 | Users.Unit_ID ต้อง Required หรือ Optional? | OPEN | NO |
| 5 | Workflow Actor เป็น User / Position / Department / Unit? | UNVERIFIED | NO |
| 6 | Approval Sequence หมายถึงอะไร? | UNVERIFIED | NO |
| 7 | Units Row 1 คืออะไร? | UNVERIFIED | NO |
| 8 | Can_View_All หมายถึงระดับใด? | OPEN | YES |
| 9 | Can_Sign หมายถึง permission ระดับใด? | OPEN | YES |
| 10 | ต้องใช้ MFA หรือไม่? | OPEN | YES/NO |

---

## 16. Summary

### 16.1 ADR Status

| ADR | Status | Owner | Blocking |
|-----|--------|-------|----------|
| ADR-001 Authentication Provider | ✅ DECIDED | Project Owner | NO |
| ADR-002 Password Management | OPEN | Project Owner | YES |
| ADR-003 Identity Mapping | OPEN | Project Owner | YES |
| ADR-004 MFA | OPEN | Project Owner | YES/NO |
| ADR-005 Role Permissions | OPEN | Project Owner | YES |
| ADR-006 Can_View_All | OPEN | Project Owner | YES |
| ADR-007 Can_Sign | OPEN | Project Owner | YES |
| ADR-008 Authentication Budget | OPEN | Project Owner | NO |

### 16.2 Phase 2 Gate

**Phase 2 จะเริ่มได้เมื่อ:**
- ADR-001 = DECIDED ✅
- ADR-002 = DECIDED ❌
- ADR-003 = DECIDED ❌
- ADR-005 = DECIDED ❌
- ADR-006 = DECIDED ❌
- ADR-007 = DECIDED ❌

**Current Status:** 1/6 DECIDED → Phase 2 BLOCKED

---

*รายงานสร้างเมื่อ: Phase 1F — E-Saraban Project*  
*สถานะ: ✅ DESIGN COMPLETE*  
*วันที่: 2026*
