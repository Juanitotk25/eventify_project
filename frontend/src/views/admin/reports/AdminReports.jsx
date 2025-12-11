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
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { useAuthStore } from 'stores/useAuthStore';

const AdminReports = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (role !== 'admin') {
      return;
    }
    
    // Aquí irá la llamada a la API
    setTimeout(() => {
      setEvents([
        { id: 1, name: 'Conferencia de Tecnología', date: '2024-01-15', category: 'Conferencia', attendees: 45, confirmed: 30, status: 'finished' },
        { id: 2, name: 'Taller de Programación', date: '2024-01-16', category: 'Taller', attendees: 60, confirmed: 45, status: 'active' },
        { id: 3, name: 'Networking Empresarial', date: '2024-01-17', category: 'Social', attendees: 80, confirmed: 65, status: 'active' },
      ]);
      setLoading(false);
    }, 1000);
  }, [dateRange, role, user]);

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
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='20px' mb='20px'>
        <Card>
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Eventos
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>{events.length}</Text>
        </Card>
        <Card>
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Total Inscritos
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>
            {events.reduce((sum, event) => sum + event.attendees, 0)}
          </Text>
        </Card>
        <Card>
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Tasa de Confirmación
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>
            {events.length > 0 
              ? Math.round(
                  (events.reduce((sum, event) => sum + event.confirmed, 0) / 
                   events.reduce((sum, event) => sum + event.attendees, 0)) * 100
                )
              : 0}%
          </Text>
        </Card>
        <Card>
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            Eventos Activos
          </Text>
          <Text fontSize='3xl' fontWeight='bold'>
            {events.filter(e => e.status === 'active').length}
          </Text>
        </Card>
      </SimpleGrid>

      <Card mb='20px'>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>
            Reporte General de Eventos
          </Text>
          <Flex gap='10px'>
            <Select 
              width='150px' 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value='all'>Todos</option>
              <option value='today'>Hoy</option>
              <option value='week'>Esta semana</option>
              <option value='month'>Este mes</option>
            </Select>
            <Button colorScheme='blue'>
              Actualizar
            </Button>
            <Button colorScheme='green'>
              Exportar
            </Button>
          </Flex>
        </Flex>
        
        {loading ? (
          <Flex justify="center" py="50px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>Evento</Th>
                  <Th borderColor={borderColor}>Fecha</Th>
                  <Th borderColor={borderColor}>Categoría</Th>
                  <Th borderColor={borderColor}>Inscritos</Th>
                  <Th borderColor={borderColor}>Confirmados</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {events.map((event) => (
                  <Tr key={event.id}>
                    <Td borderColor={borderColor}>{event.name}</Td>
                    <Td borderColor={borderColor}>{event.date}</Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme="purple">{event.category}</Badge>
                    </Td>
                    <Td borderColor={borderColor}>{event.attendees}</Td>
                    <Td borderColor={borderColor}>{event.confirmed}</Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme={event.status === 'active' ? 'green' : 'gray'}>
                        {event.status === 'active' ? 'Activo' : 'Finalizado'}
                      </Badge>
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