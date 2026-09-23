# Phase 1E — Authentication Architecture & Security Design

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DESIGN ONLY — NO IMPLEMENTATION

---

## 1. Executive Summary

Phase 1E ดำเนินการออกแบบ Authentication Architecture และ Security Model สำหรับระบบ E-Saraban โดยอิงจากข้อมูลจริงจาก Google Sheets 10 Sheets

**สถานะ:** ✅ DESIGN COMPLETE

**ผลลัพธ์:**
- ✅ วิเคราะห์ Authentication Situation ปัจจุบัน
- ✅ วิเคราะห์ Password Source
- ✅ ออกแบบ Authentication vs Authorization separation
- ✅ ออกแบบ Identity Mapping
- ✅ วิเคราะห์ Authentication Options (ไม่เลือกเอง)
- ✅ ออกแบบ Security Requirements
- ✅ ออกแบบ Threat Model
- ✅ ระบุ Open Questions
- ✅ ระบุ Decision Points
- ✅ ไม่มีการ implement
- ✅ ไม่มีการสร้าง password
- ✅ ไม่มีการสร้าง database
- ✅ ไม่มีการเลือก authentication provider

---

## 2. Current Authentication Situation

### 2.1 Users Sheet Structure

```
Users Sheet:
- User_ID (Primary Key)
- ชื่อ-สกุล
- Position_ID (Foreign Key → Positions)
- ตำแหน่ง (Denormalized)
- Department_ID (Foreign Key → Departments)
- Unit_ID (Foreign Key → Units, Optional)
- Role (Enum: MAYOR, CLERK, OFFICE_HEAD, DIVISION_HEAD, STAFF_HEAD, STAFF, ADMIN)
- Email
- สถานะ (Enum: ใช้งาน)
- Can_View_All (Boolean: ✔/✗)
- Can_Sign (Boolean: ✔/✗)
```

### 2.2 Password Column

**Status:** ❌ **NOT PRESENT**

**Evidence:**
- ไม่มี column ชื่อ "Password", "รหัสผ่าน", "password", "pass", "pwd"
- ไม่มี sheet อื่นที่เก็บ password
- ไม่มี database schema สำหรับ password

**Conclusion:** **PASSWORD_SOURCE = NOT FOUND / UNVERIFIED**

### 2.3 Authentication Status

**Current State:**
- ❌ ไม่มี authentication system
- ❌ ไม่มี login mechanism
- ❌ ไม่มี session management
- ❌ ไม่มี token/cookie management

**Required State:**
- ✅ ต้องมี authentication system
- ✅ ต้องมี login mechanism
- ✅ ต้องมี session management
- ✅ ต้องมี authorization system

---

## 3. Password Source Analysis

### 3.1 Current Situation

```
Password Source: NOT FOUND / UNVERIFIED

Users Sheet:
- มี Email column
- มี User_ID column
- ไม่มี Password column
- ไม่มี Password Hash column
```

### 3.2 Possible Password Locations

| Location | Status | Evidence |
|----------|--------|----------|
| Users Sheet (Password column) | ❌ NOT FOUND | ไม่มี column |
| Separate Credentials Sheet | ❌ NOT FOUND | ไม่มี sheet |
| External Authentication Service | ❌ NOT CONFIGURED | ไม่มี integration |
| Database | ❌ NOT FOUND | ไม่มี database |
| Environment Variables | ❌ NOT FOUND | ไม่มี credentials |
| Source Code | ❌ NOT FOUND | ไม่มี hard-coded credentials |

### 3.3 Conclusion

**Password Source = NOT FOUND / UNVERIFIED**

**Authentication Architecture = DECISION REQUIRED**

---

## 4. Authentication vs Authorization

### 4.1 Separation of Concerns

```
Authentication (Who are you?)
↓
Identity Verification
↓
Authorization (What can you do?)
↓
Permission Check
↓
Access Control
```

### 4.2 Authentication

**Question:** "ผู้ใช้นี้เป็นใคร และพิสูจน์ตัวตนแล้วหรือยัง?"

**Responsibilities:**
- Verify user identity
- Issue authentication token/session
- Manage login/logout
- Handle password/credentials

**Data Source:**
- External Identity Provider (Google, Microsoft, etc.)
- OR Application-managed credentials

### 4.3 Authorization

**Question:** "ผู้ใช้นี้มีสิทธิ์ทำอะไรกับข้อมูลใด?"

**Responsibilities:**
- Check user permissions
- Validate resource access
- Enforce role-based access control
- Check department/unit restrictions

**Data Source:**
- Google Sheets Users (Identity/Authorization Mapping)
- Google Sheets Positions, Departments, Units (Organization Structure)

### 4.4 Separation Principle

```
Authentication Provider (External/Internal)
      ↓
Identity Verified (Email/Subject)
      ↓
Users Sheet Lookup (Email → User_ID)
      ↓
Authorization Context (Role, Department, Unit, Permissions)
      ↓
Resource Access Decision
```

**Key Point:**
- Authentication Provider จัดการ identity verification
- Google Sheets Users เป็น authorization mapping
- แยกกันชัดเจน ไม่ปนกัน

---

## 5. Identity Mapping

### 5.1 Mapping Flow

```
External Identity Provider
      ↓
Verified Email / Subject
      ↓
Users.Email (Lookup)
      ↓
Users.User_ID
      ↓
Authorization Context
```

