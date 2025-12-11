import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
} from '@chakra-ui/react';
import { SearchIcon, CalendarIcon, DownloadIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../../services/eventService';
import { attendanceService } from '../../../services/attendanceService';
// Importar desde la ubicación correcta
import ReportCard from './components/ReportCard';
import AttendanceChart from './components/AttendanceChart';

const MyEventsReports = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    averageAttendance: 0,
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEventsReports();
  }, []);

  const fetchMyEventsReports = async () => {
    setLoading(true);
    try {
      // Primero, obtener mis eventos organizados
      const myEvents = await eventService.getEvents({ mine: 'true' });
      
      // Para cada evento, obtener el reporte de asistencia
      const eventsWithReports = await Promise.all(
        myEvents.map(async (event) => {
          try {
            const report = await attendanceService.getEventAttendanceReport(event.id);
            return {
              ...event,
              report: report.data,
            };
          } catch (error) {
            // Si no tiene permiso o no hay reporte, retornar sin reporte
            return {
              ...event,
              report: null,
            };
          }
        })
      );
      
      setEvents(eventsWithReports);
      calculateStats(eventsWithReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los reportes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (eventsList) => {
    let totalEvents = eventsList.length;
    let totalRegistrations = 0;
    let totalAttended = 0;
    
    eventsList.forEach(event => {
      if (event.report) {
        totalRegistrations += event.report.statistics?.total_registered || 0;
        totalAttended += event.report.statistics?.total_attended || 0;
      }
    });
    
    const averageAttendance = totalEvents > 0 ? (totalAttended / totalRegistrations) * 100 : 0;
    
    setStats({
      totalEvents,
      totalRegistrations,
      totalAttended,
      averageAttendance: averageAttendance.toFixed(1),
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.location?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'with_attendance' && event.report) ||
                         (filter === 'without_attendance' && !event.report);
    
    return matchesSearch && matchesFilter;
  });

  const handleViewReport = (eventId) => {
    navigate(`/reports/event/${eventId}`);
  };

  const handleExportReport = async (eventId, eventTitle) => {
    try {
      // Aquí implementarías la exportación a PDF/Excel
      toast({
        title: 'Exportando...',
        description: `Generando reporte para ${eventTitle}`,
        status: 'info',
        duration: 2000,
      });
      // Implementación real dependería de tu backend
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="100px" borderRadius="xl" />
          ))}
        </SimpleGrid>
        <Skeleton height="400px" borderRadius="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={2}>Reportes de Mis Eventos</Heading>
      <Text color="gray.600" mb={8}>
        Estadísticas de asistencia de los eventos que organizas
      </Text>

      {/* Estadísticas generales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <ReportCard
          title="Total Eventos"
          value={stats.totalEvents}
          subtitle="Eventos organizados"
          colorScheme="blue"
        />
        <ReportCard
          title="Total Inscritos"
          value={stats.totalRegistrations}
          subtitle="Personas registradas"
          colorScheme="purple"
        />
        <ReportCard
          title="Asistentes"
          value={stats.totalAttended}
          subtitle="Confirmaciones de asistencia"
          colorScheme="green"
        />
        <ReportCard
          title="Tasa de Asistencia"
          value={`${stats.averageAttendance}%`}
          subtitle="Promedio general"
          colorScheme="orange"
        />
      </SimpleGrid>

      {/* Filtros y búsqueda */}
      <Flex gap={4} mb={6} flexWrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        
        <Select maxW="200px" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos los eventos</option>
          <option value="with_attendance">Con reporte</option>
          <option value="without_attendance">Sin reporte</option>
        </Select>
      </Flex>

      {/* Tabla de eventos */}
      <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Evento</Th>
              <Th>Fecha</Th>
              <Th>Inscritos</Th>
              <Th>Asistentes</Th>
              <Th>Tasa</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEvents.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <Text color="gray.500">No se encontraron eventos</Text>
                </Td>
              </Tr>
            ) : (
              filteredEvents.map((event) => (
                <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Box>
                      <Text fontWeight="medium">{event.title}</Text>
                      <Text fontSize="sm" color="gray.600">{event.location}</Text>
                    </Box>
                  </Td>
                  <Td>
                    {new Date(event.start_time).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Td>
                  <Td>
                    {event.report ? (
                      <Text fontWeight="bold">{event.report.statistics?.total_registered || 0}</Text>
                    ) : (
                      <Badge colorScheme="yellow">Sin datos</Badge>
                    )}
                  </Td>
                  <Td>
                    {event.report ? (
                      <Text fontWeight="bold" color="green.600">
                        {event.report.statistics?.total_attended || 0}
                      </Text>
                    ) : (
                      <Badge colorScheme="gray">-</Badge>
                    )}
                  </Td>
                  <Td width="200px">
                    {event.report ? (
                      <AttendanceChart
                        total={event.report.statistics?.total_registered || 0}
                        attended={event.report.statistics?.total_attended || 0}
                        height="30px"
                      />
                    ) : (
                      <Text color="gray.500">-</Text>
                    )}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      {event.report ? (
                        <>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleViewReport(event.id)}
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<DownloadIcon />}
                            onClick={() => handleExportReport(event.id, event.title)}
                          >
                            Exportar
                          </Button>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          No disponible
                        </Text>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

export default MyEventsReports;