// src/views/admin/reports/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Select,
  Button,
  Flex,
  useColorModeValue,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { useAuthStore } from 'stores/useAuthStore';
import { reportService } from 'services/reportService';

const AdminReports = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalConfirmed: 0,
    totalAttended: 0,
    totalConfirmedAndAttended: 0,
    confirmationRate: 0,
    totalUsers: 0,
    eventsByCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  // Función de prueba directa
  const testDirectFetch = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔑 Token length:', token?.length);

      const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE}/api/admin-reports/?period=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Direct fetch error:', error);
      throw error;
    }
  };

  const fetchAdminReports = async () => {
    console.log('🔄 Starting fetchAdminReports...');
    console.log('👤 User:', user);
    console.log('🎭 Role:', role);
    console.log('📅 Date range:', dateRange);

    try {
      setLoading(true);
      setError(null);

      console.log('1. Testing direct fetch...');
      const testData = await testDirectFetch();
      console.log('✅ Direct fetch successful');

      console.log('2. Now trying with reportService...');
      const data = await reportService.getAdminReports(dateRange);
      console.log('✅ Service fetch successful:', data);

      // Verificar estructura de datos
      console.log('📊 Data structure check:');
      console.log('- Has events?', !!data.events);
      console.log('- Events count:', data.events?.length);
      console.log('- Has stats?', !!data.stats);

      if (!data || (!data.events && !data.stats)) {
        throw new Error('Datos recibidos en formato incorrecto');
      }

      // Procesar eventos
      const eventsWithData = (data.events || []).map(event => {
        console.log('📋 Processing event:', event.name);
        return {
          ...event,
          totalConfirmed: (event.confirmed || 0) + (event.attended || 0),
          confirmedOnly: event.confirmed || 0,
          attendedOnly: event.attended || 0,
          // Asegurar que attendance_rate sea número
          attendance_rate: typeof event.attendance_rate === 'number' ? event.attendance_rate : 0
        };
      });

      console.log(`✅ Processed ${eventsWithData.length} events`);

      // Procesar estadísticas
      const processedStats = {
        totalEvents: data.stats?.totalEvents || 0,
        totalRegistrations: data.stats?.totalRegistrations || 0,
        totalConfirmed: data.stats?.totalConfirmed || 0,
        totalAttended: data.stats?.totalAttended || 0,
        totalConfirmedAndAttended: data.stats?.totalConfirmedAndAttended || 0,
        confirmationRate: data.stats?.confirmationRate || 0,
        totalUsers: data.stats?.totalUsers || 0,
        eventsByCategory: data.stats?.eventsByCategory || {}
      };

      console.log('📈 Processed stats:', processedStats);

      // Actualizar estado
      setEvents(eventsWithData);
      setStats(processedStats);

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('Stack:', error.stack);

      let errorMessage = 'Error desconocido';

      if (error.message.includes('Network Error')) {
        errorMessage = 'Error de red. Verifica que el backend esté corriendo.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado.';
      } else if (error.message.includes('401')) {
        errorMessage = 'No autenticado. Tu sesión pudo haber expirado.';
      } else if (error.message.includes('403')) {
        errorMessage = 'No tienes permisos de administrador.';
      } else {
        errorMessage = error.message || 'Error al cargar reportes';
      }

      setError(errorMessage);

      // Mostrar datos de prueba si hay error
      console.log('🔄 Loading sample data due to error...');
      const sampleData = {
        events: [
          {
            id: '1',
            name: 'Evento de Prueba',
            date: '2024-12-11',
            time: '10:00',
            category: 'Test',
            organizer: 'Admin',
            location: 'Test Location',
            attendees: 10,
            confirmed: 5,
            attended: 3,
            status: 'active',
            attendance_rate: 30,
            capacity: 20,
            is_public: true
          }
        ],
        stats: {
          totalEvents: 14,
          totalRegistrations: 20,
          totalConfirmed: 0,
          totalAttended: 3,
          totalConfirmedAndAttended: 3,
          confirmationRate: 15.0,
          totalUsers: 11,
          eventsByCategory: {
            "Cultural": 5,
            "Académico": 5,
            "Deportivo": 2,
            "Social": 1,
            "Networking": 1
          }
        }
      };

      const sampleEvents = sampleData.events.map(event => ({
        ...event,
        totalConfirmed: event.confirmed + event.attended,
        confirmedOnly: event.confirmed,
        attendedOnly: event.attended
      }));

      setEvents(sampleEvents);
      setStats(sampleData.stats);

    } finally {
      console.log('🏁 fetchAdminReports completed');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered');
    console.log('User exists:', !!user);
    console.log('Role:', role);

    if (!user) {
      console.log('⚠️ No user, skipping fetch');
      return;
    }

    if (role !== 'admin') {
      console.log('⚠️ Not admin, skipping fetch');
      return;
    }

    console.log('✅ Conditions met, fetching reports...');
    fetchAdminReports();
  }, [dateRange, role, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'upcoming': return 'blue';
      case 'finished': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'En curso';
      case 'upcoming': return 'Próximo';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  };

  // Si no hay usuario o no es admin, mostrar mensaje
  if (!user) {
    return (
      <Box pt="130px" textAlign="center">
        <Text fontSize="xl" color="red.500">
          Debes iniciar sesión para ver esta página
        </Text>
      </Box>
    );
  }

  if (role !== 'admin') {
    return (
      <Box pt="130px" textAlign="center">
        <Text fontSize="xl" color="red.500">
          No tienes permisos de administrador para acceder a esta página
        </Text>
      </Box>
    );
  }

  console.log('🎨 Rendering component...');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Events count:', events.length);
  console.log('Stats:', stats);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {error && (
        <Alert status="error" mb="20px" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='20px' mb='20px'>
        <Card p="20px">
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Eventos
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>{stats.totalEvents || 0}</Text>
          <Text fontSize='sm' color='gray.500'>Creados en el sistema</Text>
        </Card>

        <Card p="20px">
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Inscripciones
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>{stats.totalRegistrations || 0}</Text>
          <Text fontSize='sm' color='gray.500'>Registros totales</Text>
        </Card>

        <Card p="20px">
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Confirmados + Asistieron
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>{stats.totalConfirmedAndAttended || 0}</Text>
          <Progress
            value={stats.confirmationRate || 0}
            size='sm'
            colorScheme={stats.confirmationRate >= 70 ? 'green' : stats.confirmationRate >= 40 ? 'yellow' : 'red'}
            mt={2}
          />
          <Text fontSize='sm' color='gray.500' mt={1}>
            {stats.confirmationRate || 0}% de tasa
          </Text>
        </Card>

        <Card p="20px">
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Usuarios Totales
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>{stats.totalUsers || 0}</Text>
          <Text fontSize='sm' color='gray.500'>Usuarios registrados</Text>
        </Card>
      </SimpleGrid>

      {/* Distribución por categoría */}
      {stats.eventsByCategory && Object.keys(stats.eventsByCategory).length > 0 && (
        <Card mb='20px' p="20px">
          <Text fontSize='xl' fontWeight='bold' color={textColor} mb='15px'>
            Distribución por Categoría
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing='15px'>
            {Object.entries(stats.eventsByCategory).map(([category, count]) => (
              <Box key={category} p='10px' borderWidth='1px' borderRadius='md' bg="gray.50">
                <Text fontSize='sm' fontWeight='medium' color={textColor}>
                  {category}
                </Text>
                <Text fontSize='2xl' fontWeight='bold'>
                  {count}
                </Text>
                <Text fontSize='xs' color='gray.500'>
                  {stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0}% del total
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Card>
      )}

      <Card mb='20px' p="20px">
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>
            Reporte Detallado de Eventos
          </Text>
          <Flex gap='10px'>
            <Select
              width='150px'
              value={dateRange}
              onChange={(e) => {
                console.log('Date range changed to:', e.target.value);
                setDateRange(e.target.value);
              }}
            >
              <option value='all'>Todos los tiempos</option>
              <option value='today'>Hoy</option>
              <option value='week'>Esta semana</option>
              <option value='month'>Este mes</option>
            </Select>
            <Button
              colorScheme='blue'
              onClick={() => {
                console.log('Manual refresh clicked');
                fetchAdminReports();
              }}
              isLoading={loading}
            >
              Actualizar
            </Button>
            <Button
              colorScheme='green'
              onClick={() => {
                // Exportar datos actuales
                const csvContent = [
                  ['Evento', 'Fecha', 'Categoría', 'Organizador', 'Inscritos', 'Confirmados', 'Asistieron', 'Tasa Asistencia', 'Estado'],
                  ...events.map(event => [
                    event.name,
                    event.date,
                    event.category,
                    event.organizer,
                    event.attendees,
                    event.confirmedOnly,
                    event.attendedOnly,
                    `${event.attendance_rate}%`,
                    getStatusText(event.status)
                  ])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-admin-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              isDisabled={loading || events.length === 0}
            >
              Exportar CSV
            </Button>
          </Flex>
        </Flex>

        {loading ? (
          <Flex justify="center" py="50px" direction="column" align="center">
            <Spinner size="xl" />
            <Text mt="10px">Cargando reportes...</Text>
            <Text fontSize="sm" color="gray.500" mt="5px">
              Por favor espera
            </Text>
          </Flex>
        ) : events.length === 0 ? (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            No hay eventos para mostrar con los filtros seleccionados.
          </Alert>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>Evento</Th>
                  <Th borderColor={borderColor}>Fecha/Hora</Th>
                  <Th borderColor={borderColor}>Categoría</Th>
                  <Th borderColor={borderColor}>Inscritos</Th>
                  <Th borderColor={borderColor}>Confirmados</Th>
                  <Th borderColor={borderColor}>Asistieron</Th>
                  <Th borderColor={borderColor}>Tasa Asistencia</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {events.map((event, index) => {
                  console.log(`Rendering event ${index}:`, event.name);
                  return (
                    <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="medium">{event.name}</Text>
                        <Text fontSize="xs" color="gray.500">{event.location}</Text>
                        <Text fontSize="xs" color="gray.500">Org: {event.organizer}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text>{event.date}</Text>
                        <Text fontSize="xs" color="gray.500">{event.time}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="purple">{event.category}</Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="bold">{event.attendees}</Text>
                        {event.capacity && (
                          <Text fontSize="xs" color="gray.500">
                            Cap: {event.capacity}
                          </Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="bold" color="blue.600">{event.confirmedOnly}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="bold" color="green.600">{event.attendedOnly}</Text>
                      </Td>
                      <Td borderColor={borderColor} width="120px">
                        <Box>
                          <Progress
                            value={event.attendance_rate || 0}
                            size="xs"
                            colorScheme={event.attendance_rate >= 70 ? 'green' : event.attendance_rate >= 40 ? 'yellow' : 'red'}
                            mb={1}
                          />
                          <Text fontSize="xs" textAlign="center">
                            {event.attendance_rate || 0}%
                          </Text>
                        </Box>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme={getStatusColor(event.status)}>
                          {getStatusText(event.status)}
                        </Badge>
                        {!event.is_public && (
                          <Badge ml={1} colorScheme="orange" fontSize="xs">
                            Privado
                          </Badge>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Text fontSize="sm" color="gray.500" mt="10px" textAlign="center">
              Mostrando {events.length} eventos
            </Text>
          </Box>
        )}
      </Card>

      {/* Botón de depuración */}
      <Button
        size="sm"
        colorScheme="gray"
        onClick={() => {
          console.log('=== DEBUG INFO ===');
          console.log('Events:', events);
          console.log('Stats:', stats);
          console.log('Loading:', loading);
          console.log('Error:', error);
          console.log('User:', user);
          console.log('Role:', role);
        }}
        mt="20px"
      >
        Mostrar Info Depuración (Consola)
      </Button>
    </Box>
  );
};

export default AdminReports;