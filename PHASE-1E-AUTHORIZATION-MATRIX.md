# Phase 1E — Authorization Matrix

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DESIGN ONLY — NO IMPLEMENTATION

---

## 1. Role Authorization Matrix

### 1.1 Matrix Overview

| Role | View | Create | Edit | Route | Approve | Sign Workflow | Admin |
|------|------|--------|------|-------|---------|---------------|-------|
| MAYOR | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| CLERK | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| OFFICE_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DIVISION_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| ADMIN | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

**Status:** **TBD / UNVERIFIED**

**Reason:**
- ไม่มีข้อมูล permission จริงใน Google Sheets
- ไม่มี documentation เกี่ยวกับ role permissions
- ไม่มี source code ที่ระบุ permissions
- ต้องตัดสินใจจาก Project Owner

---

## 2. Permission Definitions

### 2.1 Permission Types

| Permission | Description | Example |
|------------|-------------|---------|
| **View** | ดูข้อมูล | ดูเอกสาร, ดูรายงาน |
| **Create** | สร้างข้อมูล | สร้างเอกสารใหม่ |
| **Edit** | แก้ไขข้อมูล | แก้ไขเอกสาร |
| **Delete** | ลบข้อมูล | ลบเอกสาร |
| **Route** | ส่งต่อ | ส่งเอกสารให้ผู้อื่น |
| **Approve** | อนุมัติ | อนุมัติเอกสาร |
| **Sign Workflow** | เข้า signature workflow | ลงนามเอกสาร |
| **Admin** | จัดการระบบ | จัดการผู้ใช้, จัดการระบบ |

### 2.2 Permission Scope

**Global Scope:**
- ดู/แก้ไข/ลบ ข้อมูลทั้งหมด
- ไม่จำกัด department/unit

**Department Scope:**
- ดู/แก้ไข/ลบ ข้อมูลใน department ของตัวเอง
- จำกัดเฉพาะ department

**Unit Scope:**
- ดู/แก้ไข/ลบ ข้อมูลใน unit ของตัวเอง
- จำกัดเฉพาะ unit

**Personal Scope:**
- ดู/แก้ไข/ลบ ข้อมูลของตัวเองเท่านั้น
- จำกัดเฉพาะ owner

---

## 3. Resource-Level Authorization

### 3.1 Resource Types

| Resource | Description | Authorization Factors |
|----------|-------------|----------------------|
| Document | เอกสารสารบรรณ | Role, Department, Unit, Owner, Assignee, Status |
| Incoming | หนังสือรับ | Role, Department, Unit, Status |
| Outgoing | หนังสือส่ง | Role, Department, Unit, Status |
| Workflow | ขั้นตอนการทำงาน | Role, Actor, Status |
| User | ผู้ใช้ | Role, Can_View_All |
| Department | แผนก | Role, Can_View_All |
| Unit | งาน | Role, Can_View_All |

### 3.2 Authorization Logic (Conceptual)

```
function canAccessResource(user, resource, action) {
  // 1. Check user status
  if (user.status !== "ใช้งาน") {
    return DENY;
  }
  
  // 2. Check Can_View_All (for view action)
  if (action === "view" && user.canViewAll) {
    return ALLOW;
  }
  
  // 3. Check role-based permission
  if (!hasRolePermission(user.role, action)) {
    return DENY;
  }
  
  // 4. Check department scope
  if (resource.departmentId !== user.departmentId) {
    return DENY;
  }
  
  // 5. Check unit scope (if applicable)
  if (resource.unitId && resource.unitId !== user.unitId) {
    return DENY;
  }
  
  // 6. Check ownership (for edit/delete)
  if (action === "edit" || action === "delete") {
    if (resource.ownerId !== user.userId) {
      return DENY;
    }
  }
  
  // 7. Check assignment (for route/approve)
  if (action === "route" || action === "approve") {
    if (resource.assignedTo !== user.userId) {
      return DENY;
    }
  }
  
  // 8. Check Can_Sign (for sign workflow)
  if (action === "sign" && !user.canSign) {
    return DENY;
  }
  
  return ALLOW;
}
```

**Note:** เป็น conceptual logic เท่านั้น ยังไม่ implement

---

## 4. Can_View_All Authorization

### 4.1 Current Data

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

### 4.2 Authorization Impact

**If Can_View_All = ✔:**
```
User can view ALL documents
- No department restriction
- No unit restriction
- No ownership restriction
```

**If Can_View_All = ✗:**
```
User can view documents based on:
- Department scope
- Unit scope
- Ownership
- Assignment
```

### 4.3 Status

**Status:** **UNVERIFIED / DECISION REQUIRED**

**Questions:**
- Can_View_All หมายถึงอะไร?
- ใช้กับทรัพยากรใดบ้าง?
- มีข้อยกเว้นหรือไม่?

---

## 5. Can_Sign Authorization

### 5.1 Current Data

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

### 5.2 Authorization Impact

**If Can_Sign = ✔:**
```
User can enter signature workflow
- Can sign documents
- Can participate in signing process
```

**If Can_Sign = ✗:**
```
User cannot enter signature workflow
- Cannot sign documents
- Cannot participate in signing process
```