### 5.2 Identity Sources

**Option A: Email-based Mapping**
```
External Provider → Verified Email → Users.Email → User_ID
```

**Pros:**
- ง่าย
- Email มีอยู่แล้วใน Users Sheet
- ไม่ต้องเพิ่ม column

**Cons:**
- Email อาจเปลี่ยนได้
- ต้องมี mechanism สำหรับ email change

**Option B: Subject-based Mapping**
```
External Provider → Stable Subject → Users.Subject (New Column) → User_ID
```

**Pros:**
- Stable identifier
- ไม่เปลี่ยนตาม email

**Cons:**
- ต้องเพิ่ม column ใน Users Sheet
- ต้อง migrate ข้อมูล

### 5.3 Recommendation

**DECISION REQUIRED**

ต้องตัดสินใจว่าจะใช้:
1. Email-based mapping (ง่าย แต่ไม่ stable)
2. Subject-based mapping (stable แต่ต้องเพิ่ม column)

---

## 6. Email Mapping

### 6.1 Current Users.Email

**Data:**
```
U001: test@example.com
U002: test2@example.com
U003: test3@example.com
...
```

### 6.2 Possible Roles

| Role | Description | Status |
|------|-------------|--------|
| Login Identifier | ใช้สำหรับ login | POSSIBLE |
| Identity Mapping Key | ใช้ map กับ external identity | POSSIBLE |
| Contact Email | ใช้สำหรับส่ง notification | POSSIBLE |
| Multiple Roles | ทำหลายหน้าที่ | POSSIBLE |

### 6.3 Analysis

**As Login Identifier:**
- ✅ ใช้ได้
- ⚠️ Email อาจเปลี่ยนได้
- ⚠️ ต้องมี mechanism สำหรับ email change

**As Identity Mapping Key:**
- ✅ ใช้ได้ถ้า email ไม่เปลี่ยน
- ⚠️ ถ้า email เปลี่ยน ต้อง update mapping
- ⚠️ Subject-based mapping อาจดีกว่า

**As Contact Email:**
- ✅ เหมาะสม
- ✅ ใช้สำหรับ notification, password reset

### 6.4 Conclusion

**Users.Email สามารถเป็นได้หลายอย่าง:**
- Login identifier
- Identity mapping key
- Contact email

**DECISION REQUIRED:**
- จะใช้ Email เป็น identity mapping key หรือไม่?
- ถ้า email เปลี่ยน จะจัดการอย่างไร?
- ต้องใช้ stable subject หรือไม่?

---

## 7. User Status Rules

### 7.1 Current Status Values

**Observed:**
- "ใช้งาน" (Active)

**Expected (Future):**
- "ระงับ" (Suspended)
- "ลบ" (Deleted)
- "รอการอนุมัติ" (Pending)

### 7.2 Status-Based Access Control

```
User Status Check:
↓
if (status === "ใช้งาน") {
  → Allow access
  → Load authorization context
} else {
  → Deny access
  → Show appropriate message
}
```

### 7.3 Status Rules

| Status | Access | Authorization Context | Notes |
|--------|--------|----------------------|-------|
| ใช้งาน | ✅ ALLOW | ✅ LOAD | Active user |
| ระงับ | ❌ DENY | ❌ NOT LOAD | Suspended user |
| ลบ | ❌ DENY | ❌ NOT LOAD | Deleted user |
| รอการอนุมัติ | ❌ DENY | ❌ NOT LOAD | Pending approval |
| Unknown | ❌ DENY | ❌ NOT LOAD | Fail-safe |

### 7.4 Fail-Safe Principle

**If status is unknown or invalid:**
- ❌ DENY access
- ❌ Do NOT load authorization context
- ✅ Log security event

---

## 8. Role Model

### 8.1 Confirmed Roles

| Role | Description | Count |
|------|-------------|------:|
| MAYOR | นายกเทศมนตรี | 1 |
| CLERK | ปลัดเทศบาล | 1 |
| OFFICE_HEAD | หัวหน้าสำนักปลัด | 1 |
| DIVISION_HEAD | ผู้อำนวยการกอง | 2 |
| STAFF_HEAD | หัวหน้างาน | 1 |
| STAFF | เจ้าหน้าที่ | 1 |
| ADMIN | ธุรการกลาง | 1 |

**Total:** 7 roles

### 8.2 Role Hierarchy (Inferred)

```
MAYOR (ระดับสูงสุด)
  └─ CLERK (ปลัดเทศบาล)
       ├─ OFFICE_HEAD (หัวหน้าสำนักปลัด)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       ├─ DIVISION_HEAD (ผู้อำนวยการกอง)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       └─ ADMIN (ธุรการกลาง)
```

**Note:** เป็นลำดับชั้นที่อนุมานจากข้อมูล อาจไม่ถูกต้อง 100%

### 8.3 Role-Based Access Control (RBAC)

**Principle:**
- Role กำหนด permission พื้นฐาน
- แต่ต้องพิจารณา Department, Unit, Ownership ด้วย
- ไม่ใช่ Role เพียงอย่างเดียว

---

## 9. Permission Model

### 9.1 Permission Dimensions

```
Permission = f(
  Role,
  Position,
  Department,
  Unit,
  Can_View_All,
  Can_Sign,
  Resource_Ownership,
  Resource_Assignment,
  Resource_State
)
```

### 9.2 Permission Check Flow

