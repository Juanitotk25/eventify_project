import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

const AttendanceChart = ({ total, attended, width = '100%', height = '120px' }) => {
  const attendanceRate = total > 0 ? (attended / total) * 100 : 0;
  const barWidth = `${attendanceRate}%`;

  return (
    <Box width={width}>
      <Flex justify="space-between" mb={2}>
        <Text fontSize="sm" color="gray.600">
          Asistencia: {attended}/{total} ({attendanceRate.toFixed(1)}%)
        </Text>
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {attendanceRate.toFixed(1)}%
        </Text>
      </Flex>
      
      <Box
        height={height}
        bg="gray.100"
        borderRadius="full"
        overflow="hidden"
        position="relative"
      >
        <Box
          height="100%"
          width={barWidth}
          bg={attendanceRate >= 70 ? 'green.400' : attendanceRate >= 40 ? 'yellow.400' : 'red.400'}
          borderRadius="full"
          transition="width 0.5s ease"
          position="relative"
        >
          <Box
            position="absolute"
            right="2"
            top="50%"
            transform="translateY(-50%)"
            color="white"
            fontSize="xs"
            fontWeight="bold"
          >
            {attended}
          </Box>
        </Box>
      </Box>
      
      <Flex justify="space-between" mt={2}>
        <Text fontSize="xs" color="gray.500">0%</Text>
        <Text fontSize="xs" color="gray.500">50%</Text>
        <Text fontSize="xs" color="gray.500">100%</Text>
      </Flex>
    </Box>
  );
};

export default AttendanceChart;