### 5.3 Important Note

**Terminology:**
- ใช้คำว่า "Signature Workflow" ไม่ใช่ "Digital Signature"
- จนกว่าจะมี Digital Signature Provider จริง

**Reason:**
- Digital Signature (ตามกฎหมาย) ต้องมี Digital Signature Provider
- ปัจจุบันไม่มี provider
- จึงใช้คำว่า "Signature Workflow" แทน

### 5.4 Status

**Status:** **LIKELY — Permission to enter signature workflow**

---

## 6. Workflow Authorization

### 6.1 Workflow Structure

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

### 6.2 Actor Reference

**Question:**
```
"จากผู้ดำเนินการ" และ "ถึงผู้ดำเนินการ" อ้างอิงถึงอะไร?
- User_ID?
- Position_ID?
- Department_ID?
- Unit_ID?
```

**Status:** **UNVERIFIED**

**Impact:**
- ไม่สามารถออกแบบ workflow authorization ได้
- ต้องรอข้อมูลจริง

---

## 7. Approval Authorization

### 7.1 Approval Sequence

**Data:**
```
Positions.ลำดับอนุมัติ:
- P001 (MAYOR): 5
- P002 (CLERK): 4
- P003 (OFFICE_HEAD): 3
```

**Question:**
```
ลำดับ 3, 4, 5 หมายถึงอะไร?
```

**Status:** **UNVERIFIED**

**Impact:**
- ไม่สามารถออกแบบ approval authorization ได้
- ต้องรอข้อมูลจริง

---

## 8. Department/Unit Scope Authorization

### 8.1 Department Scope

**Principle:**
```
User can access resources in their department
- View documents in their department
- Edit documents in their department (if owner)
- Route documents within their department
```

### 8.2 Unit Scope

**Principle:**
```
User can access resources in their unit
- View documents in their unit
- Edit documents in their unit (if owner)
- Route documents within their unit
```

### 8.3 Scope Hierarchy

```
Global (Can_View_All = ✔)
  ↓
Department Scope
  ↓
Unit Scope
  ↓
Personal Scope (Owner only)
```

---

## 9. Authorization Decision Matrix

### 9.1 Decision Points

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 1 | Role permissions | ต้องกำหนด permissions สำหรับแต่ละ role | DECISION REQUIRED |
| 2 | Can_View_All scope | ต้องกำหนด scope ของ Can_View_All | DECISION REQUIRED |
| 3 | Can_Sign scope | ต้องกำหนด scope ของ Can_Sign | DECISION REQUIRED |
| 4 | Department scope rules | ต้องกำหนด rules สำหรับ department scope | DECISION REQUIRED |
| 5 | Unit scope rules | ต้องกำหนด rules สำหรับ unit scope | DECISION REQUIRED |
| 6 | Ownership rules | ต้องกำหนด rules สำหรับ ownership | DECISION REQUIRED |

### 9.2 Open Questions

**Question 1: Role Permissions**
```
แต่ละ role มี permissions อะไรบ้าง?
- MAYOR: ?
- CLERK: ?
- OFFICE_HEAD: ?
- DIVISION_HEAD: ?
- STAFF_HEAD: ?
- STAFF: ?
- ADMIN: ?
```
**Status:** DECISION REQUIRED

**Question 2: Can_View_All Scope**
```
Can_View_All หมายถึงอะไร?
- ดูเอกสารทั้งหมด?
- ดูรายงานทั้งหมด?
- ดูผู้ใช้ทั้งหมด?
```
**Status:** DECISION REQUIRED

**Question 3: Can_Sign Scope**
```
Can_Sign หมายถึงอะไร?
- Permission to enter signature workflow?
- Actual digital signature?
```
**Status:** LIKELY — Permission to enter signature workflow

---

## 10. Summary

### 10.1 Confirmed

- ✅ Can_Sign น่าจะหมายถึง Permission to enter signature workflow
- ✅ Department/Unit scope authorization เป็นไปได้
- ✅ Ownership-based authorization เป็นไปได้

### 10.2 Unverified

- ❌ Role permissions (TBD ทั้งหมด)
- ❌ Can_View_All exact scope
- ❌ Workflow authorization (actor reference unknown)
- ❌ Approval authorization (sequence meaning unknown)

### 10.3 Decision Required

- ❌ Role permissions matrix
- ❌ Can_View_All scope
- ❌ Department/Unit scope rules
- ❌ Ownership rules

---

## 11. Status

**PHASE 1E AUTHORIZATION MATRIX STATUS: ⚠️ PARTIAL**

**Summary:**
- ✅ ออกแบบ authorization model พื้นฐาน
- ✅ ระบุ decision points
- ❌ Role permissions ยังเป็น TBD ทั้งหมด
- ❌ ต้องตัดสินใจจาก Project Owner

**Next Step:**
- ตัดสินใจ role permissions
- ตัดสินใจ Can_View_All scope
- ตัดสินใจ Department/Unit scope rules

---

*รายงานสร้างเมื่อ: Phase 1E — E-Saraban Project*  
*สถานะ: ⚠️ PARTIAL*  
*วันที่: 2026*