```
Request
  ↓
Authenticated Identity
  ↓
Resolve User (from Users Sheet)
  ↓
Check Status (ใช้งาน?)
  ↓
Check Role (has permission?)
  ↓
Check Department/Unit (scope?)
  ↓
Check Ownership/Assignment (is owner/assignee?)
  ↓
Check Can_View_All / Can_Sign (special permission?)
  ↓
Check Document State (valid state for action?)
  ↓
ALLOW / DENY
```

### 9.3 Permission Types

| Permission | Description | Example |
|------------|-------------|---------|
| View | ดูข้อมูล | ดูเอกสาร |
| Create | สร้างข้อมูล | สร้างเอกสารใหม่ |
| Edit | แก้ไขข้อมูล | แก้ไขเอกสาร |
| Delete | ลบข้อมูล | ลบเอกสาร |
| Route | ส่งต่อ | ส่งเอกสารให้ผู้อื่น |
| Approve | อนุมัติ | อนุมัติเอกสาร |
| Sign Workflow | เข้า signature workflow | ลงนามเอกสาร |
| Admin | จัดการระบบ | จัดการผู้ใช้ |

---

## 10. Can_View_All

### 10.1 Current Data

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

### 10.2 Possible Interpretations

**Interpretation A: View All Documents**
```
Can_View_All = ✔ → ดูเอกสารทั้งหมด (ไม่จำกัด department/unit)
Can_View_All = ✗ → ดูเฉพาะเอกสารใน department/unit ของตัวเอง
```

**Interpretation B: View All Reports**
```
Can_View_All = ✔ → ดูรายงานทั้งหมด
Can_View_All = ✗ → ดูเฉพาะรายงานของตัวเอง
```

**Interpretation C: View All Users**
```
Can_View_All = ✔ → ดูข้อมูลผู้ใช้ทั้งหมด
Can_View_All = ✗ → ดูเฉพาะผู้ใช้ใน department/unit ของตัวเอง
```

### 10.3 Analysis

**Observation:**
- MAYOR และ CLERK มี Can_View_All = ✔
- ตำแหน่งอื่นมี Can_View_All = ✗
- สอดคล้องกับลำดับชั้นองค์กร

**Likely Meaning:**
- View all documents (ไม่จำกัด department/unit)

### 10.4 Conclusion

**Can_View_All = ✔**
- น่าจะหมายถึง: ดูเอกสารทั้งหมด (ไม่จำกัด department/unit)
- แต่ยังไม่ยืนยัน

**Status:** **UNVERIFIED / DECISION REQUIRED**

ต้องตัดสินใจว่า:
- Can_View_All หมายถึงอะไร?
- ใช้กับทรัพยากรใดบ้าง?
- มีข้อยกเว้นหรือไม่?

---

## 11. Can_Sign

### 11.1 Current Data

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

### 11.2 Possible Interpretations

**Interpretation A: Permission to Enter Signature Workflow**
```
Can_Sign = ✔ → สามารถเข้าสู่ signature workflow
Can_Sign = ✗ → ไม่สามารถเข้าสู่ signature workflow
```

**Interpretation B: Actual Digital Signature**
```
Can_Sign = ✔ → สามารถลงนามดิจิทัล (ตามกฎหมาย)
Can_Sign = ✗ → ไม่สามารถลงนามดิจิทัล
```

### 11.3 Analysis

**Important Distinction:**
- **Signature Workflow** ≠ **Digital Signature (ตามกฎหมาย)**
- Signature Workflow = กระบวนการลงนามในระบบ
- Digital Signature = การลงนามที่มีผลตามกฎหมาย ต้องมี Digital Signature Provider

**Current System:**
- ❌ ไม่มี Digital Signature Provider
- ❌ ไม่มี legal digital signature capability

**Therefore:**
- Can_Sign น่าจะหมายถึง: Permission to enter signature workflow
- ไม่ใช่: Actual digital signature (ตามกฎหมาย)

### 11.4 Conclusion

**Can_Sign = ✔**
- หมายถึง: Permission to enter signature workflow
- ไม่ใช่: Actual digital signature (ตามกฎหมาย)

**Terminology:**
- ใช้คำว่า "Signature Workflow" ไม่ใช่ "Digital Signature"
- จนกว่าจะมี Digital Signature Provider จริง

**Status:** **LIKELY — Permission to enter signature workflow**

---

## 12. Resource Authorization

### 12.1 Resource Types

| Resource | Description | Example |
|----------|-------------|---------|
| Document | เอกสารสารบรรณ | หนังสือรับ, หนังสือส่ง |
| Incoming | หนังสือรับ | เอกสารจากภายนอก |
| Outgoing | หนังสือส่ง | เอกสารไปภายนอก |
| Workflow | ขั้นตอนการทำงาน | การอนุมัติ, การส่งต่อ |
| User | ผู้ใช้ | ข้อมูลผู้ใช้ |
| Department | แผนก | ข้อมูลแผนก |
| Unit | งาน | ข้อมูลงาน |

### 12.2 Resource-Level Authorization

**Question:**
```
Can user view this Document?
Can user edit this Document?
Can user route this Document?
Can user approve this Document?
Can user enter signature workflow for this Document?
```

### 12.3 Authorization Factors

