/*!
=========================================================
* Eventify - Sistema de Gestión de Eventos
=========================================================

* Reportes y Estadísticas
=========================================================
*/

// Chakra imports
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Button,
  Badge,
  Progress,
  useToast,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuthStore } from 'stores/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MdBarChart, MdEvent, MdPeople, MdCategory, MdTrendingUp } from 'react-icons/md';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [organizerReports, setOrganizerReports] = useState(null);
  const [adminReports, setAdminReports] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const user = useAuthStore((s) => s.user);
  const userProfile = useAuthStore((s) => s.userProfile);
  const toast = useToast();
  const API_BASE = process.env.REACT_APP_API_BASE;

  // Determinar rol del usuario
  const userRole = userProfile?.role || 'student';

  // Cargar reportes según el rol
  useEffect(() => {
    if (userRole === 'organizer' || userRole === 'admin') {
      loadOrganizerReports();
    }
    
    if (userRole === 'admin') {
      loadAdminReports();
    } else {
      setLoading(false);
    }
  }, [userRole]);

  const loadOrganizerReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/reports/organizer/all-events/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrganizerReports(data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'No se pudieron cargar los reportes',
            status: 'error',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar reportes',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/api/reports/admin/global/`;
      
      // Agregar parámetros de fecha si existen
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('start_date', dateRange.startDate);
      if (dateRange.endDate) params.append('end_date', dateRange.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminReports(data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'No se pudieron cargar los reportes',
            status: 'error',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar reportes',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetails = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/reports/organizer/event/${eventId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedEvent(data);
          setActiveTab(1); // Cambiar a la pestaña de detalle
        } else {
          toast({
            title: 'Error',
            description: data.error || 'No se pudo cargar el detalle',
            status: 'error',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar detalles',
        status: 'error',
      });
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(2) || 0}%`;
  };

  // Si no tiene permisos
  if (!user) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            Debes iniciar sesión para ver los reportes.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Container maxW="container.xl">
        <Heading mb={8} display="flex" alignItems="center" gap={2}>
          <MdBarChart /> Reportes y Estadísticas
        </Heading>
        
        <Tabs onChange={setActiveTab} index={activeTab} isLazy>
          <TabList>
            {userRole === 'admin' && <Tab>📈 Reporte Global</Tab>}
            {(userRole === 'organizer' || userRole === 'admin') && (
              <>
                <Tab>🎯 Mis Eventos</Tab>
                <Tab>👥 Detalle por Evento</Tab>
              </>
            )}
            {userRole === 'student' && (
              <Tab>Mis Inscripciones</Tab>
            )}
          </TabList>

          <TabPanels>
            {/* PANEL PARA ADMINISTRADORES - REPORTE GLOBAL */}
            {userRole === 'admin' && (
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Filtros de fecha */}
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Filtros de Fecha</Heading>
                      <HStack spacing={4} flexWrap="wrap">
                        <Box flex="1" minW="200px">
                          <Text mb={2}>Fecha de inicio</Text>
                          <Input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                          />
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text mb={2}>Fecha de fin</Text>
                          <Input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                          />
                        </Box>
                        <Button
                          colorScheme="blue"
                          onClick={loadAdminReports}
                          mt={8}
                        >
                          Aplicar Filtros
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDateRange({ startDate: '', endDate: '' });
                            loadAdminReports();
                          }}
                          mt={8}
                        >
                          Limpiar Filtros
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>

                  {adminReports ? (
                    <>
                      {/* Resumen general */}
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        <Card>
                          <CardBody>
                            <Stat>
                              <StatLabel display="flex" alignItems="center" gap={2}>
                                <MdEvent /> Total Eventos
                              </StatLabel>
                              <StatNumber>{adminReports.summary.total_events}</StatNumber>
                              <StatHelpText>
                                {adminReports.summary.upcoming_events} próximos
                              </StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardBody>
                            <Stat>
                              <StatLabel display="flex" alignItems="center" gap={2}>
                                <MdPeople /> Usuarios
                              </StatLabel>
                              <StatNumber>{adminReports.summary.total_users}</StatNumber>
                              <StatHelpText>
                                {adminReports.summary.users_with_profile} con perfil
                              </StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardBody>
                            <Stat>
                              <StatLabel display="flex" alignItems="center" gap={2}>
                                <MdTrendingUp /> Inscripciones
                              </StatLabel>
                              <StatNumber>{adminReports.summary.total_registrations}</StatNumber>
                              <StatHelpText>
                                {formatPercentage(adminReports.summary.attendance_rate)} asistencia
                              </StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardBody>
                            <Stat>
                              <StatLabel>Eventos Activos</StatLabel>
                              <StatNumber>{adminReports.summary.upcoming_events}</StatNumber>
                              <StatHelpText>
                                {adminReports.summary.ongoing_events} en curso
                              </StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Eventos más populares */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">🏆 Eventos Más Populares</Heading>
                        </CardHeader>
                        <CardBody>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Evento</Th>
                                <Th>Organizador</Th>
                                <Th>Fecha</Th>
                                <Th isNumeric>Inscritos</Th>
                                <Th isNumeric>Asistentes</Th>
                                <Th isNumeric>Ocupación</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {adminReports.popular_events.map((event) => (
                                <Tr key={event.id}>
                                  <Td fontWeight="medium">{event.title}</Td>
                                  <Td>{event.organizer}</Td>
                                  <Td>{formatDate(event.date)}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="blue">{event.registered_count}</Badge>
                                  </Td>
                                  <Td isNumeric>
                                    <Badge colorScheme={event.attended_count > 0 ? "green" : "gray"}>
                                      {event.attended_count}
                                    </Badge>
                                  </Td>
                                  <Td isNumeric>
                                    <HStack spacing={2}>
                                      <Progress 
                                        value={event.occupancy_rate} 
                                        size="sm" 
                                        width="100px"
                                        colorScheme={
                                          event.occupancy_rate > 90 ? 'green' :
                                          event.occupancy_rate > 50 ? 'yellow' : 'red'
                                        }
                                      />
                                      <Text fontSize="sm">{event.occupancy_rate}%</Text>
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </Card>

                      {/* Distribución por categoría */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">📂 Distribución por Categoría</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                              <PieChart width={400} height={300}>
                                <Pie
                                  data={adminReports.category_distribution.map((cat) => ({
                                    name: cat.category,
                                    value: cat.count
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {adminReports.category_distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Eventos']} />
                              </PieChart>
                            </Box>
                            <Box>
                              <Table variant="simple" size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Categoría</Th>
                                    <Th isNumeric>Eventos</Th>
                                    <Th isNumeric>Porcentaje</Th>
                                    <Th isNumeric>Capacidad Avg</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {adminReports.category_distribution.map((category) => (
                                    <Tr key={category.category}>
                                      <Td>{category.category}</Td>
                                      <Td isNumeric>{category.count}</Td>
                                      <Td isNumeric>{category.percentage}%</Td>
                                      <Td isNumeric>{category.avg_capacity}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Top organizadores */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">👥 Top Organizadores</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            {adminReports.organizer_stats.slice(0, 6).map((org, index) => (
                              <Card key={index} size="sm">
                                <CardBody>
                                  <VStack align="stretch" spacing={2}>
                                    <Text fontWeight="bold">{org.organizer__user__username || 'Desconocido'}</Text>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm">Eventos:</Text>
                                      <Badge colorScheme="blue">{org.event_count}</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm">Inscripciones:</Text>
                                      <Badge colorScheme="green">{org.total_registrations}</Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                      <Text fontSize="sm">Asistencia:</Text>
                                      <Badge colorScheme="purple">
                                        {org.avg_attendance ? `${(org.avg_attendance * 100).toFixed(1)}%` : 'N/A'}
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>Sin datos</AlertTitle>
                      <AlertDescription>
                        No hay datos de reporte disponibles. Aplica filtros o crea algunos eventos primero.
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
            )}

            {/* PANEL PARA ORGANIZADORES - RESUMEN */}
            {(userRole === 'organizer' || userRole === 'admin') && (
              <>
                <TabPanel>
                  {organizerReports ? (
                    <VStack spacing={6} align="stretch">
                      {/* Estadísticas generales */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">📊 Resumen de Mis Eventos</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                            <Stat>
                              <StatLabel>Total Eventos</StatLabel>
                              <StatNumber>{organizerReports.total_statistics.total_events}</StatNumber>
                              <StatHelpText>Creados por ti</StatHelpText>
                            </Stat>
                            <Stat>
                              <StatLabel>Total Inscritos</StatLabel>
                              <StatNumber>{organizerReports.total_statistics.total_registered}</StatNumber>
                              <StatHelpText>En todos tus eventos</StatHelpText>
                            </Stat>
                            <Stat>
                              <StatLabel>Total Asistentes</StatLabel>
                              <StatNumber>{organizerReports.total_statistics.total_attended}</StatNumber>
                              <StatHelpText>
                                {formatPercentage(organizerReports.total_statistics.avg_attendance_rate)} tasa
                              </StatHelpText>
                            </Stat>
                            <Stat>
                              <StatLabel>Ocupación Promedio</StatLabel>
                              <StatNumber>{formatPercentage(organizerReports.total_statistics.avg_occupancy_rate)}</StatNumber>
                              <StatHelpText>De capacidad utilizada</StatHelpText>
                            </Stat>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Lista de eventos */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">🎯 Mis Eventos</Heading>
                        </CardHeader>
                        <CardBody>
                          {organizerReports.events.length > 0 ? (
                            <Table variant="simple">
                              <Thead>
                                <Tr>
                                  <Th>Evento</Th>
                                  <Th>Fecha</Th>
                                  <Th isNumeric>Inscritos</Th>
                                  <Th isNumeric>Asistentes</Th>
                                  <Th isNumeric>Tasa de Asistencia</Th>
                                  <Th isNumeric>Ocupación</Th>
                                  <Th>Acciones</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {organizerReports.events.map((event) => (
                                  <Tr key={event.id}>
                                    <Td fontWeight="medium">{event.title}</Td>
                                    <Td>{formatDate(event.date)}</Td>
                                    <Td isNumeric>
                                      <Badge colorScheme="blue">{event.registered_count}</Badge>
                                    </Td>
                                    <Td isNumeric>
                                      <Badge colorScheme={event.attended_count > 0 ? "green" : "gray"}>
                                        {event.attended_count}
                                      </Badge>
                                    </Td>
                                    <Td isNumeric>
                                      <Badge
                                        colorScheme={
                                          event.attendance_rate > 80 ? 'green' :
                                          event.attendance_rate > 50 ? 'yellow' : 'red'
                                        }
                                      >
                                        {event.attendance_rate}%
                                      </Badge>
                                    </Td>
                                    <Td isNumeric>
                                      <Progress 
                                        value={event.occupancy_rate} 
                                        size="sm" 
                                        width="80px"
                                        colorScheme={
                                          event.occupancy_rate > 90 ? 'green' :
                                          event.occupancy_rate > 50 ? 'yellow' : 'orange'
                                        }
                                      />
                                    </Td>
                                    <Td>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => loadEventDetails(event.id)}
                                      >
                                        Ver Detalle
                                      </Button>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          ) : (
                            <Alert status="info">
                              <AlertIcon />
                              <AlertTitle>Sin eventos</AlertTitle>
                              <AlertDescription>
                                No has creado ningún evento todavía.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>Sin datos</AlertTitle>
                      <AlertDescription>
                        No hay datos de reporte disponibles.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabPanel>

                {/* PANEL PARA ORGANIZADORES - DETALLE DEL EVENTO */}
                <TabPanel>
                  {selectedEvent ? (
                    <VStack spacing={6} align="stretch">
                      {/* Encabezado del evento */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">
                            📋 Reporte de Asistencia: {selectedEvent.event.title}
                          </Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                              <VStack align="stretch" spacing={3}>
                                <Text><strong>📅 Fecha:</strong> {formatDate(selectedEvent.event.date)}</Text>
                                {selectedEvent.event.end_date && (
                                  <Text><strong>🏁 Fin:</strong> {formatDate(selectedEvent.event.end_date)}</Text>
                                )}
                                <Text><strong>📍 Ubicación:</strong> {selectedEvent.event.location || 'No especificada'}</Text>
                                <Text><strong>👤 Organizador:</strong> {selectedEvent.event.organizer}</Text>
                                <Text><strong>📂 Categoría:</strong> {selectedEvent.event.category || 'Sin categoría'}</Text>
                                <Text><strong>🎫 Capacidad:</strong> {selectedEvent.event.capacity || 'Ilimitada'}</Text>
                              </VStack>
                            </Box>
                            <Box>
                              <SimpleGrid columns={2} spacing={4}>
                                <Card>
                                  <CardBody>
                                    <Stat>
                                      <StatLabel>Total Inscritos</StatLabel>
                                      <StatNumber>{selectedEvent.statistics.total_registered}</StatNumber>
                                      <StatHelpText>
                                        {selectedEvent.statistics.available_spots} disponibles
                                      </StatHelpText>
                                    </Stat>
                                  </CardBody>
                                </Card>
                                <Card>
                                  <CardBody>
                                    <Stat>
                                      <StatLabel>Confirmados</StatLabel>
                                      <StatNumber>{selectedEvent.statistics.status_distribution.confirmed}</StatNumber>
                                      <StatHelpText>
                                        {selectedEvent.statistics.status_distribution.registered} registrados
                                      </StatHelpText>
                                    </Stat>
                                  </CardBody>
                                </Card>
                                <Card>
                                  <CardBody>
                                    <Stat>
                                      <StatLabel>Asistentes</StatLabel>
                                      <StatNumber>{selectedEvent.statistics.attended}</StatNumber>
                                      <StatHelpText>
                                        {formatPercentage(selectedEvent.statistics.attendance_rate)} tasa
                                      </StatHelpText>
                                    </Stat>
                                  </CardBody>
                                </Card>
                                <Card>
                                  <CardBody>
                                    <Stat>
                                      <StatLabel>Ocupación</StatLabel>
                                      <StatNumber>{formatPercentage(selectedEvent.statistics.occupancy_rate)}</StatNumber>
                                      <StatHelpText>
                                        {selectedEvent.statistics.average_rating > 0 && 
                                          `⭐ ${selectedEvent.statistics.average_rating}/5`
                                        }
                                      </StatHelpText>
                                    </Stat>
                                  </CardBody>
                                </Card>
                              </SimpleGrid>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Lista de inscritos */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">👥 Lista de Inscritos ({selectedEvent.registered_users.length})</Heading>
                        </CardHeader>
                        <CardBody>
                          {selectedEvent.registered_users.length > 0 ? (
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Usuario</Th>
                                  <Th>Email</Th>
                                  <Th>Estado</Th>
                                  <Th>Asistió</Th>
                                  <Th>Calificación</Th>
                                  <Th>Fecha de Registro</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {selectedEvent.registered_users.map((user) => (
                                  <Tr key={user.id}>
                                    <Td>{user.username}</Td>
                                    <Td>{user.email}</Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          user.status === 'confirmed' ? 'green' :
                                          user.status === 'registered' ? 'blue' :
                                          user.status === 'waitlisted' ? 'yellow' : 'red'
                                        }
                                      >
                                        {user.status}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      {user.attended ? (
                                        <Badge colorScheme="green">✓ Asistió</Badge>
                                      ) : (
                                        <Badge colorScheme="red">✗ No asistió</Badge>
                                      )}
                                    </Td>
                                    <Td>
                                      {user.rating ? (
                                        <HStack spacing={1}>
                                          {[...Array(5)].map((_, i) => (
                                            <Text
                                              key={i}
                                              color={i < user.rating ? "yellow.500" : "gray.300"}
                                            >
                                              ★
                                            </Text>
                                          ))}
                                          <Text fontSize="sm">({user.rating})</Text>
                                        </HStack>
                                      ) : (
                                        <Text color="gray.500">Sin calificar</Text>
                                      )}
                                    </Td>
                                    <Td>{formatDate(user.registration_date)}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          ) : (
                            <Alert status="info">
                              <AlertIcon />
                              <AlertTitle>Sin inscritos</AlertTitle>
                              <AlertDescription>
                                No hay usuarios inscritos en este evento.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontSize="lg" color="gray.500">
                        Selecciona un evento para ver el reporte detallado
                      </Text>
                      <Text fontSize="sm" color="gray.400" mt={2}>
                        Ve a la pestaña "Mis Eventos" y haz clic en "Ver Detalle"
                      </Text>
                    </Box>
                  )}
                </TabPanel>
              </>
            )}

            {/* PANEL PARA ESTUDIANTES */}
            {userRole === 'student' && (
              <TabPanel>
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>Información</AlertTitle>
                  <AlertDescription>
                    Los estudiantes pueden ver sus inscripciones en la sección "Mis Eventos" del menú principal.
                    Los reportes detallados están disponibles solo para organizadores y administradores.
                  </AlertDescription>
                </Alert>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default ReportsPage;