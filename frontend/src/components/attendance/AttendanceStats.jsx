import React from 'react';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react';

const AttendanceStats = ({ totalRegistered, totalAttended, showDetails = true }) => {
  const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      <Stat px={4} py={3} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <StatLabel fontSize="sm">Total Inscritos</StatLabel>
        <StatNumber fontSize="2xl">{totalRegistered}</StatNumber>
        <StatHelpText>Personas registradas</StatHelpText>
      </Stat>
      
      <Stat px={4} py={3} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <StatLabel fontSize="sm">Asistentes Confirmados</StatLabel>
        <StatNumber fontSize="2xl" color={totalAttended > 0 ? "green.500" : "gray.500"}>
          {totalAttended}
        </StatNumber>
        <StatHelpText>
          {showDetails && `${attendanceRate.toFixed(1)}% de asistencia`}
        </StatHelpText>
      </Stat>
      
      <Stat px={4} py={3} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <StatLabel fontSize="sm">Por Confirmar</StatLabel>
        <StatNumber fontSize="2xl" color="orange.500">
          {Math.max(0, totalRegistered - totalAttended)}
        </StatNumber>
        <StatHelpText>
          Pendientes de confirmar
        </StatHelpText>
      </Stat>
    </SimpleGrid>
  );
};

export default AttendanceStats;