| Factor | Description | Example |
|--------|-------------|---------|
| User Role | บทบาทของผู้ใช้ | MAYOR, CLERK, etc. |
| User Department | แผนกของผู้ใช้ | D001, D002, etc. |
| User Unit | งานของผู้ใช้ | UNT0015, etc. |
| Resource Owner | เจ้าของทรัพยากร | ผู้สร้างเอกสาร |
| Resource Assignee | ผู้ได้รับมอบหมาย | ผู้รับผิดชอบเอกสาร |
| Workflow Actor | ผู้เกี่ยวข้องใน workflow | ผู้อนุมัติ, ผู้ส่งต่อ |
| Can_View_All | สิทธิ์ดูทั้งหมด | ✔/✗ |
| Can_Sign | สิทธิ์ลงนาม | ✔/✗ |
| Resource State | สถานะของทรัพยากร | Draft, Pending, Approved |

### 12.4 Authorization Logic (Conceptual)

```
function canViewDocument(user, document) {
  // Check status
  if (user.status !== "ใช้งาน") return false;
  
  // Check Can_View_All
  if (user.canViewAll) return true;
  
  // Check department scope
  if (document.departmentId === user.departmentId) return true;
  
  // Check unit scope
  if (document.unitId === user.unitId) return true;
  
  // Check ownership
  if (document.createdBy === user.userId) return true;
  
  // Check assignment
  if (document.assignedTo === user.userId) return true;
  
  // Check workflow actor
  if (isWorkflowActor(user, document)) return true;
  
  return false;
}
```

**Note:** เป็น conceptual logic เท่านั้น ยังไม่ implement

---

## 13. Workflow Authorization Dependency

### 13.1 Workflow Structure

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

### 13.2 Workflow Actor Reference

**Question:**
```
"จากผู้ดำเนินการ" และ "ถึงผู้ดำเนินการ" อ้างอิงถึงอะไร?
- User_ID?
- Position_ID?
- Department_ID?
- Unit_ID?
- หรือค่าอื่น?
```

### 13.3 Current Status

**Evidence:**
- ไม่มีข้อมูลใน Workflow sheet (0 rows)
- ไม่มี source code ที่ระบุ
- ไม่มี documentation
- ไม่มี mapping

**Conclusion:** **UNVERIFIED — actor reference type cannot yet be confirmed**

### 13.4 Impact on Authorization

**If actor = User_ID:**
```
Workflow authorization based on specific users
```

**If actor = Position_ID:**
```
Workflow authorization based on positions (role-based)
```

**If actor = Department_ID:**
```
Workflow authorization based on departments
```

**If actor = Unit_ID:**
```
Workflow authorization based on units
```

### 13.5 Conclusion

**Workflow Authorization = BLOCKED until actor reference is confirmed**

**Required:**
- ตัวอย่างข้อมูลจริงใน Workflow sheet
- หรือ documentation เกี่ยวกับ workflow actor
- หรือคำอธิบายจากเจ้าของระบบ

---

## 14. Approval Dependency

### 14.1 Approval Sequence

**Data:**
```
Positions.ลำดับอนุมัติ:
- P001 (MAYOR): 5
- P002 (CLERK): 4
- P003 (OFFICE_HEAD): 3
```

### 14.2 Sequence Meaning

**Question:**
```
ลำดับ 3, 4, 5 หมายถึงอะไร?
- ลำดับ 1 = อนุมัติคนแรก?
- ลำดับ 5 = สำคัญที่สุด?
- หรือความหมายอื่น?
```

### 14.3 Current Status

**Evidence:**
- มีข้อมูลเพียง 3 records
- ไม่มีลำดับ 1, 2
- ไม่มี documentation
- ไม่มี source code

**Conclusion:** **UNVERIFIED — insufficient data to confirm approval chain**

### 14.4 Impact on Authorization

**Cannot implement:**
- Approval engine
- Approval routing
- Approval workflow

**Until:**
- มีข้อมูล Positions ทั้งหมด
- หรือ documentation เกี่ยวกับ approval workflow
- หรือคำอธิบายจากเจ้าของระบบ

---

## 15. Authentication Options

### 15.1 Option A: External Identity Provider

**Examples:**
- Google Identity / Google Workspace
- Microsoft Entra ID (Azure AD)
- Auth0
- Firebase Authentication

**Characteristics:**

| Aspect | Description |
|--------|-------------|
| Password Management | Provider จัดการ password |
| Identity Verification | Provider ยืนยันตัวตน |
| Security Responsibility | Provider รับผิดชอบ security |
| Password Reset | Provider จัดการ reset |
| MFA Possibility | Provider รองรับ MFA |
| Integration Complexity | ต้อง integrate กับ provider |
| Cost | อาจมีค่าใช้จ่ายตาม usage |
| Dependency | พึ่งพา provider |

**Pros:**
- ✅ ไม่ต้องจัดการ password เอง
- ✅ มี MFA พร้อมใช้
- ✅ Security ดี (provider รับผิดชอบ)
- ✅ User experience ดี (SSO)

**Cons:**
- ⚠️ พึ่งพา third-party
- ⚠️ อาจมีค่าใช้จ่าย
- ⚠️ ต้อง integrate
- ⚠️ ต้องจัดการ mapping กับ Users Sheet

---

### 15.2 Option B: Platform Authentication

**Examples:**
- Authentication ที่แพลตฟอร์ม Frontend มีอยู่แล้ว
- Built-in authentication ของ hosting platform

**Characteristics:**

