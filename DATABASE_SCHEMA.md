# Hospital Management System - Database Schema

## Overview
This document describes the complete database schema for the Hospital Management System built with MongoDB.

---

## Collections

### 1. User Collection
**Collection Name:** `users`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| firstName | String | Yes | No | User's first name |
| lastName | String | Yes | No | User's last name |
| email | String | Yes | Yes | User's email address |
| password | String | Yes | No | Hashed password |
| phone | String | Yes | No | Contact number |
| role | String (Enum) | Yes | No | Role: admin, doctor, nurse, patient, lab, pharmacy, billing |
| isActive | Boolean | No | No | Account active status (default: true) |
| lastLogin | Date | No | No | Last login timestamp |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- email (unique)
- role

---

### 2. Patient Collection
**Collection Name:** `patients`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| user | ObjectId (ref: User) | Yes | Yes | Reference to User |
| patientId | String | Yes | Yes | Auto-generated patient ID (PAT-XXXXXXXXXX) |
| dateOfBirth | Date | Yes | No | Patient's date of birth |
| gender | String (Enum) | Yes | No | Gender: male, female, other |
| bloodGroup | String | No | No | Blood group (A+, B+, O+, etc.) |
| address | Object | No | No | Address details |
| address.street | String | No | No | Street address |
| address.city | String | No | No | City |
| address.state | String | No | No | State |
| address.zipCode | String | No | No | ZIP code |
| address.country | String | No | No | Country |
| emergencyContact | Object | No | No | Emergency contact details |
| emergencyContact.name | String | No | No | Contact name |
| emergencyContact.relationship | String | No | No | Relationship to patient |
| emergencyContact.phone | String | No | No | Contact phone number |
| medicalHistory | Object | No | No | Medical history |
| medicalHistory.allergies | Array[String] | No | No | List of allergies |
| medicalHistory.chronicDiseases | Array[String] | No | No | List of chronic diseases |
| medicalHistory.surgeries | Array[Object] | No | No | Surgery history |
| medicalHistory.vaccinations | Array[Object] | No | No | Vaccination records |
| medicalHistory.familyHistory | String | No | No | Family medical history |
| primaryDoctor | ObjectId (ref: Doctor) | No | No | Primary treating doctor |
| treatingDoctors | Array[ObjectId] (ref: Doctor) | No | No | List of treating doctors |
| insurance | Object | No | No | Insurance information |
| insurance.provider | String | No | No | Insurance provider name |
| insurance.policyNumber | String | No | No | Policy number |
| insurance.validUntil | Date | No | No | Policy validity date |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- patientId (unique)
- user (unique)
- primaryDoctor

---

### 3. Doctor Collection
**Collection Name:** `doctors`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| user | ObjectId (ref: User) | Yes | Yes | Reference to User |
| employeeId | String | Yes | Yes | Employee identification |
| department | ObjectId (ref: Department) | Yes | No | Department reference |
| specialization | String | Yes | No | Doctor's specialization |
| qualification | String | Yes | No | Educational qualification |
| experience | Number | Yes | No | Years of experience |
| consultationFee | Number | No | No | Consultation fee amount |
| availableSlots | Array[Object] | No | No | Available appointment slots |
| availableSlots.day | String | No | No | Day of week |
| availableSlots.startTime | String | No | No | Slot start time |
| availableSlots.endTime | String | No | No | Slot end time |
| availableSlots.maxPatients | Number | No | No | Maximum patients per slot |
| rating | Number | No | No | Doctor rating (default: 0) |
| totalReviews | Number | No | No | Total reviews count (default: 0) |
| isAvailable | Boolean | No | No | Current availability (default: true) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- user (unique)
- employeeId (unique)
- department
- specialization

---

### 4. Nurse Collection
**Collection Name:** `nurses`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| user | ObjectId (ref: User) | Yes | Yes | Reference to User |
| employeeId | String | Yes | Yes | Employee identification |
| department | ObjectId (ref: Department) | Yes | No | Department reference |
| shift | String (Enum) | Yes | No | Shift: morning, evening, night |
| specialization | String | No | No | Nursing specialization |
| qualification | String | Yes | No | Educational qualification |
| experience | Number | Yes | No | Years of experience |
| assignedPatients | Array[ObjectId] (ref: Patient) | No | No | Currently assigned patients |
| isAvailable | Boolean | No | No | Current availability (default: true) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- user (unique)
- employeeId (unique)
- department
- shift

---

