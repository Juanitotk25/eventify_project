import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Skeleton,
  IconButton,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { ChevronLeftIcon, DownloadIcon, CopyIcon } from '@chakra-ui/icons';
import { attendanceService } from '../../../services/attendanceService';
import { eventService } from '../../../services/eventService';
//Importar desde la ubicación correcta
import ReportCard from './components/ReportCard';
import AttendanceChart from './components/AttendanceChart';

const EventReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('attendees');

  useEffect(() => {
    fetchEventReport();
  }, [id]);

  const fetchEventReport = async () => {
    setLoading(true);
    try {
      // Obtener datos del evento
      const event = await eventService.getEventById(id);
      setEventData(event);
      
      // Obtener reporte de asistencia
      const report = await attendanceService.getEventAttendanceReport(id);
      setReportData(report.data);
    } catch (error) {
      console.error('Error fetching event report:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo cargar el reporte',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      // Si no tiene permiso, redirigir
      if (error.response?.status === 403) {
        navigate('/reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implementar exportación
    toast({
      title: 'Exportando reporte...',
      status: 'info',
      duration: 2000,
    });
  };

  const handleCopyEmailList = () => {
    if (!reportData?.attendees) return;
    
    const emails = reportData.attendees
      .map(attendee => attendee['user__user__email'])
      .filter(email => email)
      .join(', ');
    
    navigator.clipboard.writeText(emails);
    
    toast({
      title: 'Emails copiados',
      description: 'Lista de emails copiada al portapapeles',
      status: 'success',
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="100px" borderRadius="xl" />
          ))}
        </SimpleGrid>
        <Skeleton height="400px" borderRadius="xl" />
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>No se encontró el reporte</Text>
      </Container>
    );
  }

  const { event, statistics, attendees = [], non_attendees = [] } = reportData;

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={4}>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => navigate('/reports')}
            aria-label="Volver"
          />
          <Box>
            <Heading size="lg">{event.title}</Heading>
            <Text color="gray.600">
              {new Date(event.start_time).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Box>
        </Flex>
        
        <HStack>
          <Button
            leftIcon={<CopyIcon />}
            onClick={handleCopyEmailList}
            isDisabled={!attendees.length}
          >
            Copiar Emails
          </Button>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={handleExport}
          >
            Exportar Reporte
          </Button>
        </HStack>
      </Flex>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={8}>
        <ReportCard
          title="Total Inscritos"
          value={statistics.total_registered}
          subtitle="Personas registradas"
          colorScheme="blue"
        />
        <ReportCard
          title="Asistentes Confirmados"
          value={statistics.total_attended}
          subtitle="Asistencia confirmada"
          colorScheme="green"
        />
        <ReportCard
          title="Tasa de Asistencia"
          value={`${statistics.attendance_rate}%`}
          subtitle="Porcentaje de asistencia"
          colorScheme={statistics.attendance_rate >= 70 ? 'green' : statistics.attendance_rate >= 40 ? 'orange' : 'red'}
        />
      </SimpleGrid>

      {/* Gráfico de asistencia */}
      <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" mb={8}>
        <Heading size="md" mb={4}>Resumen de Asistencia</Heading>
        <AttendanceChart
          total={statistics.total_registered}
          attended={statistics.total_attended}
          height="40px"
        />
      </Box>

      {/* Tabs para asistentes/no asistentes */}
      <Box mb={6}>
        <HStack spacing={4} mb={4}>
          <Button
            variant={activeTab === 'attendees' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('attendees')}
          >
            Asistentes ({attendees.length})
          </Button>
          <Button
            variant={activeTab === 'non_attendees' ? 'solid' : 'ghost'}
            colorScheme="orange"
            onClick={() => setActiveTab('non_attendees')}
          >
            No Asistentes ({non_attendees.length})
          </Button>
        </HStack>

        {/* Tabla de asistentes */}
        {activeTab === 'attendees' && (
          <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Usuario</Th>
                  <Th>Fecha de Registro</Th>
                </Tr>
              </Thead>
              <Tbody>
                {attendees.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={8}>
                      <Text color="gray.500">No hay asistentes confirmados</Text>
                    </Td>
                  </Tr>
                ) : (
                  attendees.map((attendee, index) => (
                    <Tr key={index} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <Text fontWeight="medium">
                          {attendee['user__full_name'] || 'Nombre no disponible'}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="blue.600">{attendee['user__user__email']}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">
                          {attendee['user__user__username']}
                        </Badge>
                      </Td>
                      <Td>
                        {new Date(attendee.created_at).toLocaleDateString('es-ES')}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Tabla de no asistentes */}
        {activeTab === 'non_attendees' && (
          <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Usuario</Th>
                  <Th>Estado</Th>
                  <Th>Fecha de Registro</Th>
                </Tr>
              </Thead>
              <Tbody>
                {non_attendees.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <Text color="gray.500">Todos los inscritos confirmaron asistencia</Text>
                    </Td>
                  </Tr>
                ) : (
                  non_attendees.map((nonAttendee, index) => (
                    <Tr key={index} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <Text fontWeight="medium">
                          {nonAttendee['user__full_name'] || 'Nombre no disponible'}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="blue.600">{nonAttendee['user__user__email']}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">
                          {nonAttendee['user__user__username']}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            nonAttendee.status === 'registered' ? 'yellow' :
                            nonAttendee.status === 'waitlisted' ? 'orange' : 'gray'
                          }
                        >
                          {nonAttendee.status === 'registered' ? 'Inscrito' :
                           nonAttendee.status === 'waitlisted' ? 'Lista de espera' : nonAttendee.status}
                        </Badge>
                      </Td>
                      <Td>
                        {new Date(nonAttendee.created_at).toLocaleDateString('es-ES')}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EventReport;