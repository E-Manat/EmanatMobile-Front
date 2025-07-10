// http://192.168.10.104:5045
const MOBILE_BASE = '/mobile';
const AUTH_BASE = '/auth';
const NOTİFİCATİON_BASE = '/notification';

export const API_ENDPOINTS = {
  auth: {
    login: `${AUTH_BASE}/Auth/Login`,
    getProfile: `${AUTH_BASE}/User/GetProfile`,
  },
  mobile: {
    collector: {
      getAll: `/CollectorTask/GetAll`,
      getById: (id: string) => `/CollectorTask/GetById?id=${id}`,
      start: (taskId: string) =>
        `/CollectorTask/StartCollection?taskId=${taskId}`,
      complete: (taskId: string, lat: number, lon: number) =>
        `/CollectorTask/CompleteTask?taskId=${taskId}&latitude=${lat}&longitude=${lon}`,
      startTask: (taskId: string) =>
        `/CollectorTask/StartTask?taskId=${taskId}`,
    },
    technician: {
      getAll: `/TechnicianTask/GetAll`,
      getById: (id: string) => `/TechnicianTask/GetById?id=${id}`,
      start: (taskId: string) =>
        `/TechnicianTask/StartTechnicalWork?taskId=${taskId}`,
      complete: (taskId: string, lat: number, lon: number) =>
        `/TechnicianTask/CompleteTask?taskId=${taskId}&latitude=${lat}&longitude=${lon}`,
      startRoute: (taskId: string) =>
        `/TechnicianTask/StartRoute?taskId=${taskId}`,
    },
    terminal: {
      getAll: `/Terminal/GetAll`,
      getById: (id: string) => `/Terminal/GetById?id=${id}`,
      getCollectorAreaTerminals: `/Terminal/GetCollectorAreaTerminals`,
      getTechnicianAreaTerminals: `/Terminal/GetTechnicianAreaTerminals`,
    },
    report: {
      getAll: (search: string = '', dateFilter: number = 0) =>
        `/Report/GetAll?Search=${search}&DateFilter=${dateFilter}`,
      getById: (id: string) => `/Report/GetById?id=${id}`,
      create: `/Report/CreateReport`,
    },
    problem: {
      getAll: `/Problem/GetAll`,
    },
    notification: {
      get: `/Notification/Get`,
      getUnreads: `/Notification/GetUnreads`,
      markAllAsRead: `/Notification/MarkAllAsRead`,
      markAsRead: `/Notification/MarkAsRead`,
      delete: `/Notification/Delete`,
      deleteSelected: `/Notification/DeleteSelectedIds`,
      deleteAll: `/Notification/DeleteAll`,
    },
  },
};
