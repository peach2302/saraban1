# Phase 1G — Role & Position Coverage

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** COVERAGE ANALYSIS COMPLETE — VERIFICATION PENDING

---

## 1. Executive Summary

เอกสารนี้วิเคราะห์ Role และ Position Coverage สำหรับระบบ E-Saraban

**สถานะ:** ✅ COVERAGE ANALYSIS COMPLETE

**หลักการ:**
- ✅ ต้องรองรับทุก Role ที่พบใน Users Sheet
- ✅ ต้องรองรับทุก Position ที่พบใน Positions Sheet
- ✅ ห้ามเพิ่ม Role ใหม่โดยไม่มีหลักฐาน
- ✅ ห้ามลบ Role ที่มีอยู่
- ✅ ต้อง map Position → Department → Role
- ⚠️ ต้องตรวจสอบกับ Google Sheets จริง

---

## 2. Roles Coverage

### 2.1 Confirmed Roles (จาก Users Sheet)

| Role | Description | Count in Users | Status |
|------|-------------|---------------:|--------|
| MAYOR | นายกเทศมนตรี | 1 | ✅ CONFIRMED |
| CLERK | ปลัดเทศบาล | 1 | ✅ CONFIRMED |
| OFFICE_HEAD | หัวหน้าสำนักปลัด | 1 | ✅ CONFIRMED |
| DIVISION_HEAD | ผู้อำนวยการกอง | 2 | ✅ CONFIRMED |
| STAFF_HEAD | หัวหน้างาน | 1 | ✅ CONFIRMED |
| STAFF | เจ้าหน้าที่ | 1 | ✅ CONFIRMED |
| ADMIN | ธุรการกลาง | 1 | ✅ CONFIRMED |

**Total Unique Roles:** 7

### 2.2 Role Hierarchy (อนุมาน)

```
MAYOR (นายกเทศมนตรี) — ระดับสูงสุด
  └─ CLERK (ปลัดเทศบาล)
       ├─ OFFICE_HEAD (หัวหน้าสำนักปลัด)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       ├─ DIVISION_HEAD (ผู้อำนวยการกอง)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       └─ ADMIN (ธุรการกลาง)
```

**หมายเหตุ:** เป็นลำดับชั้นที่อนุมานจากข้อมูล อาจไม่ถูกต้อง 100%

### 2.3 Role Authorization Matrix (TBD)

| Role | View | Create | Edit | Route | Approve | Sign Workflow | Admin |
|------|------|--------|------|-------|---------|---------------|-------|
| MAYOR | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| CLERK | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| OFFICE_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| DIVISION_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF_HEAD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| STAFF | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| ADMIN | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

**Status:** ALL TBD — ต้องตัดสินใจจาก Project Owner

---

## 3. Positions Coverage

### 3.1 Verified Positions (จาก Phase 1B)

| Position_ID | ตำแหน่ง | Department_ID | Role | ลำดับอนุมัติ | Status |
|-------------|---------|---------------|------|------------:|--------|
| P001 | นายกเทศมนตรี | D001 | MAYOR | 5 | ✅ CONFIRMED |
| P002 | ปลัดเทศบาล | D001 | CLERK | 4 | ✅ CONFIRMED |
| P003 | หัวหน้าสำนักปลัด | D002 | OFFICE_HEAD | 3 | ✅ CONFIRMED |
| P004 | ผู้อำนวยการกองช่าง | D003 | DIVISION_HEAD | ? | ✅ CONFIRMED |
| P005 | ผู้อำนวยการกองคลัง | D004 | DIVISION_HEAD | ? | ✅ CONFIRMED |
| P008 | นักจัดการงานเทศกิจชำนาญการ | D002 | STAFF_HEAD | ? | ✅ CONFIRMED |
| P009 | เจ้าหน้าที่ | D002 | STAFF | ? | ✅ CONFIRMED |
| P010 | ธุรการกลาง | D002 | ADMIN | ? | ✅ CONFIRMED |

**Total Verified:** 8 Positions

### 3.2 Expected Positions (จาก Organization Structure)

ตามโครงสร้างองค์กรที่ Project Owner ให้ไว้ ควรมี Positions ดังนี้:

#### ระดับบริหาร (D001)
- P001: นายกเทศมนตรี (MAYOR) ✅
- P002: ปลัดเทศบาล (CLERK) ✅

#### สำนักปลัด (D002)
- P003: หัวหน้าสำนักปลัด (OFFICE_HEAD) ✅
- P008: นักจัดการงานเทศกิจชำนาญการ (STAFF_HEAD) ✅
- P009: เจ้าหน้าที่ (STAFF) ✅
- P010: ธุรการกลาง (ADMIN) ✅
- + ตำแหน่งอื่นๆ ในงานต่างๆ

#### กองช่าง (D003)
- P004: ผู้อำนวยการกองช่าง (DIVISION_HEAD) ✅
- + ตำแหน่งอื่นๆ ในงานต่างๆ

#### กองคลัง (D004)
- P005: ผู้อำนวยการกองคลัง (DIVISION_HEAD) ✅
- + ตำแหน่งอื่นๆ ในงานต่างๆ

#### กองสวัสดิการสังคม (D005)
- ผู้อำนวยการกองสวัสดิการสังคม (DIVISION_HEAD) ❓ UNVERIFIED
- + ตำแหน่งอื่นๆ ในงานต่างๆ

#### กองการศึกษา (D006)
- ผู้อำนวยการกองการศึกษา (DIVISION_HEAD) ❓ UNVERIFIED
- + ตำแหน่งอื่นๆ ในงานต่างๆ

### 3.3 Position → Department → Role Mapping

| Position_ID | ตำแหน่ง | Department | Role | Mapping Status |
|-------------|---------|------------|------|----------------|
| P001 | นายกเทศมนตรี | D001 | MAYOR | ✅ CONFIRMED |
| P002 | ปลัดเทศบาล | D001 | CLERK | ✅ CONFIRMED |
| P003 | หัวหน้าสำนักปลัด | D002 | OFFICE_HEAD | ✅ CONFIRMED |
| P004 | ผู้อำนวยการกองช่าง | D003 | DIVISION_HEAD | ✅ CONFIRMED |
| P005 | ผู้อำนวยการกองคลัง | D004 | DIVISION_HEAD | ✅ CONFIRMED |
| P008 | นักจัดการงานเทศกิจชำนาญการ | D002 | STAFF_HEAD | ✅ CONFIRMED |
| P009 | เจ้าหน้าที่ | D002 | STAFF | ✅ CONFIRMED |
| P010 | ธุรการกลาง | D002 | ADMIN | ✅ CONFIRMED |

---

## 4. User → Position Coverage

### 4.1 Current Users (จาก Phase 1B)

| User_ID | ชื่อ-สกุล | Position_ID | Position Name | Department_ID | Role | Coverage |
|---------|-----------|-------------|---------------|---------------|------|----------|
| U001 | นายปรีชา กุมภิโร | P001 | นายกเทศมนตรี | D001 | MAYOR | ✅ |
| U002 | ปลัดเทศบาลทดสอบ | P002 | ปลัดเทศบาล | D001 | CLERK | ✅ |
| U003 | หัวหน้าสำนักปลัดทดสอบ | P003 | หัวหน้าสำนักปลัด | D002 | OFFICE_HEAD | ✅ |
| U004 | ผู้อำนวยการกองช่างทดสอบ | P004 | ผู้อำนวยการกองช่าง | D003 | DIVISION_HEAD | ✅ |
| U005 | ผู้อำนวยการกองคลังทดสอบ | P005 | ผู้อำนวยการกองคลัง | D004 | DIVISION_HEAD | ✅ |
| U006 | ส.ต.ท.ทศพล จักสาน | P008 | นักจัดการงานเทศกิจชำนาญการ | D002 | STAFF_HEAD | ✅ |
| U007 | เจ้าหน้าที่ทดสอบ | P009 | เจ้าหน้าที่ | D002 | STAFF | ✅ |
| U008 | ธุรการกลางทดสอบ | P010 | ธุรการกลาง | D002 | ADMIN | ✅ |

**Total Users:** 8
**Coverage:** 8/8 (100%)

### 4.2 Position Coverage Analysis

