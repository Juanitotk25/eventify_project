import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, Flex } from '@chakra-ui/react';

const ReportCard = ({ title, value, subtitle, icon, colorScheme = 'blue', ...props }) => {
  const colors = {
    blue: { bg: 'blue.50', border: 'blue.200', text: 'blue.700' },
    green: { bg: 'green.50', border: 'green.200', text: 'green.700' },
    purple: { bg: 'purple.50', border: 'purple.200', text: 'purple.700' },
    orange: { bg: 'orange.50', border: 'orange.200', text: 'orange.700' },
    red: { bg: 'red.50', border: 'red.200', text: 'red.700' },
  };

  const colorSet = colors[colorScheme] || colors.blue;

  return (
    <Box
      bg={colorSet.bg}
      border="1px solid"
      borderColor={colorSet.border}
      borderRadius="xl"
      p={6}
      {...props}
    >
      <Flex align="center" justify="space-between" mb={2}>
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            {title}
          </StatLabel>
          <StatNumber fontSize="3xl" color={colorSet.text} fontWeight="bold">
            {value}
          </StatNumber>
          {subtitle && (
            <StatHelpText color="gray.500" fontSize="sm" mt={1}>
              {subtitle}
            </StatHelpText>
          )}
        </Stat>
        {icon && (
          <Box color={colorSet.text} fontSize="2xl">
            {icon}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default ReportCard;