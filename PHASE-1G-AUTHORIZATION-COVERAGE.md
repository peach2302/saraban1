# Phase 1G — Authorization Coverage

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** AUTHORIZATION MODEL COMPLETE — PERMISSIONS PENDING

---

## 1. Executive Summary

เอกสารนี้ออกแบบ Authorization Coverage สำหรับระบบ E-Saraban

**สถานะ:** ✅ AUTHORIZATION MODEL COMPLETE

**หลักการ:**
- ✅ Authorization ต้องไม่อ้างอิงเพียง Role
- ✅ ต้องตรวจ Department, Unit, Ownership
- ✅ Can_View_All และ Can_Sign เป็น permission แยก
- ✅ Fail Closed principle
- ⚠️ Role permissions ยังเป็น TBD

---

## 2. Authorization Model

### 2.1 Authorization Flow

```
Authentication
        ↓
User_ID
        ↓
User Status Check (ใช้งาน?)
        ↓
Role Check
        ↓
Position Check
        ↓
Department Check
        ↓
Unit Check
        ↓
Can_View_All Check
        ↓
Can_Sign Check
        ↓
Resource Ownership Check
        ↓
Permission Check
        ↓
ALLOW / DENY
```

### 2.2 Authorization Factors

| Factor | Source | Description |
|--------|--------|-------------|
| User_ID | Users | รหัสผู้ใช้ |
| Status | Users.สถานะ | สถานะผู้ใช้ |
| Role | Users.Role | บทบาท |
| Position_ID | Users.Position_ID | ตำแหน่ง |
| Department_ID | Users.Department_ID | แผนก |
| Unit_ID | Users.Unit_ID | งาน |
| Can_View_All | Users.Can_View_All | สิทธิ์ดูทั้งหมด |
| Can_Sign | Users.Can_Sign | สิทธิ์ลงนาม |
| Resource Owner | Documents.ผู้สร้าง | เจ้าของเอกสาร |
| Workflow Actor | Workflow | ผู้เกี่ยวข้องกับ workflow |

---

## 3. Resource-Level Authorization

### 3.1 Document Access

**Question:** ผู้ใช้สามารถดู/แก้ไข/ส่งต่อเอกสารนี้ได้หรือไม่?

**Authorization Check:**

```typescript
// Pseudo-code
function canAccessDocument(user, document, action) {
  // 1. Check user status
  if (user.status !== "ใช้งาน") return DENY;
  
  // 2. Check Can_View_All
  if (action === "view" && user.canViewAll) return ALLOW;
  
  // 3. Check role-based permission
  if (!hasRolePermission(user.role, action)) return DENY;
  
  // 4. Check department scope
  if (document.departmentId !== user.departmentId) {
    // อาจมีข้อยกเว้นตาม workflow
    if (!isWorkflowActor(user, document)) return DENY;
  }
  
  // 5. Check unit scope
  if (document.unitId && document.unitId !== user.unitId) {
    if (!isWorkflowActor(user, document)) return DENY;
  }
  
  // 6. Check ownership (for edit/delete)
  if (action === "edit" || action === "delete") {
    if (document.createdBy !== user.userId) return DENY;
  }
  
  // 7. Check assignment (for route/approve)
  if (action === "route" || action === "approve") {
    if (!isAssignedTo(user, document)) return DENY;
  }
  
  return ALLOW;
}
```

### 3.2 Authorization Matrix (Conceptual)

| Action | Factors Checked |
|--------|----------------|
| View | Status, Role, Department, Unit, Can_View_All, Ownership, Assignment |
| Create | Status, Role |
| Edit | Status, Role, Ownership |
| Delete | Status, Role, Ownership |
| Route | Status, Role, Assignment, Workflow |
| Approve | Status, Role, Assignment, Workflow, Approval Sequence |
| Sign Workflow | Status, Can_Sign, Workflow, Approval Sequence |

---

## 4. Can_View_All Authorization

### 4.1 Current Data

| User_ID | Role | Can_View_All |
|---------|------|:------------:|
| U001 | MAYOR | ✔ |
| U002 | CLERK | ✔ |
| U003 | OFFICE_HEAD | ✗ |
| U004 | DIVISION_HEAD | ✗ |
| U005 | DIVISION_HEAD | ✗ |
| U006 | STAFF_HEAD | ✗ |
| U007 | STAFF | ✗ |
| U008 | ADMIN | ✗ |