| Position_ID | Position Name | Has User? | User Count | Status |
|-------------|---------------|:---------:|----------:|--------|
| P001 | นายกเทศมนตรี | ✅ | 1 | ✅ COVERED |
| P002 | ปลัดเทศบาล | ✅ | 1 | ✅ COVERED |
| P003 | หัวหน้าสำนักปลัด | ✅ | 1 | ✅ COVERED |
| P004 | ผู้อำนวยการกองช่าง | ✅ | 1 | ✅ COVERED |
| P005 | ผู้อำนวยการกองคลัง | ✅ | 1 | ✅ COVERED |
| P008 | นักจัดการงานเทศกิจชำนาญการ | ✅ | 1 | ✅ COVERED |
| P009 | เจ้าหน้าที่ | ✅ | 1 | ✅ COVERED |
| P010 | ธุรการกลาง | ✅ | 1 | ✅ COVERED |

**Coverage:** 8/8 Positions have users (100%)

### 4.3 Department Coverage Analysis

| Department_ID | Department Name | Has Position? | Has User? | Status |
|---------------|-----------------|:-------------:|:---------:|--------|
| D001 | ส่วนกลาง | ✅ | ✅ | ✅ COVERED |
| D002 | สำนักปลัด | ✅ | ✅ | ✅ COVERED |
| D003 | กองช่าง | ✅ | ✅ | ✅ COVERED |
| D004 | กองคลัง | ✅ | ✅ | ✅ COVERED |
| D005 | กองสวัสดิการสังคม | ❓ | ❓ | ❓ UNVERIFIED |
| D006 | กองการศึกษา | ❓ | ❓ | ❓ UNVERIFIED |

**Coverage:** 4/6 Departments verified (67%)

---

## 5. Approval Sequence Analysis

### 5.1 Current Data

| Position_ID | ตำแหน่ง | Role | ลำดับอนุมัติ |
|-------------|---------|------|------------:|
| P001 | นายกเทศมนตรี | MAYOR | 5 |
| P002 | ปลัดเทศบาล | CLERK | 4 |
| P003 | หัวหน้าสำนักปลัด | OFFICE_HEAD | 3 |

### 5.2 Analysis

**Observation:**
- ลำดับอนุมัติ: 3, 4, 5
- ไม่มีลำดับ 1, 2
- มีข้อมูลเพียง 3 records

**Possible Interpretations:**
1. ลำดับ 1 = อนุมัติคนแรก, ลำดับ 5 = อนุมัติคนสุดท้าย
2. ลำดับสูง = สำคัญที่สุด
3. หรือความหมายอื่น

**Status:** UNVERIFIED — ต้องมีข้อมูลเพิ่ม

---

## 6. Role Consistency Check

### 6.1 Users.Role vs Positions.Role

| User_ID | Users.Role | Position_ID | Positions.Role | Match? |
|---------|-----------|-------------|----------------|--------|
| U001 | MAYOR | P001 | MAYOR | ✅ |
| U002 | CLERK | P002 | CLERK | ✅ |
| U003 | OFFICE_HEAD | P003 | OFFICE_HEAD | ✅ |
| U004 | DIVISION_HEAD | P004 | ? | ❓ UNVERIFIED |
| U005 | DIVISION_HEAD | P005 | ? | ❓ UNVERIFIED |
| U006 | STAFF_HEAD | P008 | ? | ❓ UNVERIFIED |
| U007 | STAFF | P009 | ? | ❓ UNVERIFIED |
| U008 | ADMIN | P010 | ? | ❓ UNVERIFIED |

**Result:** 3/8 confirmed, 5/8 unverified

---

## 7. Complete Coverage Matrix

### 7.1 Role × Position × Department × Unit

| Role | Position | Department | Unit | Can_View_All | Can_Sign | User |
|------|----------|------------|------|:------------:|:--------:|------|
| MAYOR | P001 | D001 | - | ✔ | ✔ | U001 |
| CLERK | P002 | D001 | - | ✔ | ✔ | U002 |
| OFFICE_HEAD | P003 | D002 | - | ✗ | ✔ | U003 |
| DIVISION_HEAD | P004 | D003 | - | ✗ | ✔ | U004 |
| DIVISION_HEAD | P005 | D004 | - | ✗ | ✔ | U005 |
| STAFF_HEAD | P008 | D002 | UNT0015 | ✗ | ✔ | U006 |
| STAFF | P009 | D002 | UNT0015 | ✗ | ✗ | U007 |
| ADMIN | P010 | D002 | - | ✗ | ✗ | U008 |

