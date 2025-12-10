import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { attendanceService } from '../../services/attendanceService';

const ConfirmAttendanceButton = ({ registrationId, isAttended, onSuccess, ...props }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleConfirmAttendance = async () => {
    if (!registrationId) {
      toast({
        title: "Error",
        description: "No estás inscrito en este evento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceService.confirmAttendance(registrationId);
      
      toast({
        title: "¡Asistencia confirmada!",
        description: "Tu asistencia ha sido registrada exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "No se pudo confirmar la asistencia",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Si ya asistió, mostrar estado confirmado
  if (isAttended) {
    return (
      <Button
        leftIcon={<CheckCircleIcon />}
        colorScheme="green"
        variant="solid"
        size="md"
        isDisabled
        {...props}
      >
        Asistencia Confirmada
      </Button>
    );
  }

  return (
    <Button
      leftIcon={<CheckCircleIcon />}
      colorScheme="blue"
      variant="solid"
      size="md"
      onClick={handleConfirmAttendance}
      isLoading={loading}
      loadingText="Confirmando..."
      isDisabled={!registrationId}
      {...props}
    >
      {registrationId ? "Confirmar Asistencia" : "Inscríbete primero"}
    </Button>
  );
};

export default ConfirmAttendanceButton;