| Aspect | Description |
|--------|-------------|
| Password Management | Platform จัดการ |
| Identity Verification | Platform ยืนยัน |
| Security Responsibility | Platform รับผิดชอบ |
| Password Reset | Platform จัดการ |
| MFA Possibility | ขึ้นอยู่กับ platform |
| Integration Complexity | ต่ำ (built-in) |
| Cost | อาจรวมอยู่ใน platform |
| Dependency | พึ่งพา platform |

**Pros:**
- ✅ Integration ง่าย
- ✅ Cost ต่ำ (อาจฟรี)
- ✅ Maintenance ต่ำ

**Cons:**
- ⚠️ พึ่งพา platform
- ⚠️ Features จำกัด
- ⚠️ อาจไม่ยืดหยุ่น

---

### 15.3 Option C: Application-Managed Authentication

**Description:**
- ระบบจัดการ authentication เอง
- เก็บ password hash ในระบบที่เหมาะสม

**Characteristics:**

| Aspect | Description |
|--------|-------------|
| Password Management | Application จัดการ |
| Identity Verification | Application ยืนยัน |
| Security Responsibility | Application รับผิดชอบ |
| Password Reset | Application จัดการ |
| MFA Possibility | ต้อง implement เอง |
| Integration Complexity | สูง (ต้อง implement ทั้งหมด) |
| Cost | Development cost สูง |
| Dependency | พึ่งพาตัวเอง |

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

## 16. Authentication Decision Matrix

### 16.1 Comparison Table

| Topic | External IdP | Platform Auth | Application-managed |
|-------|--------------|---------------|---------------------|
| Password management | Provider จัดการ | Platform จัดการ | Application จัดการ |
| Identity verification | Provider ยืนยัน | Platform ยืนยัน | Application ยืนยัน |
| Google Sheets integration | ต้อง map email/subject | ต้อง map email/subject | ต้อง map email/subject |
| Security responsibility | Provider รับผิดชอบ | Platform รับผิดชอบ | Application รับผิดชอบ |
| Password reset | Provider จัดการ | Platform จัดการ | Application จัดการ |
| MFA possibility | ✅ พร้อมใช้ | ขึ้นอยู่กับ platform | ต้อง implement เอง |
| Operational complexity | ต่ำ (provider จัดการ) | ต่ำ (built-in) | สูง (ต้องจัดการเอง) |
| Cost consideration | อาจมีค่าใช้จ่าย | อาจฟรี/รวมอยู่ใน platform | Development cost สูง |
| Dependency | พึ่งพา provider | พึ่งพา platform | พึ่งพาตัวเอง |
| Customization | จำกัด | จำกัดมาก | ยืดหยุ่นสูง |
| Time to implement | เร็ว | เร็วมาก | ช้า |

### 16.2 Decision Required

**DECISION REQUIRED FROM PROJECT OWNER**

ต้องตัดสินใจว่า:
1. จะใช้ authentication option ไหน?
2. ใครจะรับผิดชอบ password management?
3. ต้องการ MFA หรือไม่?
4. ยอมรับ dependency กับ third-party หรือไม่?
5. Budget สำหรับ authentication เป็นเท่าไหร่?

**ห้ามเลือกแทน Project Owner**

---

## 17. Security Requirements

### 17.1 Password Security (If Application-Managed)

**Requirements:**
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

### 17.2 General Security Requirements

**Authentication:**
- ✅ ต้องมี secure login mechanism
- ✅ ต้องมี session management
- ✅ ต้องมี token management (ถ้าใช้)
- ✅ ต้องมี logout mechanism
- ✅ ต้องมี session expiration
- ✅ ต้องมี idle timeout

**Authorization:**
- ✅ ต้องมี role-based access control
- ✅ ต้องมี resource-level authorization
- ✅ ต้องมี department/unit scope
- ✅ ต้องมี fail-safe mechanism

**Data Protection:**
- ✅ ต้องป้องกัน XSS
- ✅ ต้องป้องกัน CSRF
- ✅ ต้องป้องกัน IDOR
- ✅ ต้อง encrypt sensitive data in transit
- ✅ ต้อง encrypt sensitive data at rest (ถ้าจำเป็น)

**Audit:**
- ✅ ต้องมี audit log สำหรับ authentication events
- ✅ ต้องมี audit log สำหรับ authorization events
- ✅ ต้องมี audit log สำหรับ sensitive operations

---

## 18. Session Security

### 18.1 Session Requirements (Design Only)

**Session Management:**
- Session expiration (absolute timeout)
- Idle timeout (relative timeout)
- Logout mechanism
- Token rotation (ถ้าใช้ token)
- Session revocation
- Concurrent session control

**Security Measures:**
- Secure cookie flags (ถ้าใช้ cookie)
- HttpOnly flag
- Secure flag (HTTPS only)
- SameSite attribute
- CSRF token (ถ้าจำเป็น)

**Note:** ยังไม่ต้อง implement เพียงออกแบบ requirement

---

## 19. Google Sheets Security

### 19.1 Service Account Credentials

**Location:**
```
✅ SERVER SIDE ONLY
❌ NOT in frontend
❌ NOT in browser
❌ NOT in localStorage
❌ NOT in client bundle
❌ NOT in public repository
```

**Protection:**
```
✅ .env file (not committed to Git)
✅ .gitignore excludes .env
✅ Environment variables (production)
✅ Secret management service (production)
```

