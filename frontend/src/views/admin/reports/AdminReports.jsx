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
import { reportService } from 'services/reportService'; // Importa el servicio

const AdminReports = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalConfirmed: 0,
    confirmationRate: 0,
    totalUsers: 0,
    usersWithProfile: 0,
    eventsByCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  // En tu AdminReports.jsx, actualiza la función fetchAdminReports:
  // En tu AdminReports.jsx, modifica la función fetchAdminReports:
  const fetchAdminReports = async () => {
    console.log('=== fetchAdminReports iniciando ===');
    console.log('User:', user);
    console.log('Role:', role);
    console.log('Date range:', dateRange);
    
    try {
        setLoading(true);
        setError(null);
        
        console.log('Llamando a reportService.getAdminReports...');
        
        const data = await reportService.getAdminReports(dateRange);
        console.log('Datos recibidos:', data);
        
        if (!data) {
        throw new Error('No se recibieron datos del servidor');
        }
        
        // Procesar datos
        const eventsWithData = (data.events || []).map(event => ({
        ...event,
        totalConfirmed: (event.confirmed || 0) + (event.attended || 0),
        confirmedOnly: event.confirmed || 0,
        attendedOnly: event.attended || 0
        }));
        
        console.log('Eventos procesados:', eventsWithData.length);
        console.log('Estadísticas:', data.stats);
        
        setEvents(eventsWithData);
        setStats(data.stats || {});
        
    } catch (error) {
        console.error('Error en fetchAdminReports:', error);
        setError(error.message || 'Error desconocido al cargar reportes');
        
        // Mostrar alerta también
        alert(`Error: ${error.message}\n\nRevisa la consola para más detalles.`);
    } finally {
        console.log('=== fetchAdminReports finalizado ===');
        setLoading(false);
    }
    };

  const handleExport = async () => {
    try {
      const blob = await reportService.exportReports('csv', dateRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-admin-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error al exportar el reporte. Intenta de nuevo.');
    }
  };

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

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {error && (
        <Alert status="error" mb="20px" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='20px' mb='20px'>
        <Card>
            <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Eventos
            </Text>
            <Text fontSize='3xl' fontWeight='bold'>{stats.totalEvents || 0}</Text>
            <Text fontSize='sm' color='gray.500'>Creados en el sistema</Text>
        </Card>
        
        <Card>
            <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Inscripciones
            </Text>
            <Text fontSize='3xl' fontWeight='bold'>{stats.totalRegistrations || 0}</Text>
            <Text fontSize='sm' color='gray.500'>Registros totales</Text>
        </Card>
        
        <Card>
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
        
        <Card>
            <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Usuarios Totales
            </Text>
            <Text fontSize='3xl' fontWeight='bold'>{stats.totalUsers || 0}</Text>
            <Text fontSize='sm' color='gray.500'>Usuarios registrados</Text>
        </Card>
        </SimpleGrid>

      {/* Distribución por categoría */}
      {stats.eventsByCategory && Object.keys(stats.eventsByCategory).length > 0 && (
        <Card mb='20px'>
          <Text fontSize='xl' fontWeight='bold' color={textColor} mb='15px'>
            Distribución por Categoría
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='15px'>
            {Object.entries(stats.eventsByCategory).map(([category, count]) => (
              <Box key={category} p='10px' borderWidth='1px' borderRadius='md'>
                <Text fontSize='sm' fontWeight='medium' color={textColor}>
                  {category}
                </Text>
                <Text fontSize='2xl' fontWeight='bold'>
                  {count}
                </Text>
                <Text fontSize='xs' color='gray.500'>
                  {Math.round((count / stats.totalEvents) * 100)}% del total
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Card>
      )}

      <Card mb='20px'>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>
            Reporte Detallado de Eventos
          </Text>
          <Flex gap='10px'>
            <Select 
              width='150px' 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value='all'>Todos los tiempos</option>
              <option value='today'>Hoy</option>
              <option value='week'>Esta semana</option>
              <option value='month'>Este mes</option>
            </Select>
            <Button 
              colorScheme='blue' 
              onClick={fetchAdminReports}
              isLoading={loading}
            >
              Actualizar
            </Button>
            <Button 
              colorScheme='green' 
              onClick={handleExport}
              isDisabled={loading || events.length === 0}
            >
              Exportar CSV
            </Button>
          </Flex>
        </Flex>
        
        {loading ? (
          <Flex justify="center" py="50px">
            <Spinner size="xl" />
            <Text ml="10px">Cargando reportes...</Text>
          </Flex>
        ) : events.length === 0 ? (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            No hay eventos para mostrar con los filtros seleccionados.
          </Alert>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              // En la tabla, actualiza las columnas:
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
                {events.map((event) => (
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
                            value={event.attendance_rate} 
                            size="xs" 
                            colorScheme={event.attendance_rate >= 70 ? 'green' : event.attendance_rate >= 40 ? 'yellow' : 'red'}
                            mb={1}
                        />
                        <Text fontSize="xs" textAlign="center">
                            {event.attendance_rate}%
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
                ))}
                </Tbody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default AdminReports;