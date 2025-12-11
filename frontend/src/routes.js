// src/routes.js
import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdEvent,
  MdGroups,
  MdAddCircle,
  MdAssessment
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';
import EventList from "views/admin/eventList";
import CreateEvent from "views/admin/createEvent";
import JoinedEvents from "views/admin/joinedEvents";
import MyEventsReports from "views/admin/reports/MyEventsReports";

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';
import LandingPage from 'views/auth/landingPage';
import NotFound from 'views/auth/notFound';

// CORRECCIÓN: Importa desde la ubicación correcta
import AdminReports from "views/admin/reports/AdminReports";

// Importa AdminRoute (necesitas crear este archivo primero)
import AdminRoute from 'components/AdminRoute';

const routes = [
  {
    name: "Lista de eventos",
    layout: "/user",
    path: "/event-list",
    icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
    component: <EventList />,
  },
  {
    name: "Crear Evento",
    layout: "/user",
    path: "/create-event",
    icon: <Icon as={MdAddCircle} width="20px" height="20px" color="inherit" />,
    component: <CreateEvent />,
  },
  {
    name: 'Tus Eventos',
    layout: '/user',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Eventos Registrados',
    layout: '/user',
    path: '/registered',
    icon: <Icon as={MdGroups} width="20px" height="20px" color="inherit" />,
    component: <JoinedEvents />,
  },
  {
    name: 'Mis Reportes',
    layout: '/user',
    path: '/reports',
    icon: <Icon as={MdAssessment} width="20px" height="20px" color="inherit" />,
    component: <MyEventsReports />,
  },
  // NUEVA RUTA SOLO PARA ADMINISTRADORES
  {
    name: 'Reportes Admin',
    layout: '/user',
    path: '/admin-reports',
    icon: <Icon as={MdAssessment} width="20px" height="20px" color="inherit" />,
    component: (
      <AdminRoute>
        <AdminReports />
      </AdminRoute>
    ),
    showForAdmin: true,
  },
  {
    name: "Landing Page",
    layout: "/auth",
    path: "/home",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <LandingPage />,
  },
  {
    name: 'Data Tables',
    layout: '/user',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/data-tables',
    component: <DataTables />,
  },
  {
    name: 'Profile',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignUpCentered />,
  },
  {
    name: 'RTL Admin',
    layout: '/rtl',
    path: '/rtl-default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <RTL />,
  },
  {
    name: 'Not Found',
    layout: '/auth',
    path: '*',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <NotFound />,
  },
  {
    name: 'Not Found',
    layout: '/user',
    path: '*',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <NotFound />,
  },
  {
    name: 'Not Found',
    layout: '/rtl',
    path: '*',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <NotFound />,
  },
];

export default routes;