### 4.2 Interpretation (UNVERIFIED)

**Possible Meanings:**

| Option | Can_View_All = ✔ | Can_View_All = ✗ |
|--------|------------------|------------------|
| 1 | ดูเอกสารทั้งหมด (ไม่จำกัด department/unit) | ดูเฉพาะใน department/unit ของตัวเอง |
| 2 | ดูเอกสารทั้งหมดใน department | ดูเฉพาะใน unit ของตัวเอง |
| 3 | ดูเอกสารตาม role scope | ดูเฉพาะเอกสารของตัวเอง |
| 4 | Combination | จำกัดตามหลายปัจจัย |

**Status:** UNVERIFIED — ต้องตัดสินใจจาก Project Owner

### 4.3 Authorization Impact

**If Can_View_All = ✔:**
- สามารถดูเอกสารทั้งหมด
- ไม่จำกัด department/unit
- ไม่จำกัด ownership

**If Can_View_All = ✗:**
- ดูเอกสารตาม scope:
  - Department scope
  - Unit scope
  - Ownership
  - Assignment
  - Workflow actor

---

## 5. Can_Sign Authorization

### 5.1 Current Data

| User_ID | Role | Can_Sign |
|---------|------|:--------:|
| U001 | MAYOR | ✔ |
| U002 | CLERK | ✔ |
| U003 | OFFICE_HEAD | ✔ |
| U004 | DIVISION_HEAD | ✔ |
| U005 | DIVISION_HEAD | ✔ |
| U006 | STAFF_HEAD | ✔ |
| U007 | STAFF | ✗ |
| U008 | ADMIN | ✗ |

### 5.2 Interpretation

**Can_Sign = Permission to Enter Signature Workflow**

**Important:**
- ❌ ไม่ใช่ Digital Signature (ตามกฎหมาย)
- ✅ เป็น Signature Workflow (กระบวนการลงนามในระบบ)
- ⚠️ ต้องมี Digital Signature Provider สำหรับ legal signature

### 5.3 Authorization Impact

**If Can_Sign = ✔:**
- สามารถเข้าสู่ signature workflow
- สามารถลงนามในเอกสาร (ในระบบ)
- สามารถ participate ใน signing process

**If Can_Sign = ✗:**
- ไม่สามารถเข้าสู่ signature workflow
- ไม่สามารถลงนาม
- ไม่สามารถ participate

### 5.4 Signing Authorization Flow

```
User requests to sign document
        ↓
Check Can_Sign = ✔?
        ↓
Check document is in signing workflow?
        ↓
Check user is in approval chain?
        ↓
Check document status allows signing?
        ↓
ALLOW / DENY
```

---

## 6. Role-Based Authorization (TBD)

### 6.1 Permission Matrix

| Role | View | Create | Edit | Route | Approve | Sign | Admin |
|------|:----:|:------:|:----:|:-----:|:-------:|:----:|:-----:|
| MAYOR | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| CLERK | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| OFFICE_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DIVISION_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| ADMIN | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

**Status:** ALL TBD — ต้องตัดสินใจจาก Project Owner

### 6.2 Permission Types

| Permission | Description | Example |
|------------|-------------|---------|
| View | ดูข้อมูล | ดูเอกสาร |
| Create | สร้างข้อมูล | สร้างเอกสารใหม่ |
| Edit | แก้ไขข้อมูล | แก้ไขเอกสาร |
| Delete | ลบข้อมูล | ลบเอกสาร |
| Route | ส่งต่อ | ส่งเอกสารให้ผู้อื่น |
| Assign | มอบหมาย | มอบหมายงาน |
| Submit | ส่ง | ส่งเอกสาร |
| Approve | อนุมัติ | อนุมัติเอกสาร |
| Reject | ปฏิเสธ | ปฏิเสธเอกสาร |
| Sign Workflow | ลงนาม | เข้าสู่ signature workflow |
| Archive | จัดเก็บ | จัดเก็บเอกสาร |
| View Audit | ดู Audit Log | ดูประวัติ |
| Manage Users | จัดการผู้ใช้ | เพิ่ม/แก้ไข/ลบผู้ใช้ |
| Manage Organization | จัดการองค์กร | จัดการแผนก/งาน |

---

## 7. Approval Chain Authorization

### 7.1 Expected Approval Chain

