// views/admin/reports/MyEventsReports.jsx - VERSIÓN CON MÁS DEBUG
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
import { MdPeople, MdEvent, MdCheckCircle, MdError } from 'react-icons/md';
import { eventService } from '../../../services/eventService';
import { attendanceService } from '../../../services/attendanceService';

const MyEventsReports = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
  const toast = useToast();

  const addDebugLog = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    setDebugInfo(prev => [
      { message, type, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 10) // Mantener solo los últimos 10 logs
    ]);
  };

  useEffect(() => {
    fetchMyEventsWithReports();
  }, []);

  const fetchMyEventsWithReports = async () => {
    setLoading(true);
    setDebugInfo([]);
    addDebugLog('Iniciando carga de reportes...', 'info');
    
    try {
      // 1. Obtener eventos que el usuario organiza
      addDebugLog('Obteniendo eventos que organizo...', 'info');
      const myEvents = await eventService.getEvents({ mine: 'true' });
      addDebugLog(`Encontrados ${myEvents.length} eventos que organizo`, 'success');
      
      if (myEvents.length === 0) {
        addDebugLog('No eres organizador de ningún evento. Crea uno primero.', 'warning');
        setEvents([]);
        setLoading(false);
        return;
      }

      // 2. Para cada evento, obtener el reporte
      addDebugLog('Obteniendo reportes de asistencia para cada evento...', 'info');
      const eventsWithReports = await Promise.all(
        myEvents.map(async (event) => {
          try {
            addDebugLog(`Solicitando reporte para: "${event.title}"`, 'info');
            const response = await attendanceService.getEventAttendanceReport(event.id);
            
            const reportData = response.data;
            addDebugLog(`✅ Reporte recibido para "${event.title}": ${reportData.statistics?.total_registered || 0} inscritos, ${reportData.statistics?.total_attended || 0} asistentes`, 'success');
            
            return {
              ...event,
              report: reportData,
              hasReport: true,
              error: null,
            };
          } catch (error) {
            const errorMsg = error.response?.data?.detail || error.message;
            addDebugLog(`❌ Error para "${event.title}": ${errorMsg}`, 'error');
            
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
      
      addDebugLog(`Procesados ${eventsWithReports.length} eventos`, 'info');
      setEvents(eventsWithReports);
      
      // Mostrar resumen
      const withReport = eventsWithReports.filter(e => e.hasReport).length;
      const withoutReport = eventsWithReports.filter(e => !e.hasReport).length;
      addDebugLog(`Resumen: ${withReport} con reporte, ${withoutReport} sin reporte`, 'info');
      
    } catch (error) {
      addDebugLog(`💥 Error general: ${error.message}`, 'error');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos',
        status: 'error',
        duration: 3000,
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
      withReport: 0,
      withoutReport: 0,
      totalRegistrations: 0,
      totalAttended: 0,
      attendanceRate: 0,
    };

    events.forEach(event => {
      if (event.hasReport && event.report?.statistics) {
        stats.withReport++;
        stats.totalRegistrations += event.report.statistics.total_registered || 0;
        stats.totalAttended += event.report.statistics.total_attended || 0;
      } else {
        stats.withoutReport++;
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

  // Función para probar endpoint manualmente
  const testEndpointManually = async (eventId, eventTitle) => {
    try {
      addDebugLog(`🧪 Probando endpoint para: "${eventTitle}"`, 'info');
      const response = await attendanceService.getEventAttendanceReport(eventId);
      console.log('📋 Respuesta completa:', response);
      console.log('📊 Datos:', response.data);
      
      toast({
        title: '✅ Endpoint funciona',
        description: (
          <Box>
            <Text>Evento: {eventTitle}</Text>
            <Text>Inscritos: {response.data?.statistics?.total_registered || 0}</Text>
            <Text>Asistentes: {response.data?.statistics?.total_attended || 0}</Text>
          </Box>
        ),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response:', error.response);
      
      const errorDetail = error.response?.data?.detail || error.message;
      addDebugLog(`❌ Error en endpoint: ${errorDetail}`, 'error');
      
      toast({
        title: '❌ Error en endpoint',
        description: (
          <Box>
            <Text>{errorDetail}</Text>
            <Text fontSize="sm">Status: {error.response?.status}</Text>
          </Box>
        ),
        status: 'error',
        duration: 5000,
      });
      
      return null;
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
      <Heading mb={2}>📊 Reportes de Mis Eventos</Heading>
      <Text color="gray.600" mb={8}>
        Estadísticas de asistencia de los eventos que organizas
      </Text>

      {/* Alertas importantes */}
      {events.length === 0 && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">No organizas ningún evento</Text>
            <Text fontSize="sm">Crea un evento primero para ver reportes de asistencia.</Text>
          </Box>
        </Alert>
      )}

      {/* Estadísticas generales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <Card bg="blue.50" border="1px solid" borderColor="blue.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdEvent} color="blue.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Total Eventos</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="blue.700">{stats.totalEvents}</Text>
            <Text fontSize="xs" color="gray.500">Eventos que organizas</Text>
          </CardBody>
        </Card>

        <Card bg={stats.withReport > 0 ? "green.50" : "yellow.50"} 
              border="1px solid" 
              borderColor={stats.withReport > 0 ? "green.200" : "yellow.200"}>
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdCheckCircle} color={stats.withReport > 0 ? "green.500" : "yellow.500"} mr={2} />
              <Text fontSize="sm" color="gray.600">Con Reporte</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color={stats.withReport > 0 ? "green.700" : "yellow.700"}>{stats.withReport}</Text>
            <Text fontSize="xs" color="gray.500">Reportes disponibles</Text>
          </CardBody>
        </Card>

        <Card bg="purple.50" border="1px solid" borderColor="purple.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdPeople} color="purple.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Total Inscritos</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="purple.700">{stats.totalRegistrations}</Text>
            <Text fontSize="xs" color="gray.500">Personas registradas</Text>
          </CardBody>
        </Card>

        <Card bg="orange.50" border="1px solid" borderColor="orange.200">
          <CardBody>
            <Flex align="center" mb={2}>
              <Box as={MdPeople} color="orange.500" mr={2} />
              <Text fontSize="sm" color="gray.600">Asistentes</Text>
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
          placeholder="Buscar eventos..."
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
                <Th>Estado</Th>
                <Th>Inscritos</Th>
                <Th>Asistentes</Th>
                <Th>Tasa</Th>
                <Th>Acciones</Th>
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
                    <Badge colorScheme={event.hasReport ? 'green' : 'yellow'}>
                      {event.hasReport ? 'Con reporte' : 'Sin reporte'}
                    </Badge>
                    {event.error && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {event.error}
                      </Text>
                    )}
                  </Td>
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
                      onClick={() => testEndpointManually(event.id, event.title)}
                      isDisabled={loading}
                    >
                      Probar Endpoint
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Explicación */}
          <Alert status="info" borderRadius="lg" mb={6}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">¿Por qué no veo estadísticas?</Text>
              <Text fontSize="sm">
                1. Las personas deben <strong>confirmar asistencia</strong> (botón "Confirmar Asistencia")<br />
                2. Solo aparecen en "Asistentes" después de confirmar<br />
                3. "Inscritos" cuenta a todos los que se han unido al evento
              </Text>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Panel de Debug */}
      {debugInfo.length > 0 && (
        <Box mt={10} p={4} bg="gray.900" color="white" borderRadius="lg">
          <Heading size="sm" mb={3} color="gray.300">🛠️ Panel de Debug</Heading>
          <Flex justify="space-between" mb={3}>
            <Text fontSize="sm">Últimos logs ({debugInfo.length})</Text>
            <Button size="xs" onClick={() => setDebugInfo([])}>Limpiar</Button>
          </Flex>
          <Box maxH="200px" overflowY="auto" fontSize="xs" fontFamily="monospace">
            {debugInfo.map((log, index) => (
              <Flex key={index} mb={1} color={log.type === 'error' ? 'red.300' : log.type === 'success' ? 'green.300' : 'gray.300'}>
                <Text color="gray.500" mr={2}>[{log.timestamp}]</Text>
                <Text>{log.message}</Text>
              </Flex>
            ))}
          </Box>
        </Box>
      )}

      {/* Instrucciones */}
      <Box mt={8} p={4} bg="blue.50" borderRadius="lg">
        <Heading size="sm" mb={2} color="blue.700">📝 ¿Cómo funciona?</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Box>
            <Text fontWeight="bold" mb={1}>1. Crear Evento</Text>
            <Text fontSize="sm">Crea un evento en la sección "Crear Evento"</Text>
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>2. Personas se inscriben</Text>
            <Text fontSize="sm">Los usuarios se unen a tu evento desde "Lista de eventos"</Text>
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>3. Confirmar Asistencia</Text>
            <Text fontSize="sm">Cada usuario debe hacer clic en "Confirmar Asistencia" en sus eventos</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Container>
  );
};

export default MyEventsReports;