### 19.2 Prohibited Exposures

**ห้าม expose:**
- ❌ GOOGLE_PRIVATE_KEY
- ❌ Service account JSON
- ❌ Access token
- ❌ Refresh token
- ❌ Secret
- ❌ Credentials
- ❌ API keys (ถ้ามี)

### 19.3 Current Implementation

**Status:** ✅ **SECURE**

**Evidence:**
- Credentials อยู่ใน `.env` file
- `.env` อยู่ใน `.gitignore`
- Backend เท่านั้นที่เข้าถึง credentials
- Frontend ไม่สามารถเข้าถึง credentials

---

## 20. Threat Model

### 20.1 Security Threats

| # | Threat | Impact | Mitigation | Status |
|---|--------|--------|------------|--------|
| 1 | Credential theft | High | ใช้ secure credential storage, encrypt at rest | DESIGN |
| 2 | Password leakage | High | ใช้ password hashing, ไม่เก็บ plaintext | DESIGN |
| 3 | Session hijacking | High | ใช้ secure cookies, HTTPS, session expiration | DESIGN |
| 4 | Unauthorized document access | High | ใช้ resource-level authorization | DESIGN |
| 5 | Privilege escalation | Critical | ใช้ role-based access control, validate permissions | DESIGN |
| 6 | Role manipulation | High | ใช้ Google Sheets เป็น source of truth, validate on each request | DESIGN |
| 7 | Department bypass | Medium | ใช้ department scope in authorization | DESIGN |
| 8 | Unit bypass | Medium | ใช้ unit scope in authorization | DESIGN |
| 9 | Can_View_All abuse | Medium | ใช้ Can_View_All อย่างระมัดระวัง, audit log | DESIGN |
| 10 | Can_Sign abuse | High | ใช้ Can_Sign อย่างระมัดระวัง, audit log | DESIGN |
| 11 | Google credential exposure | Critical | เก็บ credentials ใน server side เท่านั้น | ✅ IMPLEMENTED |
| 12 | API abuse | Medium | ใช้ rate limiting, authentication | DESIGN |
| 13 | Brute-force login | Medium | ใช้ rate limiting, account lockout | DESIGN |
| 14 | XSS | High | ใช้ input sanitization, CSP | DESIGN |
| 15 | CSRF | Medium | ใช้ CSRF tokens, SameSite cookies | DESIGN |
| 16 | IDOR | High | ใช้ resource-level authorization, validate ownership | DESIGN |

### 20.2 Threat Priority

**Critical:**
- Privilege escalation
- Google credential exposure

**High:**
- Credential theft
- Password leakage
- Session hijacking
- Unauthorized document access
- Role manipulation
- Can_Sign abuse
- XSS
- IDOR

**Medium:**
- Department bypass
- Unit bypass
- Can_View_All abuse
- API abuse
- Brute-force login
- CSRF

---

## 21. Audit Security

### 21.1 Audit Events (Design Only)

**Authentication Events:**
- LOGIN_SUCCESS
- LOGIN_FAILED
- LOGOUT
- SESSION_EXPIRED
- PASSWORD_RESET_REQUESTED
- PASSWORD_RESET_COMPLETED

**Authorization Events:**
- ACCESS_DENIED
- PERMISSION_DENIED
- PRIVILEGE_ESCALATION_ATTEMPT

**Workflow Events:**
- SIGNATURE_WORKFLOW_STARTED
- SIGNATURE_WORKFLOW_COMPLETED
- DOCUMENT_ROUTED
- DOCUMENT_APPROVED

**Security Events:**
- SUSPICIOUS_ACTIVITY
- RATE_LIMIT_EXCEEDED
- BRUTE_FORCE_ATTEMPT

### 21.2 AuditLog Sheet

**Current Structure:**
```
AuditLog:
- Audit_ID
- Document_ID
- การกระทำ
- รายละเอียด
- วันที่เวลา
- IP_Address
```

**Note:**
- ห้ามเพิ่ม action values ลง Google Sheets ใน Phase นี้
- เพียงออกแบบไว้ก่อน
- จะ implement ใน Phase ถัดไป

---

## 22. Fail-Safe Design

### 22.1 Fail-Safe Principles

**If Google Sheets cannot be read:**
- ❌ ห้าม allow all
- ❌ ห้าม bypass authorization
- ❌ ห้ามใช้ cached privileged permission indefinitely
- ✅ ต้อง fail closed (deny access)
- ✅ ต้อง log security event
- ✅ ต้องแจ้งผู้ใช้

### 22.2 Fail-Safe Scenarios

| Scenario | Behavior |
|----------|----------|
| Google Sheets API unavailable | Deny access, log event |
| Users Sheet unreadable | Deny access, log event |
| User not found in Users Sheet | Deny access, log event |
| User status unknown | Deny access, log event |
| Authorization check fails | Deny access, log event |
| Cache stale | Refresh from source, deny if unavailable |

### 22.3 Implementation Principle

```
function authorize(request) {
  try {
    // Try to read from Google Sheets
    user = readFromGoogleSheets(request.userId);
    
    if (!user) {
      logSecurityEvent("USER_NOT_FOUND", request);
      return DENY;
    }
    
    if (user.status !== "ใช้งาน") {
      logSecurityEvent("USER_INACTIVE", request);
      return DENY;
    }
    
    // Check permissions
    if (!hasPermission(user, request)) {
      logSecurityEvent("PERMISSION_DENIED", request);
      return DENY;
    }
    
    return ALLOW;
  } catch (error) {
    // Fail closed
    logSecurityEvent("AUTHORIZATION_ERROR", request, error);
    return DENY;
  }
}
```