### 5. Department Collection
**Collection Name:** `departments`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| name | String | Yes | Yes | Department name |
| code | String | Yes | Yes | Department code |
| description | String | No | No | Department description |
| head | ObjectId (ref: Doctor) | No | No | Department head |
| location | String | No | No | Physical location |
| contactNumber | String | No | No | Contact number |
| isActive | Boolean | No | No | Department active status (default: true) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- name (unique)
- code (unique)

---

### 6. Appointment Collection
**Collection Name:** `appointments`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| appointmentId | String | Yes | Yes | Auto-generated appointment ID |
| patient | ObjectId (ref: Patient) | Yes | No | Reference to patient |
| doctor | ObjectId (ref: Doctor) | Yes | No | Reference to doctor |
| department | ObjectId (ref: Department) | Yes | No | Department reference |
| appointmentDate | Date | Yes | No | Appointment date and time |
| slotTime | String | Yes | No | Time slot |
| reason | String | Yes | No | Reason for visit |
| type | String (Enum) | No | No | Type: consultation, follow-up, emergency (default: consultation) |
| status | String (Enum) | No | No | Status: scheduled, confirmed, in-progress, completed, cancelled (default: scheduled) |
| notes | String | No | No | Additional notes |
| vitals | Object | No | No | Vital signs |
| vitals.bloodPressure | String | No | No | Blood pressure |
| vitals.temperature | Number | No | No | Temperature |
| vitals.pulse | Number | No | No | Pulse rate |
| vitals.weight | Number | No | No | Weight |
| vitals.height | Number | No | No | Height |
| prescription | ObjectId (ref: Prescription) | No | No | Associated prescription |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- appointmentId (unique)
- patient
- doctor
- appointmentDate
- status

---

### 7. Prescription Collection
**Collection Name:** `prescriptions`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| prescriptionId | String | Yes | Yes | Auto-generated prescription ID |
| patient | ObjectId (ref: Patient) | Yes | No | Reference to patient |
| doctor | ObjectId (ref: Doctor) | Yes | No | Reference to doctor |
| appointment | ObjectId (ref: Appointment) | No | No | Associated appointment |
| diagnosis | String | Yes | No | Medical diagnosis |
| medicines | Array[Object] | No | No | Prescribed medicines |
| medicines.medicineName | String | Yes | No | Medicine name |
| medicines.dosage | String | Yes | No | Dosage information |
| medicines.frequency | String | Yes | No | Frequency of intake |
| medicines.duration | String | Yes | No | Duration of treatment |
| medicines.timing | String (Enum) | No | No | Timing: before-meal, after-meal, with-meal, empty-stomach, bedtime |
| medicines.instructions | String | No | No | Special instructions |
| medicines.quantity | Number | No | No | Quantity prescribed |
| tests | Array[Object] | No | No | Recommended tests |
| tests.testName | String | No | No | Test name |
| tests.urgency | String (Enum) | No | No | Urgency: routine, urgent, stat |
| advice | String | No | No | Doctor's advice |
| dietRecommendations | String | No | No | Diet recommendations |
| followUpDate | Date | No | No | Follow-up appointment date |
| isDispensed | Boolean | No | No | Medicine dispensed status (default: false) |
| dispensedBy | ObjectId (ref: User) | No | No | Dispensed by pharmacy user |
| dispensedAt | Date | No | No | Dispensing timestamp |
| validUntil | Date | No | No | Prescription validity (default: 30 days) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- prescriptionId (unique)
- patient
- doctor
- appointment

---

### 8. Admission Collection
**Collection Name:** `admissions`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| admissionId | String | Yes | Yes | Auto-generated admission ID |
| patient | ObjectId (ref: Patient) | Yes | No | Reference to patient |
| doctor | ObjectId (ref: Doctor) | Yes | No | Admitting doctor |
| department | ObjectId (ref: Department) | Yes | No | Department reference |
| bed | ObjectId (ref: Bed) | Yes | No | Assigned bed |
| admissionDate | Date | Yes | No | Admission date and time |
| dischargeDate | Date | No | No | Discharge date and time |
| reason | String | Yes | No | Reason for admission |
| diagnosis | String | No | No | Medical diagnosis |
| treatmentPlan | String | No | No | Treatment plan |
| status | String (Enum) | No | No | Status: admitted, under-treatment, discharged (default: admitted) |
| notes | String | No | No | Additional notes |
| vitalsHistory | Array[Object] | No | No | Vitals tracking history |
| assignedNurses | Array[ObjectId] (ref: Nurse) | No | No | Assigned nurses |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- admissionId (unique)
- patient
- doctor
- bed
- status

