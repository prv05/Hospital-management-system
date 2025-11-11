# 🔐 Hospital Management System - Login Credentials

## 📋 All User Accounts

### 👨‍⚕️ DOCTORS (Test Add Patient & Admit Patient Features)

#### Doctor 1 - Dr. Rajesh Sharma (Cardiology)
- **Email:** `dr.sharma@hospital.com`
- **Password:** `doctor123`
- **Department:** Cardiology
- **Specialization:** Cardiologist
- **Features Access:** Add Patient, Admit Patient, View Patients, Appointments, Analytics

#### Doctor 2 - Dr. Priya Mehta (Cardiology)
- **Email:** `dr.mehta@hospital.com`
- **Password:** `doctor123`
- **Department:** Cardiology
- **Specialization:** Cardiologist

#### Doctor 3 - Dr. Amit Kumar (Neurology)
- **Email:** `dr.kumar@hospital.com`
- **Password:** `doctor123`
- **Department:** Neurology
- **Specialization:** Neurologist

---

### 👨‍💼 ADMIN (Full System Access)
- **Email:** `admin@hospital.com`
- **Password:** `admin123`
- **Access:** User Management, Departments, Beds, System Analytics

---

### 👩‍⚕️ NURSES

#### Nurse 1
- **Email:** `nurse1@hospital.com`
- **Password:** `nurse123`
- **Department:** General Ward
- **Shift:** Morning

#### Nurse 2
- **Email:** `nurse2@hospital.com`
- **Password:** `nurse123`
- **Department:** ICU
- **Shift:** Night

---

### 🧑‍⚕️ PATIENTS (To Test Doctor Features)

#### Patient 1 - John Doe
- **Email:** `john.doe@example.com`
- **Password:** `patient123`
- **Patient ID:** Will be auto-generated
- **Blood Group:** A+

#### Patient 2 - Jane Smith
- **Email:** `jane.smith@example.com`
- **Password:** `patient123`
- **Patient ID:** Will be auto-generated
- **Blood Group:** B+

---

### 💰 BILLING STAFF
- **Email:** `billing@hospital.com`
- **Password:** `billing123`
- **Access:** Generate Bills, Payment Processing, Billing Analytics

---

### 💊 PHARMACY STAFF
- **Email:** `pharmacy@hospital.com`
- **Password:** `pharmacy123`
- **Access:** Medicine Inventory, Dispense Medicines, Stock Management

---

### 🔬 LAB STAFF
- **Email:** `lab@hospital.com`
- **Password:** `lab123`
- **Access:** Lab Tests, Test Results, Lab Analytics

---

## 🎯 Quick Start Guide

### To Test "Add Patient" Feature:
1. Login as any doctor (e.g., `dr.sharma@hospital.com` / `doctor123`)
2. Click **"Add Patient"** in sidebar
3. Fill the comprehensive form with new patient details
4. Submit to create a new patient account

### To Test "Admit Patient" Feature:
1. Login as any doctor
2. Click **"Admit Patient"** in sidebar
3. Search for an existing patient (e.g., search "John")
4. Select patient from results
5. Choose an available bed from the list
6. Fill admission details (type, reason, diagnosis)
7. Submit to admit patient and assign bed

---

## 🌐 Access URLs

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs (if available)

---

## 🔄 Reset Database (If Needed)

To reset the database with seed data:

```bash
cd backend
node seeds/seedData.js
```

This will:
- Clear all existing data
- Create sample departments
- Create sample users (doctors, nurses, patients, admin)
- Create sample beds and appointments

---

## 📝 Default Password for All Accounts

- **Doctors:** `doctor123`
- **Admin:** `admin123`
- **Nurses:** `nurse123`
- **Patients:** `patient123`
- **Billing:** `billing123`
- **Pharmacy:** `pharmacy123`
- **Lab:** `lab123`

---

## ✨ New Features Available

### For Doctors:
1. ✅ **Add New Patient** - Register new patients with complete profile
2. ✅ **Admit Patient** - Admit patients and assign beds
3. ✅ **View Available Beds** - Filter by ward type and floor
4. ✅ All previous features (appointments, prescriptions, etc.)

---

## 🎨 Theme Support

All pages support **Light/Dark Mode**:
- Toggle using the sun/moon icon in the navbar
- Theme persists across page navigation
- Stored in localStorage

---

## 📞 Support

If you encounter any issues:
1. Check if both backend (port 5000) and frontend (port 5174) are running
2. Verify MongoDB connection
3. Check browser console for errors
4. Ensure all dependencies are installed (`npm install`)

---

**Last Updated:** November 12, 2025
