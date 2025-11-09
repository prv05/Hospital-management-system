export const generateId = (prefix) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const generatePatientId = () => generateId('PAT');
export const generateDoctorId = () => generateId('DOC');
export const generateNurseId = () => generateId('NUR');
export const generateAppointmentId = () => generateId('APT');
export const generateBillId = () => generateId('BIL');
export const generatePrescriptionId = () => generateId('PRE');
export const generateLabTestId = () => generateId('LAB');
export const generateMedicineId = () => generateId('MED');
export const generateAdmissionId = () => generateId('ADM');
