import React from 'react';
import { Box, Button, Text, Flex } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';

const UserEventDashboard = () => {
    
    // Verificamos si el token de autenticación está presente
    const token = localStorage.getItem('access_token');

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            <Flex justify="space-between" align="center" mb="30px">
                <Text fontSize="2xl" fontWeight="bold">
                    Panel de Eventos (Página de Prueba)
                </Text>
                
                <Button
                    leftIcon={<MdAdd />}
                    colorScheme="green"
                    onClick={() => alert(`¡Botón presionado! Estatus de Login: ${token ? 'OK' : 'Falta Token'}`)}
                >
                    Añadir Evento
                </Button>
            </Flex>
            
            <Text color={token ? "green.600" : "red.600"}>
                **Estado de Autenticación:** {token ? 'El token JWT está en localStorage. LISTO para la API.' : 'ERROR: Token JWT NO encontrado. El Login falló.'}
            </Text>

            {/* Aquí iría el resto de tu tabla de eventos */}

        </Box>
    );
};

export default UserEventDashboard;