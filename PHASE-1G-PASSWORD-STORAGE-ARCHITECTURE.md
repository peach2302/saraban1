# Phase 1G — Password Storage Architecture

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** DESIGN ONLY — NOT IMPLEMENTED

---

## 1. Executive Summary

เอกสารนี้ออกแบบ Password Storage Architecture สำหรับระบบ E-Saraban โดยใช้ Application-managed Authentication

**สถานะ:** ✅ DESIGN COMPLETE

**หลักการสำคัญ:**
- ✅ ห้ามเก็บ Plaintext Password
- ✅ ต้องใช้ Secure Password Hashing
- ✅ ต้องมี Unique Salt ต่อ Password
- ✅ Password_Hash จะถูกเพิ่มใน Users Sheet
- ✅ Backend เท่านั้นที่อ่าน Password_Hash ได้
- ✅ Frontend ไม่สามารถเข้าถึง Password_Hash

---

## 2. Password Storage Requirements

### 2.1 Security Requirements (LOCKED)

**ห้าม:**
- ❌ เก็บ Plaintext Password
- ❌ เก็บ Password ที่เข้ารหัสแบบ Reversible Encryption
- ❌ เก็บ Password ใน Frontend
- ❌ เก็บ Password ใน localStorage
- ❌ เก็บ Password ใน Logs
- ❌ เก็บ Password ใน AuditLog
- ❌ เก็บ Password ใน URL
- ❌ เก็บ Password ใน API Response
- ❌ ใช้ MD5
- ❌ ใช้ SHA-1
- ❌ ใช้ SHA-256 อย่างเดียว (ไม่มี salt)
- ❌ ใช้ Base64
- ❌ สร้าง Hash แบบ Deterministic ที่ไม่มี Salt

**ต้องมี:**
- ✅ Secure Password Hashing Algorithm
- ✅ Unique Salt ต่อ Password
- ✅ Backend-only Access
- ✅ HTTPS Transmission
- ✅ No Logging of Password
- ✅ Audit without Password

---

### 2.2 Password Hashing Algorithm

**Recommended Algorithms:**

| Algorithm | Security | Performance | Recommendation |
|-----------|----------|-------------|----------------|
| **Argon2id** | ✅ Highest | ⚠️ Slower | **RECOMMENDED** |
| **bcrypt** | ✅ High | ✅ Good | **ACCEPTABLE** |
| **scrypt** | ✅ High | ⚠️ Slower | ACCEPTABLE |

**Not Allowed:**
- ❌ MD5
- ❌ SHA-1
- ❌ SHA-256 (without salt)
- ❌ Base64
- ❌ Plaintext
- ❌ Reversible Encryption

**Implementation Decision:**
- **Status:** PENDING — ต้องตัดสินใจใน Phase ถัดไป
- **Recommendation:** Argon2id หรือ bcrypt
- **Reason:** ต้องพิจารณา runtime environment และ dependencies

---

### 2.3 Salt Requirements

**Must Have:**
- ✅ Unique salt per password
- ✅ Cryptographically secure random salt
- ✅ Minimum 16 bytes (128 bits)
- ✅ Stored with hash (not separately)

**Format:**
```
Password_Hash = algorithm$salt$hash
```

**Example (bcrypt):**
```
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
```

**Example (Argon2id):**
```
$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$Rdesc...
```

---

## 3. Google Sheets Schema Change

### 3.1 Current Users Schema

```
Users (11 columns):
1. User_ID
2. ชื่อ-สกุล
3. Position_ID
4. ตำแหน่ง
5. Department_ID
6. Unit_ID
7. Role
8. Email
9. สถานะ
10. Can_View_All
11. Can_Sign
```

### 3.2 New Users Schema (After Phase 1G)

```
Users (12 columns):
1. User_ID
2. ชื่อ-สกุล
3. Position_ID
4. ตำแหน่ง
5. Department_ID
6. Unit_ID
7. Role
8. Email
9. สถานะ
10. Can_View_All
11. Can_Sign
12. Password_Hash  ← NEW
```

### 3.3 Password_Hash Column Specification

