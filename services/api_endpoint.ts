// http://192.168.10.104:5045
// http://172.23.0.78:5000
const MOBILE_BASE = '/mobile';
const AUTH_BASE = '/auth';
const NOTİFİCATİON_BASE = '/notification';

export const API_ENDPOINTS = {
  auth: {
    login: `${AUTH_BASE}/Auth/Login`,
    getProfile: `${AUTH_BASE}/User/GetProfile`,
    sendEmail: `${AUTH_BASE}/Auth/SendEmail`,
    confirmPassword: `${AUTH_BASE}/Auth/ConfirmPassword`,
    confirmOtp: `${AUTH_BASE}/Auth/ConfirmOtp`,
  },
  mobile: {
    collector: {
      getAll: `${MOBILE_BASE}/CollectorTask/GetAll`,
      getById: (id: string) => `${MOBILE_BASE}/CollectorTask/GetById?id=${id}`,
      start: (taskId: string) =>
        `${MOBILE_BASE}/CollectorTask/StartCollection?taskId=${taskId}`,
      complete: (taskId: string, lat: number, lon: number) =>
        `${MOBILE_BASE}/CollectorTask/CompleteTask?taskId=${taskId}&latitude=${lat}&longitude=${lon}`,
      startTask: (taskId: string) =>
        `${MOBILE_BASE}/CollectorTask/StartTask?taskId=${taskId}`,
    },
    technician: {
      getAll: `${MOBILE_BASE}/TechnicianTask/GetAll`,
      getById: (id: string) => `${MOBILE_BASE}/TechnicianTask/GetById?id=${id}`,
      start: (taskId: string) =>
        `${MOBILE_BASE}/TechnicianTask/StartTechnicalWork?taskId=${taskId}`,
      complete: (taskId: string, lat: number, lon: number) =>
        `${MOBILE_BASE}/TechnicianTask/CompleteTask?taskId=${taskId}&latitude=${lat}&longitude=${lon}`,
      startRoute: (taskId: string) =>
        `${MOBILE_BASE}/TechnicianTask/StartRoute?taskId=${taskId}`,
    },
    terminal: {
      getAll: `${MOBILE_BASE}/Terminal/GetAll`,
      getById: (id: string) => `${MOBILE_BASE}/Terminal/GetById?id=${id}`,
      getCollectorAreaTerminals: `${MOBILE_BASE}/Terminal/GetCollectorAreaTerminals`,
      getTechnicianAreaTerminals: `${MOBILE_BASE}/Terminal/GetTechnicianAreaTerminals`,
    },
    report: {
      getAll: (search: string = '', dateFilter: number = 0) =>
        `${MOBILE_BASE}/Report/GetAll?Search=${search}&DateFilter=${dateFilter}`,
      getById: (id: string) => `${MOBILE_BASE}/Report/GetById?id=${id}`,
      create: `${MOBILE_BASE}/Report/CreateReport`,
    },
    problem: {
      getAll: `${MOBILE_BASE}/Problem/GetAll`,
    },
  },
  notification: {
    get: `${NOTİFİCATİON_BASE}/Notification/Get`,
    getUnreads: `${NOTİFİCATİON_BASE}/Notification/GetUnreads`,
    markAllAsRead: `${NOTİFİCATİON_BASE}/Notification/MarkAllAsRead`,
    markAsRead: `${NOTİFİCATİON_BASE}/Notification/MarkAsRead`,
    delete: `${NOTİFİCATİON_BASE}/Notification/Delete`,
    deleteSelected: `${NOTİFİCATİON_BASE}/Notification/DeleteSelectedIds`,
    deleteAll: `${NOTİFİCATİON_BASE}/Notification/DeleteAll`,
  },
};
