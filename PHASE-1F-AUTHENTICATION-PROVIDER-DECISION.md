# Phase 1F — Authentication Provider Decision

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DECISION RECORDED — NOT IMPLEMENTED

---

## Decision Record

### Authentication Provider

**Status:** ✅ DECIDED

**Selected:** APPLICATION-MANAGED AUTHENTICATION

**Decision Maker:** Project Owner

**Date:** 2026

---

## Decision Details

### Authentication Method

ระบบ E-Saraban จะจัดการ Authentication ผ่าน Backend ของระบบเอง

ผู้ใช้งานจะเข้าสู่ระบบด้วย:
- **Official Email**
- **Password**

### Authentication Flow

```
Official Email + Password
        ↓
Backend Authentication
        ↓
Verify Password Hash
        ↓
Authenticated Identity
        ↓
Users.Email Lookup
        ↓
Users.User_ID
        ↓
Authorization Context
```

### Identity Mapping

```
Authenticated Email
        ↓
Users.Email
        ↓
Users.User_ID
```

---

## Security Requirements

### Password Security (LOCKED)

**ห้าม:**
- ❌ เก็บ Plaintext Password
- ❌ Hard-code Password
- ❌ แสดง Password ใน Log
- ❌ ส่ง Password กลับไป Frontend
- ❌ ส่ง Password กลับใน API Response
- ❌ ใส่ Password ใน Source Code
- ❌ ใส่ Password ใน `.env`
- ❌ เก็บ Password ใน Google Sheets

**ต้องมี:**
- ✅ Secure Password Hashing
- ✅ Salted Hash
- ✅ Rate Limiting
- ✅ Brute-force Protection
- ✅ Secure Session
- ✅ Secure Cookie
- ✅ Session Expiration
- ✅ Password Reset Design
- ✅ Account Status Check
- ✅ Audit Authentication Events

### Password Hashing Algorithm

**Implementation Requirement:**

ใช้ Password Hashing Algorithm ที่เหมาะสม เช่น:
- Argon2id (แนะนำ)
- bcrypt
- scrypt

**Status:** NOT IMPLEMENTED — ต้องออกแบบใน Phase ถัดไป

---

## Password Storage

### Current Status

```
Password Storage Field: NOT YET IMPLEMENTED
Password Hash Storage Location: DECISION / SCHEMA CHANGE REQUIRED
```

### Important Note

**ห้ามเพิ่ม Password Column ลง Google Sheets ใน Phase นี้**

แม้ Project Owner จะเลือก Application-managed Authentication แล้ว แต่:
- โครงสร้าง Users ปัจจุบันยังไม่มี Password/Password_Hash Column
- Phase 1F เป็น Architecture Decision Phase
- ต้องออกแบบ Password Storage Schema ก่อน

### Password Storage Schema

**Status:** PENDING IMPLEMENTATION DESIGN

**ต้องตัดสินใจใน Phase ถัดไป:**
1. จะเก็บ Password Hash ที่ไหน?
   - เพิ่ม Column ใน Users Sheet?
   - สร้าง Sheet ใหม่?
   - ใช้ Database แยก?
2. จะออกแบบ Schema อย่างไร?
3. จะจัดการ Password Reset อย่างไร?

---

## Authorization

### Authorization Source

Authorization ของ E-Saraban ยังคงอ้างอิงจาก:

**Google Sheets 10 Sheets = Source of Truth**

```
Authenticated Identity
        ↓
Users.User_ID
        ↓
Users.Role
        ↓
Users.Position_ID
        ↓
Users.Department_ID
        ↓
Users.Unit_ID
        ↓
Users.สถานะ
        ↓
Users.Can_View_All
        ↓
Users.Can_Sign
```

### Authentication ≠ Authorization

Authentication สำเร็จไม่ได้หมายความว่า:
- ผู้ใช้สามารถดูทุกเอกสาร
- ผู้ใช้สามารถอนุมัติทุกเอกสาร
- ผู้ใช้สามารถลงนามทุกเอกสาร

สิทธิ์ต้องตรวจจาก Authorization Context

---

## Identity Mapping Requirements

### Before Implementation

ต้องตรวจสอบ:
- ✅ Email uniqueness
- ✅ Email normalization
- ✅ Email verification
- ✅ Account status
- ✅ Duplicate Email
- ✅ Missing Email
- ✅ Inactive User

### If Issues Found

**STOP — DO NOT AUTO-FIX DATA**

ต้องรายงานปัญหาและรอการตัดสินใจ

---

## Implementation Status

### NOT IMPLEMENTED

- ❌ Login UI
- ❌ Login API
- ❌ Password Hashing
- ❌ Session Management
- ❌ Authentication Middleware
- ❌ Password Reset
- ❌ Password Storage Schema

### PENDING

- ⏳ Password Storage Schema Design
- ⏳ Password Hashing Implementation
- ⏳ Session Security Implementation
- ⏳ Authentication Flow Implementation

---

## Phase 2 Gate

### Current Status