| Property | Value |
|----------|-------|
| Column Name | Password_Hash |
| Data Type | String |
| Format | algorithm$salt$hash |
| Required | Yes (for active users) |
| Nullable | Yes (for users without password yet) |
| Default | Empty (PASSWORD_NOT_SET) |
| Access | Backend-only |
| Visibility | Never exposed to frontend |

### 3.4 Password_Hash Status Values

| Status | Meaning | Password_Hash Value |
|--------|---------|---------------------|
| PASSWORD_SET | Password ถูกตั้งค่าแล้ว | algorithm$salt$hash |
| PASSWORD_NOT_SET | ยังไม่ได้ตั้งค่า password | (empty) |
| PASSWORD_RESET_REQUIRED | ต้องรีเซ็ตรหัสผ่าน | (empty or special marker) |

---

## 4. Password_Hash Security Rules

### 4.1 Access Control

**Backend:**
- ✅ สามารถอ่าน Password_Hash ได้
- ✅ สามารถเขียน Password_Hash ได้
- ✅ ใช้สำหรับ verify password เท่านั้น

**Frontend:**
- ❌ ไม่สามารถอ่าน Password_Hash ได้
- ❌ ไม่สามารถเขียน Password_Hash ได้
- ❌ ไม่ได้รับ Password_Hash ใน API response
- ❌ ไม่เห็น Password_Hash ใน Dashboard
- ❌ ไม่เห็น Password_Hash ใน error messages

### 4.2 API Response Rules

**Login Request:**
```json
// Request
{
  "email": "user@example.com",
  "password": "plaintext_password"
}

// Response (Success)
{
  "success": true,
  "user": {
    "userId": "U001",
    "email": "user@example.com",
    "role": "MAYOR",
    // ❌ NO password_hash
    // ❌ NO password
  }
}
```

**User Profile Request:**
```json
// Response
{
  "userId": "U001",
  "fullName": "นายปรีชา กุมภิโร",
  "email": "user@example.com",
  "role": "MAYOR",
  // ❌ NO password_hash
  // ❌ NO password
}
```

### 4.3 Logging Rules

**Audit Log:**
```json
{
  "action": "LOGIN_SUCCESS",
  "userId": "U001",
  "timestamp": "2026-...",
  // ❌ NO password
  // ❌ NO password_hash
}
```

**Error Log:**
```json
{
  "error": "Authentication failed",
  "userId": "U001",
  // ❌ NO password
  // ❌ NO password_hash
}
```

---

## 5. Authentication Flow

### 5.1 Login Flow

```
1. User ส่ง Email + Password (ผ่าน HTTPS)
        ↓
2. Backend รับ Email + Password
        ↓
3. Backend ค้นหา User จาก Email
        ↓
4. Backend ตรวจสอบ User Status
        ↓
5. Backend อ่าน Password_Hash จาก Google Sheets
        ↓
6. Backend Verify Password กับ Password_Hash
        ↓
7. ถ้าถูกต้อง → สร้าง Session/Token
        ↓
8. ถ้าไม่ถูกต้อง → Reject
        ↓
9. Audit Log (ไม่บันทึก password)
```

### 5.2 Password Verification

```typescript
// Pseudo-code (ยังไม่ implement)
async function verifyPassword(
  plainPassword: string, 
  storedHash: string
): Promise<boolean> {
  // ใช้ algorithm ที่เลือก (Argon2id หรือ bcrypt)
  return await argon2.verify(storedHash, plainPassword);
}
```

### 5.3 Password Hashing

```typescript
// Pseudo-code (ยังไม่ implement)
async function hashPassword(plainPassword: string): Promise<string> {
  // ใช้ algorithm ที่เลือก (Argon2id หรือ bcrypt)
  const salt = generateRandomSalt();
  const hash = await argon2.hash(plainPassword, { salt });
  return hash;
}
```

---

## 6. Account Creation Flow

### 6.1 Flow

```
1. รับ Email + Password
        ↓
2. ตรวจสอบ Email format
        ↓
3. ตรวจสอบ Email uniqueness
        ↓
4. ตรวจสอบ User ใน Users Sheet
        ↓
5. ตรวจสอบ User Status
        ↓
6. Hash Password
        ↓
7. บันทึก Password_Hash ใน Users Sheet
        ↓
8. Audit Log (ไม่บันทึก password)
```

