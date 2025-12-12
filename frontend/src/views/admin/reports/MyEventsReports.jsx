// views/admin/reports/MyEventsReports.jsx - VERSIÓN LIMPIA
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Button,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Card,
  CardBody,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { MdPeople, MdEvent } from 'react-icons/md';
import { Pie } from 'react-chartjs-2';
import { eventService } from '../../../services/eventService';
import { attendanceService } from '../../../services/attendanceService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
ChartJS.register(ArcElement, Tooltip, Legend);

const MyEventsReports = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchMyEventsWithReports();
  }, []);

  const fetchMyEventsWithReports = async () => {
    setLoading(true);
    try {
      // 1. Obtener eventos que el usuario organiza
      const myEvents = await eventService.getEvents({ mine: 'true' });
      
      if (myEvents.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // 2. Para cada evento, obtener el reporte
      const eventsWithReports = await Promise.all(
        myEvents.map(async (event) => {
          try {
            const response = await attendanceService.getEventAttendanceReport(event.id);
            const reportData = response.data;
            
            return {
              ...event,
              report: reportData,
              hasReport: true,
              error: null,
            };
          } catch (error) {
            const errorMsg = error.response?.data?.detail || error.message;
            
            return {
              ...event,
              report: null,
              hasReport: false,
              error: errorMsg,
              statusCode: error.response?.status,
            };
          }
        })
      );
      
      setEvents(eventsWithReports);
      
    } catch (error) {
      console.error('Error general al cargar reportes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    return event.title.toLowerCase().includes(search.toLowerCase());
  });

  // Calcular estadísticas
  const calculateStats = () => {
    let stats = {
      totalEvents: events.length,
      totalRegistrations: 0,
      totalAttended: 0,
      attendanceRate: 0,
    };

    events.forEach(event => {
      if (event.hasReport && event.report?.statistics) {
        stats.totalRegistrations += event.report.statistics.total_registered || 0;
        stats.totalAttended += event.report.statistics.total_attended || 0;
      }
    });

    stats.attendanceRate = stats.totalRegistrations > 0 
      ? ((stats.totalAttended / stats.totalRegistrations) * 100).toFixed(1)
      : '0.0';

    return stats;
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Función para mostrar detalles del evento
  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const totalRegistered = events.reduce(
      (sum, event) => sum + (event.report?.statistics?.total_registered || 0),
      0
  );

  const totalAttended = events.reduce(
      (sum, event) => sum + (event.report?.statistics?.total_attended || 0),
      0
  );

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="100px" borderRadius="xl" />
          ))}
        </SimpleGrid>
        <Skeleton height="400px" borderRadius="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={20}>
      {/* Estadísticas generales */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
        <Card bg="blue.50" border="1px solid" borderColor="blue.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdEvent} color="blue.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Eventos Organizados</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="blue.700">{stats.totalEvents}</Text>
          </CardBody>
        </Card>

        <Card bg="purple.50" border="1px solid" borderColor="purple.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdPeople} color="purple.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Total Inscritos</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="purple.700">{stats.totalRegistrations}</Text>
          </CardBody>
        </Card>

        <Card bg="orange.50" border="1px solid" borderColor="orange.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdPeople} color="orange.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Asistentes Confirmados</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="orange.700">{stats.totalAttended}</Text>
            <Progress 
              value={stats.attendanceRate} 
              size="sm" 
              colorScheme={stats.attendanceRate >= 70 ? 'green' : stats.attendanceRate >= 40 ? 'yellow' : 'red'}
              mt={2}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>{stats.attendanceRate}% de asistencia</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Búsqueda */}
      <InputGroup mb={6} maxW="400px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar eventos por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="white"
        />
      </InputGroup>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            {search ? 'No se encontraron eventos que coincidan' : 'No organizas ningún evento'}
          </Text>
          <Button colorScheme="blue" onClick={() => window.location.href = '/user/create-event'}>
            Crear Mi Primer Evento
          </Button>
        </Box>
      ) : (
        <Box>
          {/* Tabla de eventos */}
          <Table variant="simple" mb={8}>
            <Thead bg="gray.50">
              <Tr>
                <Th>Evento</Th>
                <Th>Fecha</Th>
                <Th>Inscritos</Th>
                <Th>Asistentes</Th>
                <Th>Tasa de Asistencia</Th>
                <Th>Detalles</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredEvents.map((event) => (
                <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Box>
                      <Text fontWeight="medium">{event.title}</Text>
                      <Text fontSize="sm" color="gray.600">{event.location || 'Sin ubicación'}</Text>
                    </Box>
                  </Td>
                  <Td>{formatDate(event.start_time)}</Td>
                  <Td>
                    {event.hasReport ? (
                      <Text fontWeight="bold" fontSize="lg">
                        {event.report?.statistics?.total_registered || 0}
                      </Text>
                    ) : (
                      <Text color="gray.400">-</Text>
                    )}
                  </Td>
                  <Td>
                    {event.hasReport ? (
                      <Text fontWeight="bold" fontSize="lg" color="green.600">
                        {event.report?.statistics?.total_attended || 0}
                      </Text>
                    ) : (
                      <Text color="gray.400">-</Text>
                    )}
                  </Td>
                  <Td width="150px">
                    {event.hasReport ? (
                      <Box>
                        <Progress 
                          value={event.report?.statistics?.attendance_rate || 0}
                          size="sm"
                          colorScheme={
                            (event.report?.statistics?.attendance_rate || 0) >= 70 ? 'green' :
                            (event.report?.statistics?.attendance_rate || 0) >= 40 ? 'yellow' : 'red'
                          }
                          mb={1}
                        />
                        <Text fontSize="xs" color="gray.600" textAlign="center">
                          {event.report?.statistics?.attendance_rate || 0}%
                        </Text>
                      </Box>
                    ) : (
                      <Text color="gray.400">-</Text>
                    )}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => showEventDetails(event)}
                      isDisabled={!event.hasReport}
                    >
                      Ver Detalles
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {selectedEvent?.report && (
          <Box mb={8}>
            <Text fontWeight="bold" mb={2}>Distribución de Asistencia:</Text>
            <Pie
                data={{
                  labels: ['Inscritos', 'Asistieron'],
                  datasets: [
                    {
                      data: [totalRegistered, totalAttended],
                      backgroundColor: ['#90cdf4', '#68d391'], // azul y verde Chakra vibes
                      borderWidth: 1,
                    },
                  ],
                }}
                style={{ maxHeight: '280px' }}
            />
          </Box>)}

          {events.length > 0 && (
              <Box mb={10} p={6} bg="white" borderRadius="xl" boxShadow="sm">
                <Heading size="md" mb={4}>Asistencia por Evento</Heading>

                <Bar
                    data={{
                      labels: events.map(e => e.title),
                      datasets: [
                        {
                          label: 'Inscritos',
                          data: events.map(e => e.report?.statistics?.total_registered || 0),
                          backgroundColor: '#9f7aea', // purple
                        },
                        {
                          label: 'Asistieron',
                          data: events.map(e => e.report?.statistics?.total_attended || 0),
                          backgroundColor: '#48bb78', // green
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                    style={{ maxHeight: '350px' }}
                />
              </Box>
          )}

          {/* Instrucciones */}
          <Alert status="info" borderRadius="lg" mt="auto" position='relative'>
            <AlertIcon />
            <Box mt='auto'>
              <Text fontWeight="bold">Información importante</Text>
              <Text fontSize="sm">
                • "Inscritos": Personas que se unieron al evento<br />
                • "Asistentes": Personas que confirmaron su asistencia<br />
                • Solo los organizadores pueden ver esta información
              </Text>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Modal de Detalles */}
      {isDetailsModalOpen && selectedEvent && selectedEvent.report && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          onClick={() => setIsDetailsModalOpen(false)}
        >

          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            maxW="600px"
            maxH="80vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">📊 {selectedEvent.title}</Heading>
              <Button size="sm" onClick={() => setIsDetailsModalOpen(false)}>✕</Button>
            </Flex>
            
            <SimpleGrid columns={2} gap={4} mb={6}>
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontSize="sm" color="gray.600">Total Inscritos</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                  {selectedEvent.report.statistics?.total_registered || 0}
                </Text>
              </Box>
              <Box bg="green.50" p={3} borderRadius="md">
                <Text fontSize="sm" color="gray.600">Asistentes Confirmados</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.700">
                  {selectedEvent.report.statistics?.total_attended || 0}
                </Text>
              </Box>
            </SimpleGrid>
            
            {/* Tasa de asistencia */}
            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>📈 Tasa de Asistencia</Text>
              <Progress 
                value={selectedEvent.report.statistics?.attendance_rate || 0}
                size="lg"
                borderRadius="full"
                colorScheme={
                  (selectedEvent.report.statistics?.attendance_rate || 0) >= 70 ? 'green' :
                  (selectedEvent.report.statistics?.attendance_rate || 0) >= 40 ? 'yellow' : 'red'
                }
                mb={2}
              />
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                {selectedEvent.report.statistics?.attendance_rate || 0}%
              </Text>
            </Box>
            
            {/* Lista de personas que confirmaron asistencia */}
            {selectedEvent.report.usernames?.attended && 
             selectedEvent.report.usernames.attended.length > 0 && (
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>
                  ✅ Personas que confirmaron asistencia ({selectedEvent.report.usernames.attended.length})
                </Text>
                <Box maxH="200px" overflowY="auto" p={3} bg="green.50" borderRadius="md">
                  {selectedEvent.report.usernames.attended.map((user, index) => (
                    <Flex key={index} align="center" mb={2} p={2} bg="white" borderRadius="md">
                      <Text fontSize="sm">👤 {typeof user === 'object' ? user.username : user}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Lista de personas que se unieron pero no confirmaron */}
            {selectedEvent.report.usernames?.pending && 
             selectedEvent.report.usernames.pending.length > 0 && (
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>
                  ⏳ Pendientes de confirmar ({selectedEvent.report.usernames.pending.length})
                </Text>
                <Box maxH="150px" overflowY="auto" p={3} bg="yellow.50" borderRadius="md">
                  {selectedEvent.report.usernames.pending.map((user, index) => (
                    <Flex key={index} align="center" mb={2} p={2} bg="white" borderRadius="md">
                      <Text fontSize="sm">👤 {typeof user === 'object' ? user.username : user}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Si no hay listas de usuarios pero hay estadísticas */}
            {(!selectedEvent.report.usernames || 
              (!selectedEvent.report.usernames.attended && !selectedEvent.report.usernames.pending)) && 
             selectedEvent.report.statistics && (
              <Alert status="info" borderRadius="lg" mb={4}>
                <AlertIcon />
                <Text fontSize="sm">
                  Las listas detalladas de usuarios no están disponibles en este momento.
                </Text>
              </Alert>
            )}
            
            <Button
              colorScheme="blue"
              width="full"
              mt={4}
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default MyEventsReports;