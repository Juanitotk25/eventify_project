import React, {useState, useEffect, useCallback} from 'react';
import { 
    Box, 
    Button, 
    Text, 
    Flex, 
    Table, 
    Thead, 
    Tbody, 
    Tr, 
    Th, 
    Td, 
    useDisclosure,
    useToast 
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import moment from 'moment';
import EventFormModal from 'components/events/EventFormModal';

// **********************************************
// IMPORTANTE: DEBE ESTAR SIN LA BARRA FINAL (/)
// Esto facilita la concatenación para PUT/DELETE
// **********************************************
const API_BASE_URL = 'http://localhost:8000/api/events'; 

const EventTable = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentEvent, setCurrentEvent] = useState(null);
    
    // Control del modal (para crear y editar)
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const toast = useToast();

    // **********************************************
    // FUNCIÓN CENTRAL: OBTENER DATOS DE LA API (GET)
    // **********************************************
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            setError("Error: Token JWT no encontrado. Por favor, inicie sesión de nuevo.");
            setIsLoading(false);
            return;
        }

        try {
            // CORRECCIÓN: Añadir la barra final para el GET LISTAR
            const response = await fetch(`${API_BASE_URL}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Envía el Token JWT
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Intenta parsear JSON, si falla, usa el texto como error
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorData[Object.keys(errorData)[0]] || `Error ${response.status}: Fallo al obtener eventos.`;
                } catch {
                    errorMessage = `Error ${response.status}: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setEvents(data);
            setError(null);
            
        } catch (err) {
            setError(err.message || "Error de conexión al servidor.");
            toast({
                title: 'Error de Carga',
                description: err.message || "No se pudo cargar la lista de eventos.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // **********************************************
    // MANEJO DE ACCIONES
    // **********************************************

    const handleOpenCreate = () => {
        setCurrentEvent(null); // Abre el modal en modo Creación
        onOpen();
    };

    const handleOpenEdit = (event) => {
        setCurrentEvent(event); // Carga los datos del evento a editar
        onOpen();
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // CORRECCIÓN: La URL ya es correcta sin la doble barra: API_BASE_URL + / + eventId + /
            const response = await fetch(`${API_BASE_URL}/${eventId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) { // 204 No Content es la respuesta correcta para DELETE
                toast({
                    title: 'Evento Eliminado',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                await fetchEvents(); // Recargar la lista
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}: Fallo al eliminar.`);
            }
        } catch (err) {
            toast({
                title: 'Error de Eliminación',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // **********************************************
    // RENDERIZADO
    // **********************************************

    if (isLoading) {
        return <Text mt="100px">Cargando eventos...</Text>;
    }

    if (error) {
        return <Text color="red.500" mt="100px">{error}</Text>;
    }

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            <Flex justify="space-between" align="center" mb="30px">
                <Text fontSize="2xl" fontWeight="bold">
                    Tus Eventos
                </Text>
                
                <Button
                    leftIcon={<MdAdd />}
                    colorScheme="green"
                    onClick={handleOpenCreate}
                >
                    Añadir Evento
                </Button>
            </Flex>

            {/* Modal para Crear/Editar Eventos */}
            <EventFormModal 
                isOpen={isOpen} 
                onClose={() => {
                    onClose();
                    setCurrentEvent(null);
                }} 
                currentEvent={currentEvent} 
                fetchEvents={fetchEvents}
                API_BASE_URL={API_BASE_URL} // Se pasa la URL sin la barra final
            />

            {events.length === 0 ? (
                <Text>Aún no has creado ningún evento. ¡Empieza ahora!</Text>
            ) : (
                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Título</Th>
                                <Th>Categoría</Th>
                                <Th>Inicio</Th>
                                <Th>Público</Th>
                                <Th>Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {events.map((event) => (
                                <Tr key={event.id}>
                                    <Td>{event.title}</Td>
                                    <Td>{event.category_name || 'N/A'}</Td>
                                    <Td>{moment(event.start_time).format('DD/MM/YYYY HH:mm')}</Td>
                                    <Td>{event.is_public ? 'Sí' : 'No'}</Td>
                                    <Td>
                                        <Flex>
                                            <Button 
                                                size="sm" 
                                                colorScheme="blue" 
                                                onClick={() => handleOpenEdit(event)} 
                                                mr={2}
                                                leftIcon={<MdEdit />}
                                            >
                                                Editar
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                colorScheme="red" 
                                                onClick={() => handleDelete(event.id)}
                                                leftIcon={<MdDelete />}
                                            >
                                                Eliminar
                                            </Button>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default EventTable;