### 6.2 Validation Rules

**Email:**
- ✅ ต้องไม่ว่าง
- ✅ ต้องเป็นรูปแบบ email ที่ถูกต้อง
- ✅ ต้อง unique (ไม่มี user active คนอื่นใช้)
- ✅ ต้องมีใน Users Sheet
- ✅ Normalization: lowercase, trim

**Password:**
- ✅ ต้องไม่ว่าง
- ✅ ต้องมีความยาวขั้นต่ำ (แนะนำ 8 characters)
- ✅ ต้องมีความซับซ้อน (แนะนำ)
- ❌ ห้ามเป็น default password ที่เดาได้

**User:**
- ✅ ต้องมีใน Users Sheet
- ✅ สถานะต้องเป็น "ใช้งาน"
- ✅ ต้องมี Email
- ✅ ต้องมี User_ID

---

## 7. Password Reset Architecture

### 7.1 Requirements (Design Only)

**Reset Token:**
- ✅ Cryptographically secure random
- ✅ มีอายุจำกัด (แนะนำ 1 ชั่วโมง)
- ✅ ใช้ได้ครั้งเดียว
- ✅ ไม่เก็บ plaintext token
- ✅ ไม่ log token
- ✅ Invalidate หลังใช้

**Reset Flow:**
```
1. User ขอ reset password
        ↓
2. สร้าง reset token
        ↓
3. ส่ง token ทาง email
        ↓
4. User คลิก link + ใส่ password ใหม่
        ↓
5. Verify token
        ↓
6. Hash password ใหม่
        ↓
7. อัปเดต Password_Hash
        ↓
8. Invalidate token
        ↓
9. Audit Log
```

### 7.2 Implementation Status

**Status:** NOT IMPLEMENTED

**Note:** ต้องออกแบบและ implement ใน Phase ถัดไป

---

## 8. Security Considerations

### 8.1 HTTPS Required

- ✅ ทุก API call ต้องใช้ HTTPS
- ❌ ห้ามส่ง password ผ่าน HTTP
- ❌ ห้ามส่ง password ใน URL

### 8.2 Secure Cookie (ถ้าใช้ cookie-based session)

- ✅ HttpOnly flag
- ✅ Secure flag (HTTPS only)
- ✅ SameSite attribute
- ✅ Session expiration

### 8.3 Rate Limiting

- ✅ จำกัดจำนวน login attempts
- ✅ ป้องกัน brute-force
- ✅ Lock account หลังพยายามหลายครั้ง

### 8.4 Brute-force Protection

- ✅ Delay หลัง login失败
- ✅ CAPTCHA หลังพยายามหลายครั้ง
- ✅ Account lockout

---

## 9. Audit Events

### 9.1 Authentication Events

| Event | Description | Log Password? |
|-------|-------------|---------------|
| LOGIN_SUCCESS | Login สำเร็จ | ❌ NO |
| LOGIN_FAILED | Login ล้มเหลว | ❌ NO |
| LOGOUT | Logout | ❌ NO |
| PASSWORD_CREATED | สร้าง password ใหม่ | ❌ NO |
| PASSWORD_CHANGED | เปลี่ยน password | ❌ NO |
| PASSWORD_RESET_REQUESTED | ขอ reset password | ❌ NO |
| PASSWORD_RESET_COMPLETED | Reset password สำเร็จ | ❌ NO |
| ACCOUNT_DISABLED | ปิดบัญชี | ❌ NO |
| ACCOUNT_ENABLED | เปิดบัญชี | ❌ NO |

### 9.2 Audit Log Format

```json
{
  "Audit_ID": "AUD001",
  "Document_ID": "",
  "การกระทำ": "LOGIN_SUCCESS",
  "รายละเอียด": "User U001 logged in successfully",
  "วันที่เวลา": "2026-...",
  "IP_Address": "192.168.1.1"
  // ❌ NO password
  // ❌ NO password_hash
}
```

---

## 10. Implementation Roadmap

### 10.1 Phase 1G (Current)

- ✅ ออกแบบ Password Storage Architecture
- ✅ กำหนด Password_Hash column specification
- ✅ กำหนด security rules
- ✅ กำหนด authentication flow
- ✅ กำหนด audit events