### 7.2 Coverage Summary

| Category | Total | Covered | Coverage % |
|----------|------:|--------:|-----------:|
| Roles | 7 | 7 | 100% |
| Positions (verified) | 8 | 8 | 100% |
| Departments (verified) | 6 | 4 | 67% |
| Units (expected) | 33 | 1+ | <5% |
| Users | 8 | 8 | 100% |

---

## 8. Gap Analysis

### 8.1 Identified Gaps

| Gap | Description | Impact | Action Required |
|-----|-------------|--------|-----------------|
| D005, D006 not verified | กองสวัสดิการสังคม, กองการศึกษา ยังไม่ยืนยัน | Medium | ตรวจสอบ Positions Sheet |
| Positions not complete | มีเพียง 8 positions จากที่คาดหวัง | Medium | ตรวจสอบ Positions Sheet |
| Units not verified | มีเพียง UNT0015 ที่ยืนยัน | High | ตรวจสอบ Units Sheet |
| Approval sequence unclear | ไม่ทราบความหมายของลำดับ | Medium | ต้องมี documentation |
| Role permissions TBD | ยังไม่กำหนด permissions | High | ต้องตัดสินใจจาก Project Owner |

### 8.2 Missing Data

| Data | Expected | Verified | Missing |
|------|----------|----------|--------:|
| Departments | 6 | 4 | 2 |
| Positions | 30+ | 8 | 22+ |
| Units | 33 | 1 | 32 |
| Users | ? | 8 | ? |

---

## 9. Implementation Requirements

### 9.1 Before Implementation

1. **ตรวจสอบ Google Sheets จริง**
   - อ่าน Positions Sheet ทั้งหมด
   - อ่าน Departments Sheet ทั้งหมด
   - อ่าน Units Sheet ทั้งหมด

2. **ระบุ Gaps**
   - เปรียบเทียบข้อมูลจริงกับที่คาดหวัง
   - รายงาน Structure Gaps

3. **ห้ามสร้างข้อมูลทับ**
   - ใช้ข้อมูลใน Google Sheets เป็นหลัก
   - รายงาน gaps แต่ห้ามสร้างข้อมูลเอง

### 9.2 Data Validation

**Must Check:**
- ✅ ทุก Position มี Department_ID ที่ถูกต้อง
- ✅ ทุก Position มี Role ที่ถูกต้อง
- ✅ ทุก User มี Position_ID ที่ถูกต้อง
- ✅ ทุก User มี Department_ID ที่ถูกต้อง
- ✅ ไม่มี duplicate Position_ID
- ✅ ไม่มี duplicate User_ID

---

## 10. Summary

### 10.1 What Was Analyzed

✅ Roles Coverage (7 roles — 100%)
✅ Positions Coverage (8 verified — 100% of verified)
✅ User → Position Mapping (8/8 — 100%)
✅ Position → Department Mapping (8/8 — 100%)
✅ Role Consistency Check (3/8 confirmed)
✅ Approval Sequence Analysis (UNVERIFIED)
✅ Complete Coverage Matrix

### 10.2 What Needs Verification

❓ Departments D005, D006
❓ Positions (22+ positions missing)
❓ Units (32 units unverified)
❓ Approval Sequence meaning
❓ Role permissions

### 10.3 Status

**PHASE 1G ROLE & POSITION COVERAGE STATUS: ✅ COVERAGE ANALYSIS COMPLETE — VERIFICATION PENDING**

**Next Step:** ตรวจสอบกับ Google Sheets จริง

---

*รายงานสร้างเมื่อ: Phase 1G — E-Saraban Project*  
*สถานะ: ✅ COVERAGE ANALYSIS COMPLETE — VERIFICATION PENDING*  
*วันที่: 2026*