| Decision | Status |
|----------|--------|
| Authentication Provider | ✅ DECIDED |
| Password Management | ⏳ PENDING (Storage Schema) |
| Identity Mapping | ⏳ PENDING (Validation) |
| Role Permissions | ❌ OPEN |
| Can_View_All Scope | ❌ OPEN |
| Can_Sign Scope | ❌ OPEN |

### Phase 2 Status

**BLOCKED**

ต้องตัดสินใจครบก่อน:
- Password Management (Storage Schema)
- Identity Mapping (Validation)
- Role Permissions
- Can_View_All Scope
- Can_Sign Scope

---

## Google Sheets Rule

### ห้าม

- ❌ เพิ่ม Password Column
- ❌ เพิ่ม Password Sheet
- ❌ เพิ่ม User Database
- ❌ แก้ Users Sheet
- ❌ เพิ่ม Mock Account
- ❌ เพิ่ม Mock Password

### Source of Truth

Google Sheets 10 Sheets ยังคงเป็น Source of Truth

---

## MFA Status

**Status:** OPEN — PROJECT OWNER DECISION REQUIRED

**Note:** Application-managed Authentication ไม่ได้หมายความว่า MFA ถูกเลือกแล้ว

ต้องตัดสินใจแยกต่างหาก

---

## Summary

### What Was Decided

✅ Authentication Provider = Application-managed Authentication
✅ Authentication Identity = Official Email + Password
✅ Identity Mapping = Email → Users.Email → Users.User_ID
✅ Password Security = LOCKED (No plaintext)
✅ Authorization Source = Google Sheets (unchanged)

### What Was NOT Decided

❌ Password Storage Schema (PENDING)
❌ Password Hashing Algorithm (PENDING)
❌ MFA (OPEN)
❌ Role Permissions (OPEN)
❌ Can_View_All Scope (OPEN)
❌ Can_Sign Scope (OPEN)

### What Was NOT Implemented

❌ Login system
❌ Password storage
❌ Authentication implementation
❌ Session management
❌ Password reset

---

## Next Steps

### Before Phase 2

1. **ตัดสินใจ Password Storage Schema**
   - จะเก็บ Password Hash ที่ไหน?
   - จะออกแบบ Schema อย่างไร?

2. **ตรวจสอบ Identity Mapping**
   - ตรวจสอบ Email uniqueness
   - ตรวจสอบ Email normalization
   - ตรวจสอบ Account status

3. **ตัดสินใจ Authorization Rules**
   - Role Permissions
   - Can_View_All Scope
   - Can_Sign Scope

4. **ตัดสินใจ MFA**
   - ใช้ MFA หรือไม่?

### Phase 2 Implementation

เมื่อตัดสินใจครบแล้ว:
1. ออกแบบ Password Storage Schema
2. Implement Password Hashing
3. Implement Authentication Flow
4. Implement Session Management
5. Implement Authorization Middleware

---

## Compliance Check

### Rules Compliance

| Rule | Status |
|------|--------|
| ไม่เก็บ Plaintext Password | ✅ LOCKED |
| ไม่แก้ Google Sheets | ✅ COMPLIANT |
| ไม่สร้าง Database | ✅ COMPLIANT |
| ไม่สร้าง Mock Data | ✅ COMPLIANT |
| ไม่ Implement ใน Phase 1F | ✅ COMPLIANT |
| แยก Authentication vs Authorization | ✅ COMPLIANT |

---

## Files Updated

| # | File | Changes |
|---|------|---------|
| 1 | `PHASE-1F-ARCHITECTURE-DECISION-RECORD.md` | ADR-001: OPEN → DECIDED |
| 2 | `PHASE-1F-PROJECT-OWNER-DECISIONS.md` | Decision 1: บันทึกการตัดสินใจ |
| 3 | `PHASE-1F-REQUIREMENTS-LOCK.md` | อัปเดตสถานะ |
| 4 | `PHASE-1F-SUMMARY.md` | อัปเดตสรุป |
| 5 | `PHASE-1F-AUTHENTICATION-PROVIDER-DECISION.md` | เอกสารนี้ |

---

## STOP — DO NOT IMPLEMENT PHASE 2

**Phase 1F Authentication Provider Decision Status:** ✅ DECIDED

**Phase 2 Status:** ❌ BLOCKED

**Reason:**
- ต้องตัดสินใจเรื่อง Password Storage Schema ก่อน
- ต้องตรวจสอบ Identity Mapping ก่อน
- ต้องตัดสินใจ Authorization Rules ก่อน
- ต้องตัดสินใจ MFA ก่อน

**Next Step:**
- Project Owner ตัดสินใจหัวข้อที่เหลือ
- ส่งการตัดสินใจกลับให้ทีมพัฒนา
- เริ่ม Phase 2 Implementation

---

*รายงานสร้างเมื่อ: Phase 1F Authentication Provider Decision — E-Saraban Project*  
*สถานะ: ✅ DECISION RECORDED — NOT IMPLEMENTED*  
*วันที่: 2026*