```
หัวหน้างาน (STAFF_HEAD)
    ↓
หัวหน้าสำนัก / ผู้บังคับบัญชา (OFFICE_HEAD / DIVISION_HEAD)
    ↓
ปลัดเทศบาล (CLERK)
    ↓
นายกเทศมนตรี (MAYOR)
    ↓
เสร็จสิ้น / จัดเก็บ
```

### 7.2 Approval Sequence (UNVERIFIED)

**Current Data:**
- P001 (MAYOR): ลำดับ 5
- P002 (CLERK): ลำดับ 4
- P003 (OFFICE_HEAD): ลำดับ 3

**Status:** UNVERIFIED — ไม่ทราบความหมายที่แท้จริง

### 7.3 Authorization Check

```typescript
// Pseudo-code
function canApprove(user, document, currentStep) {
  // 1. Check user is in approval chain
  if (!isInApprovalChain(user, document)) return DENY;
  
  // 2. Check user is current approver
  if (!isCurrentApprover(user, document, currentStep)) return DENY;
  
  // 3. Check document status allows approval
  if (document.status !== "PENDING_APPROVAL") return DENY;
  
  // 4. Check approval sequence
  if (!isValidApprovalSequence(user, document)) return DENY;
  
  return ALLOW;
}
```

---

## 8. Workflow Actor Authorization

### 8.1 Workflow Actor Reference (UNVERIFIED)

**Question:** Workflow.จากผู้ดำเนินการ และ Workflow.ถึงผู้ดำเนินการ อ้างอิงถึงอะไร?

**Possible References:**
- User_ID?
- Position_ID?
- Department_ID?
- Unit_ID?

**Status:** UNVERIFIED — ต้องมีข้อมูลจริง

### 8.2 Authorization Impact

**If actor = User_ID:**
- Authorization based on specific users

**If actor = Position_ID:**
- Authorization based on positions (role-based)

**If actor = Department_ID:**
- Authorization based on departments

**If actor = Unit_ID:**
- Authorization based on units

---

## 9. Fail-Safe Authorization

### 9.1 Fail-Closed Principle

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

IF authorization data unavailable
    DENY (fail closed)
```

### 9.2 Error Handling

```typescript
// Pseudo-code
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

---

## 10. Audit Authorization Events

### 10.1 Events to Audit

| Event | Description |
|-------|-------------|
| ACCESS_DENIED | เข้าถึง resource ไม่สำเร็จ |
| PERMISSION_DENIED | ไม่มีสิทธิ์ |
| PRIVILEGE_ESCALATION_ATTEMPT | พยายามเพิ่มสิทธิ์ |
| SIGN_PERMISSION_DENIED | พยายามลงนามโดยไม่มีสิทธิ์ |
| APPROVAL_DENIED | พยายามอนุมัติโดยไม่มีสิทธิ์ |

### 10.2 Audit Log Format

```json
{
  "Audit_ID": "AUD001",
  "Document_ID": "DOC001",
  "การกระทำ": "ACCESS_DENIED",
  "รายละเอียด": "User U007 attempted to access document DOC001 without permission",
  "วันที่เวลา": "2026-...",
  "IP_Address": "192.168.1.1"
}
```

---

## 11. Summary

### 11.1 What Was Designed

✅ Authorization Model
✅ Resource-Level Authorization
✅ Can_View_All Authorization (UNVERIFIED scope)
✅ Can_Sign Authorization (Signature Workflow)
✅ Role-Based Authorization (TBD permissions)
✅ Approval Chain Authorization
✅ Fail-Safe Authorization
✅ Audit Authorization Events

### 11.2 What Needs Decision

❓ Can_View_All exact scope
❓ Can_Sign exact scope (Signature Workflow vs Digital Signature)
❓ Role permissions matrix
❓ Workflow actor reference type
❓ Approval sequence meaning

### 11.3 Status

**PHASE 1G AUTHORIZATION COVERAGE STATUS: ✅ AUTHORIZATION MODEL COMPLETE — PERMISSIONS PENDING**

**Next Step:** ตัดสินใจ permissions จาก Project Owner

---

*รายงานสร้างเมื่อ: Phase 1G — E-Saraban Project*  
*สถานะ: ✅ AUTHORIZATION MODEL COMPLETE — PERMISSIONS PENDING*  
*วันที่: 2026*