---

### 9. Bed Collection
**Collection Name:** `beds`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| bedNumber | String | Yes | Yes | Bed identification number |
| ward | Object | Yes | No | Ward information |
| ward.type | String (Enum) | Yes | No | Ward type: General, ICU, NICU, Private, Semi-Private |
| ward.floor | String | Yes | No | Floor number |
| ward.roomNumber | String | No | No | Room number |
| department | ObjectId (ref: Department) | No | No | Department reference |
| status | String (Enum) | No | No | Status: available, occupied, maintenance (default: available) |
| currentPatient | ObjectId (ref: Patient) | No | No | Current patient occupying bed |
| currentAdmission | ObjectId (ref: Admission) | No | No | Current admission reference |
| features | Array[String] | No | No | Bed features (ventilator, oxygen, etc.) |
| dailyRate | Number | No | No | Daily bed rate |
| isActive | Boolean | No | No | Bed active status (default: true) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- bedNumber (unique)
- status
- ward.type
- department

---

### 10. LabTest Collection
**Collection Name:** `labtests`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| labTestId | String | Yes | Yes | Auto-generated lab test ID |
| patient | ObjectId (ref: Patient) | Yes | No | Reference to patient |
| doctor | ObjectId (ref: Doctor) | Yes | No | Ordering doctor |
| testName | String | Yes | No | Name of the test |
| testCategory | String | Yes | No | Test category |
| status | String (Enum) | No | No | Status: requested, sample-collected, in-process, completed, cancelled (default: requested) |
| urgency | String (Enum) | No | No | Urgency: routine, urgent, stat (default: routine) |
| sampleCollectedAt | Date | No | No | Sample collection timestamp |
| sampleCollectedBy | ObjectId (ref: User) | No | No | Lab technician who collected sample |
| results | Array[Object] | No | No | Test results |
| results.parameter | String | No | No | Test parameter name |
| results.value | String | No | No | Result value |
| results.unit | String | No | No | Unit of measurement |
| results.normalRange | String | No | No | Normal value range |
| results.flag | String (Enum) | No | No | Flag: normal, high, low, critical |
| resultsUploadedAt | Date | No | No | Results upload timestamp |
| resultsUploadedBy | ObjectId (ref: User) | No | No | Lab user who uploaded results |
| reportFile | String | No | No | Path to report file |
| notes | String | No | No | Additional notes |
| cost | Number | No | No | Test cost |
| isPaid | Boolean | No | No | Payment status (default: false) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- labTestId (unique)
- patient
- doctor
- status
- testCategory

---

### 11. Medicine Collection
**Collection Name:** `medicines`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| name | String | Yes | Yes | Medicine name |
| genericName | String | No | No | Generic name |
| category | String | Yes | No | Medicine category |
| manufacturer | String | No | No | Manufacturer name |
| description | String | No | No | Medicine description |
| dosageForm | String | No | No | Form: tablet, capsule, syrup, injection, etc. |
| strength | String | No | No | Strength/concentration |
| price | Number | Yes | No | Unit price |
| stockQuantity | Number | Yes | No | Available stock quantity |
| reorderLevel | Number | No | No | Minimum stock level for reorder |
| expiryDate | Date | No | No | Expiry date |
| sideEffects | String | No | No | Common side effects |
| contraindications | String | No | No | Contraindications |
| isActive | Boolean | No | No | Medicine active status (default: true) |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- name (unique)
- category
- stockQuantity

---

### 12. Billing Collection
**Collection Name:** `billings`

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| _id | ObjectId | Yes | Yes | Auto-generated MongoDB ID |
| billId | String | Yes | Yes | Auto-generated bill ID |
| patient | ObjectId (ref: Patient) | Yes | No | Reference to patient |
| admission | ObjectId (ref: Admission) | No | No | Related admission |
| billDate | Date | Yes | No | Bill generation date |
| items | Array[Object] | Yes | No | Billing items |
| items.description | String | Yes | No | Item description |
| items.category | String | Yes | No | Category: consultation, procedure, medicine, test, bed, etc. |
| items.quantity | Number | Yes | No | Quantity |
| items.unitPrice | Number | Yes | No | Unit price |
| items.totalPrice | Number | Yes | No | Total price |
| items.reference | ObjectId | No | No | Reference to related document |
| subtotal | Number | Yes | No | Subtotal amount |
| tax | Number | No | No | Tax amount |
| discount | Number | No | No | Discount amount |
| totalAmount | Number | Yes | No | Total bill amount |
| paidAmount | Number | No | No | Amount paid (default: 0) |
| balanceAmount | Number | Yes | No | Balance due |
| paymentStatus | String (Enum) | No | No | Status: unpaid, partial, paid (default: unpaid) |
| paymentMethod | String | No | No | Payment method: cash, card, insurance, online |
| paymentDate | Date | No | No | Payment date |
| insuranceClaim | Object | No | No | Insurance claim details |
| notes | String | No | No | Additional notes |
| createdBy | ObjectId (ref: User) | No | No | Bill created by user |
| createdAt | Date | Auto | No | Record creation timestamp |
| updatedAt | Date | Auto | No | Last update timestamp |

