// views/admin/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import {
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
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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

  useEffect(() => {
    if (userRole === 'organizer' || userRole === 'admin') {
      loadOrganizerReports();
    }
    
    if (userRole === 'admin') {
      loadAdminReports();
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
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar reportes',
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
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar reportes',
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
          setActiveTab(1);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar detalles',
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

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>📊 Reportes y Estadísticas</Heading>
      
      <Tabs onChange={setActiveTab} index={activeTab}>
        <TabList>
          {userRole === 'admin' && <Tab>📈 Reporte Global</Tab>}
          {(userRole === 'organizer' || userRole === 'admin') && (
            <>
              <Tab>🎯 Mis Eventos</Tab>
              <Tab>👥 Detalle por Evento</Tab>
            </>
          )}
        </TabList>

        <TabPanels>
          {/* Panel de admin */}
          {userRole === 'admin' && (
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <HStack spacing={4}>
                      <Input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        placeholder="Fecha inicio"
                      />
                      <Input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        placeholder="Fecha fin"
                      />
                      <Button colorScheme="blue" onClick={loadAdminReports}>
                        Aplicar Filtros
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                {adminReports && (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Eventos</StatLabel>
                            <StatNumber>{adminReports.summary.total_events}</StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Usuarios</StatLabel>
                            <StatNumber>{adminReports.summary.total_users}</StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Inscripciones</StatLabel>
                            <StatNumber>{adminReports.summary.total_registrations}</StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Tabla de eventos populares */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Eventos Más Populares</Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Evento</Th>
                              <Th>Organizador</Th>
                              <Th isNumeric>Inscritos</Th>
                              <Th isNumeric>Asistentes</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {adminReports.popular_events.map((event) => (
                              <Tr key={event.id}>
                                <Td>{event.title}</Td>
                                <Td>{event.organizer}</Td>
                                <Td isNumeric>
                                  <Badge colorScheme="blue">{event.registered_count}</Badge>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="green">{event.attended_count}</Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  </>
                )}
              </VStack>
            </TabPanel>
          )}

          {/* Panel de organizador */}
          {(userRole === 'organizer' || userRole === 'admin') && (
            <>
              <TabPanel>
                {organizerReports && (
                  <VStack spacing={6} align="stretch">
                    <Card>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          <Stat>
                            <StatLabel>Total Eventos</StatLabel>
                            <StatNumber>{organizerReports.total_statistics.total_events}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Total Inscritos</StatLabel>
                            <StatNumber>{organizerReports.total_statistics.total_registered}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Total Asistentes</StatLabel>
                            <StatNumber>{organizerReports.total_statistics.total_attended}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <Heading size="md">Mis Eventos</Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Evento</Th>
                              <Th>Fecha</Th>
                              <Th isNumeric>Inscritos</Th>
                              <Th isNumeric>Asistentes</Th>
                              <Th>Acciones</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {organizerReports.events.map((event) => (
                              <Tr key={event.id}>
                                <Td>{event.title}</Td>
                                <Td>{formatDate(event.date)}</Td>
                                <Td isNumeric>{event.registered_count}</Td>
                                <Td isNumeric>{event.attended_count}</Td>
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
                      </CardBody>
                    </Card>
                  </VStack>
                )}
              </TabPanel>

              <TabPanel>
                {selectedEvent ? (
                  <VStack spacing={6} align="stretch">
                    <Card>
                      <CardHeader>
                        <Heading size="md">Reporte: {selectedEvent.event.title}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Usuario</Th>
                              <Th>Estado</Th>
                              <Th>Asistió</Th>
                              <Th>Fecha Registro</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedEvent.registered_users.map((user) => (
                              <Tr key={user.id}>
                                <Td>{user.username}</Td>
                                <Td>
                                  <Badge colorScheme={
                                    user.status === 'confirmed' ? 'green' : 'yellow'
                                  }>
                                    {user.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  {user.attended ? (
                                    <Badge colorScheme="green">✓ Sí</Badge>
                                  ) : (
                                    <Badge colorScheme="red">✗ No</Badge>
                                  )}
                                </Td>
                                <Td>{formatDate(user.registration_date)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  </VStack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>Selecciona un evento</AlertTitle>
                    <AlertDescription>
                      Ve a "Mis Eventos" y haz clic en "Ver Detalle"
                    </AlertDescription>
                  </Alert>
                )}
              </TabPanel>
            </>
          )}
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ReportsPage;