const routes = {
  login: "/login",
  logout: "/logout",
  dashboard: "/",
  shiftPlanning: "/shift-planning",
  staffs: "/staffs",
  staffAdd: "/staffs/add",
  staff: (id: string | number) => `/staffs?staffId=${id}`,
  orders: "/orders",
  order: (id: string | number) => `/orders/${id}`,
  invoice: (id: string | number) => `/orders/${id}/invoice`,
  orderAdd: "/orders/add",
  products: "/products",
  product: (id: string | number) => `/products/${id}`,
  productEdit: (id: string | number) => `/products/${id}/edit`,
  productAdd: "/products/add",
  categories: "/categories",
  category: (id: string | number) => `/categories/${id}`,
  categoryEdit: (id: string | number) => `/categories/${id}/edit`,
  timeClock: "/time-clock",
  leaves: "/leave-requests",
  shiftCover: "/shift-cover-requests",
  attendance: "/attendance",
  attendanceId: (id: string | number) => `/attendance/${id}`,
  timesheets: "/timesheets",
  payroll: "/payroll",
  holidays: "/holidays",
};

export const apiRoutes = {
  login: "/auth/login",
  currentUser: "/auth/current-staff",
};

export default routes;