**Note:** เป็น conceptual code เท่านั้น ยังไม่ implement

---

## 23. Cache Security

### 23.1 Cache Requirements (If Used)

**Cache Strategy:**
- TTL (Time To Live): สั้น (5-15 นาที)
- Invalidation: เมื่อมีเปลี่ยนแปลงใน Users Sheet
- Stale data handling: Refresh จาก source
- Privilege revocation: ต้อง reflect ทันที

### 23.2 Cache Security Principles

**Cache ไม่ใช่ Source of Truth:**
- ❌ Cache ไม่ใช่ source of truth
- ✅ Google Sheets เป็น source of truth
- ✅ ต้อง refresh จาก Google Sheets เป็นประจำ

**Privilege Revocation:**
- ถ้า user ถูก revoke permission
- ต้อง reflect ใน cache ทันที
- หรือ cache TTL สั้นพอ

**Fail-Safe:**
- ถ้า cache ล้าสมัย
- ต้อง refresh จาก source
- ถ้า source unavailable
- ต้อง fail closed

---

## 24. Open Questions

### 24.1 Critical Questions

**Question 1: Authentication Provider**
```
Authentication Provider จะเป็นอะไร?
- External IdP (Google, Microsoft, Auth0, Firebase)?
- Platform Auth?
- Application-managed?
```
**Status:** DECISION REQUIRED

**Question 2: Password Management**
```
Password จะถูกจัดการโดยใคร?
- External Provider?
- Platform?
- Application?
```
**Status:** DECISION REQUIRED

**Question 3: Email Mapping**
```
Users.Email เป็น Identity Mapping Key หรือไม่?
- ใช่ → ใช้ email map กับ external identity
- ไม่ใช่ → ต้องเพิ่ม column สำหรับ stable subject
```
**Status:** DECISION REQUIRED

**Question 4: Unit_ID Nullability**
```
Users.Unit_ID ต้อง Required หรือ Optional?
- Required → ต้องมี unit_id ทุก user
- Optional → สามารถว่างได้
```
**Status:** DECISION REQUIRED

**Question 5: Workflow Actor**
```
Workflow Actor เป็น User / Position / Department / Unit?
- User_ID → อ้างอิงผู้ใช้เฉพาะ
- Position_ID → อ้างอิงตำแหน่ง
- Department_ID → อ้างอิงแผนก
- Unit_ID → อ้างอิงงาน
```
**Status:** UNVERIFIED — ต้องมีข้อมูลจริง

**Question 6: Approval Sequence**
```
Approval Sequence หมายถึงอะไร?
- ลำดับ 1 = อนุมัติคนแรก?
- ลำดับสูง = สำคัญมาก?
- หรือความหมายอื่น?
```
**Status:** UNVERIFIED — ต้องมีข้อมูลจริง

**Question 7: Units Row 1**
```
Units Row 1 คืออะไร?
- ข้อมูลจริง?
- Heading?
- Placeholder?
- ข้อมูลผิดรูปแบบ?
```
**Status:** UNVERIFIED — ต้องตรวจสอบกับเจ้าของระบบ

**Question 8: Can_View_All Scope**
```
Can_View_All หมายถึงระดับใด?
- ดูเอกสารทั้งหมด?
- ดูรายงานทั้งหมด?
- ดูผู้ใช้ทั้งหมด?
- หรืออื่น ๆ?
```
**Status:** UNVERIFIED — ต้องตัดสินใจ

**Question 9: Can_Sign Scope**
```
Can_Sign หมายถึง permission ระดับใด?
- Permission to enter signature workflow?
- Actual digital signature (ตามกฎหมาย)?
- หรืออื่น ๆ?
```
**Status:** LIKELY — Permission to enter signature workflow (แต่ต้องยืนยัน)

**Question 10: MFA Requirement**
```
ต้องใช้ MFA (Multi-Factor Authentication) หรือไม่?
- ใช่ → ต้องเลือก provider ที่รองรับ MFA
- ไม่ใช่ → ไม่ต้องพิจารณา MFA
```
**Status:** DECISION REQUIRED

---

## 25. Decision Required

### 25.1 Critical Decisions (Must Have Before Phase 2)

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| 1 | Authentication Provider | External IdP / Platform Auth / Application-managed | กำหนด architecture ทั้งหมด |
| 2 | Password Management | Provider / Platform / Application | กำหนด security responsibility |
| 3 | Identity Mapping | Email-based / Subject-based | กำหนด mapping strategy |
| 4 | MFA Requirement | Yes / No | กำหนด provider selection |

### 25.2 Business Decisions (Project Owner Only)

| # | Decision | Notes |
|---|----------|-------|
| 1 | Authentication Provider | ห้ามเลือกแทน Project Owner |
| 2 | Password Management | ห้ามเลือกแทน Project Owner |
| 3 | MFA Requirement | ห้ามเลือกแทน Project Owner |
| 4 | Budget for authentication | ต้องถาม Project Owner |

### 25.3 Technical Decisions (Can Be Resolved During Implementation)