### 10.2 Phase 2 (Next)

- ⏳ เลือก Password Hashing Algorithm
- ⏳ Install password hashing library
- ⏳ Implement password hashing service
- ⏳ Implement authentication service
- ⏳ Implement login API
- ⏳ Implement session management
- ⏳ Implement password reset
- ⏳ Add Password_Hash column to Google Sheets

### 10.3 Phase 3 (Later)

- ⏳ Implement password policy
- ⏳ Implement MFA (ถ้าตัดสินใจใช้)
- ⏳ Implement account lockout
- ⏳ Implement advanced security features

---

## 11. Dependencies

### 11.1 Password Hashing Libraries

**For Node.js/TypeScript:**

| Library | Algorithm | Recommendation |
|---------|-----------|----------------|
| `argon2` | Argon2id | ✅ RECOMMENDED |
| `bcrypt` | bcrypt | ✅ ACCEPTABLE |
| `scrypt` (built-in) | scrypt | ACCEPTABLE |

**Installation (ยังไม่ทำ):**
```bash
npm install argon2
# หรือ
npm install bcrypt
```

### 11.2 Current Dependencies

**Already Installed:**
- ✅ googleapis (Google Sheets API)
- ✅ express (Backend framework)
- ✅ cors (CORS handling)
- ✅ dotenv (Environment variables)

**To Be Installed (Phase 2):**
- ⏳ argon2 หรือ bcrypt (Password hashing)

---

## 12. Compliance Check

### 12.1 Security Requirements

| Requirement | Status |
|-------------|--------|
| No plaintext password | ✅ LOCKED |
| Secure password hashing | ✅ REQUIRED |
| Unique salt per password | ✅ REQUIRED |
| Backend-only access | ✅ REQUIRED |
| No password in logs | ✅ REQUIRED |
| No password in API response | ✅ REQUIRED |
| HTTPS required | ✅ REQUIRED |
| Rate limiting | ✅ REQUIRED |
| Brute-force protection | ✅ REQUIRED |

### 12.2 Google Sheets Rules

| Rule | Status |
|------|--------|
| Google Sheets เป็น Source of Truth | ✅ COMPLIANT |
| ไม่สร้าง Database ใหม่ | ✅ COMPLIANT |
| ไม่แก้ข้อมูลโดยไม่จำเป็น | ✅ COMPLIANT |
| เพิ่ม Password_Hash column | ✅ ALLOWED (Phase 1G) |
| ไม่เพิ่ม column อื่น | ✅ COMPLIANT |

---

## 13. Open Questions

### 13.1 Implementation Decisions

| Question | Status | Notes |
|----------|--------|-------|
| Password Hashing Algorithm? | PENDING | Argon2id หรือ bcrypt? |
| Password Policy? | PENDING | ความยาวขั้นต่ำ, ความซับซ้อน? |
| Session Management? | PENDING | JWT หรือ cookie-based? |
| MFA? | PENDING | ใช้หรือไม่? |

### 13.2 Business Decisions

| Question | Status | Notes |
|----------|--------|-------|
| Default password สำหรับ user ใหม่? | PENDING | ต้องตัดสินใจ |
| Password reset flow? | PENDING | ต้องออกแบบ |
| Account lockout policy? | PENDING | ต้องตัดสินใจ |

---

## 14. Summary

### 14.1 What Was Designed

✅ Password Storage Architecture
✅ Password_Hash Column Specification
✅ Security Rules
✅ Authentication Flow
✅ Account Creation Flow
✅ Password Reset Architecture (Design Only)
✅ Audit Events
✅ Implementation Roadmap

### 14.2 What Was NOT Implemented

❌ Password Hashing
❌ Authentication Service
❌ Login API
❌ Session Management
❌ Password Reset
❌ Password_Hash Column (ยังไม่ได้เพิ่มใน Google Sheets)

### 14.3 Status

**PHASE 1G PASSWORD STORAGE STATUS: ✅ DESIGN COMPLETE**

**Next Phase:** Phase 2 — Implementation

---

*รายงานสร้างเมื่อ: Phase 1G — E-Saraban Project*  
*สถานะ: ✅ DESIGN COMPLETE — NOT IMPLEMENTED*  
*วันที่: 2026*