**Indexes:**
- billId (unique)
- patient
- admission
- paymentStatus

---

## Relationships

### One-to-One Relationships
1. **User ↔ Patient**: Each user can be one patient
2. **User ↔ Doctor**: Each user can be one doctor
3. **User ↔ Nurse**: Each user can be one nurse
4. **Admission ↔ Bed**: Each admission occupies one bed at a time

### One-to-Many Relationships
1. **Doctor → Appointments**: One doctor has many appointments
2. **Patient → Appointments**: One patient has many appointments
3. **Doctor → Prescriptions**: One doctor writes many prescriptions
4. **Patient → Prescriptions**: One patient has many prescriptions
5. **Doctor → LabTests**: One doctor orders many lab tests
6. **Patient → LabTests**: One patient has many lab tests
7. **Patient → Admissions**: One patient can have multiple admissions
8. **Doctor → Admissions**: One doctor admits many patients
9. **Patient → Billings**: One patient has many bills
10. **Department → Doctors**: One department has many doctors
11. **Department → Nurses**: One department has many nurses
12. **Department → Beds**: One department has many beds

### Many-to-Many Relationships
1. **Patient ↔ Doctors**: Patients can be treated by multiple doctors (treatingDoctors)
2. **Nurse ↔ Patients**: Nurses can be assigned to multiple patients
3. **Admission ↔ Nurses**: Multiple nurses can be assigned to one admission

---

## Data Validation Rules

### User Collection
- Email must be valid format
- Phone must be valid format
- Password must be hashed before storage
- Role must be one of: admin, doctor, nurse, patient, lab, pharmacy, billing

### Patient Collection
- Age must be calculated from dateOfBirth
- Blood group must be valid (A+, A-, B+, B-, O+, O-, AB+, AB-)
- Gender must be one of: male, female, other

### Appointment Collection
- Appointment date cannot be in the past
- Status transitions: scheduled → confirmed → in-progress → completed
- Cannot book appointment if slot is full

### Prescription Collection
- At least one medicine must be prescribed
- Valid until date defaults to 30 days from creation
- Cannot dispense expired prescription

### Admission Collection
- Discharge date must be after admission date
- Cannot admit patient if no beds available
- Bed status must be updated when admission status changes

### Billing Collection
- Total amount = subtotal + tax - discount
- Balance amount = total amount - paid amount
- Payment status automatically updated based on paid amount

---

## Indexes Summary

**Critical Indexes for Performance:**
1. User: email, role
2. Patient: patientId, user, primaryDoctor
3. Doctor: user, employeeId, department, specialization
4. Nurse: user, employeeId, department, shift
5. Appointment: appointmentId, patient, doctor, appointmentDate, status
6. Prescription: prescriptionId, patient, doctor
7. Admission: admissionId, patient, doctor, bed, status
8. LabTest: labTestId, patient, doctor, status
9. Bed: bedNumber, status, ward.type
10. Billing: billId, patient, paymentStatus

---

## Data Security

### Sensitive Fields
- User passwords: Hashed using bcrypt
- Patient medical history: Access controlled by role
- Billing information: Restricted to billing staff and admins
- Prescription details: Only accessible to prescribing doctor and patient

### Audit Fields
All collections include:
- `createdAt`: Timestamp of record creation
- `updatedAt`: Timestamp of last modification

### Soft Delete
Some collections use `isActive` flag for soft delete instead of hard deletion:
- Department
- Medicine
- Bed
- User

---

## Notes

1. All ObjectId references use MongoDB's native ObjectId type
2. Timestamps are automatically managed by Mongoose (`timestamps: true`)
3. Enum values are enforced at the schema level
4. Default values are specified where applicable
5. Required fields are strictly enforced
6. Unique constraints prevent duplicate entries
7. Indexes are created to optimize query performance