| # | Decision | Notes |
|---|----------|-------|
| 1 | Workflow Actor | ต้องมีข้อมูลจริง |
| 2 | Approval Sequence | ต้องมีข้อมูลจริง |
| 3 | Units Row 1 | ต้องตรวจสอบกับเจ้าของระบบ |
| 4 | Unit_ID nullability | ต้องมี business logic |
| 5 | Can_View_All exact scope | ต้องตัดสินใจ |
| 6 | Can_Sign exact scope | ต้องตัดสินใจ |

---

## 26. Preconditions for Phase 2 Implementation

### 26.1 Required Before Implementation

| # | Precondition | Status | Notes |
|---|-------------|--------|-------|
| 1 | Authentication architecture decision | ❌ REQUIRED | ต้องตัดสินใจ |
| 2 | Identity mapping decision | ❌ REQUIRED | ต้องตัดสินใจ |
| 3 | Password responsibility decision | ❌ REQUIRED | ต้องตัดสินใจ |
| 4 | Email mapping confirmation | ❌ REQUIRED | ต้องตัดสินใจ |
| 5 | Basic authorization model | ✅ DONE | ออกแบบแล้วใน Phase 1E |

### 26.2 Can Be Resolved During Implementation

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Workflow actor | ⏳ UNVERIFIED | ต้องมีข้อมูลจริง |
| 2 | Approval sequence | ⏳ UNVERIFIED | ต้องมีข้อมูลจริง |
| 3 | Units Row 1 | ⏳ UNVERIFIED | ต้องตรวจสอบ |
| 4 | Unit_ID nullability | ⏳ UNVERIFIED | ต้องมี business logic |
| 5 | Can_View_All exact scope | ⏳ UNVERIFIED | ต้องตัดสินใจ |
| 6 | Can_Sign exact scope | ⏳ LIKELY | ต้องตัดสินใจ |

---

## 27. Summary

### 27.1 Design Complete

**Authentication Architecture:**
- ✅ วิเคราะห์ Authentication Situation
- ✅ วิเคราะห์ Password Source
- ✅ ออกแบบ Authentication vs Authorization separation
- ✅ ออกแบบ Identity Mapping
- ✅ วิเคราะห์ Authentication Options
- ✅ ออกแบบ Security Requirements
- ✅ ออกแบบ Threat Model
- ✅ ระบุ Open Questions
- ✅ ระบุ Decision Points

**Authorization Model:**
- ✅ ออกแบบ Role-Based Access Control
- ✅ ออกแบบ Resource-Level Authorization
- ✅ ออกแบบ Permission Model
- ✅ ออกแบบ Fail-Safe Design
- ✅ ออกแบบ Cache Security

**Security:**
- ✅ ออกแบบ Google Sheets Security
- ✅ ออกแบบ Session Security
- ✅ ออกแบบ Audit Security
- ✅ วิเคราะห์ Threat Model

### 27.2 Not Implemented

**Not Implemented (By Design):**
- ❌ Login system
- ❌ Password storage
- ❌ Authentication implementation
- ❌ Authorization implementation
- ❌ Session management
- ❌ Token management
- ❌ Database schema
- ❌ Mock users
- ❌ Mock passwords

### 27.3 Status

**PHASE 1E STATUS: ✅ DESIGN COMPLETE**

**Summary:**
- ✅ ออกแบบ architecture ครบถ้วน
- ✅ ระบุ decision points ชัดเจน
- ✅ ระบุ open questions ครบ
- ✅ ไม่มีการ implement
- ✅ ไม่มีการสร้าง password
- ✅ ไม่มีการสร้าง database
- ✅ ไม่มีการเลือก authentication provider

---

## 28. Files Created

| # | File | Purpose |
|---|------|---------|
| 1 | `PHASE-1E-AUTHENTICATION-SECURITY-DESIGN.md` | รายงานนี้ |

---

## 29. Compliance Check

### 29.1 Rules Compliance

| Rule | Status | Evidence |
|------|--------|----------|
| DESIGN ONLY | ✅ | ไม่มีการ implement |
| ไม่สร้าง Password | ✅ | ไม่มี password implementation |
| ไม่สร้าง Database | ✅ | ไม่มี database schema |
| ไม่เลือก Provider | ✅ | ระบุ DECISION REQUIRED |
| ไม่แก้ Google Sheets | ✅ | READ-ONLY |
| ไม่สร้าง Mock Data | ✅ | ใช้ข้อมูลจริง |
| ไม่เดา Business Rules | ✅ | ระบุ UNVERIFIED / DECISION REQUIRED |

---

## 30. Final Status

**PHASE 1E STATUS: ✅ DESIGN COMPLETE**

**Next Phase:**
**Phase 2 — Authentication & Authorization Implementation**

**Pre-requisites for Phase 2:**
1. ❌ **Authentication architecture decision** (Critical)
2. ❌ **Identity mapping decision** (Critical)
3. ❌ **Password responsibility decision** (Critical)
4. ❌ **Email mapping confirmation** (Critical)
5. ✅ Basic authorization model (Done in Phase 1E)

**Status:** **BLOCKED — ต้องตัดสินใจเรื่อง Authentication Architecture ก่อนเริ่ม Phase 2**

---

*รายงานสร้างเมื่อ: Phase 1E — E-Saraban Project*  
*สถานะ: ✅ DESIGN COMPLETE*  
*วันที่: 2026*
