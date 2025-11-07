import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Switch,
    VStack,
    useToast,
    Spinner,
    Select,
    Flex,
} from '@chakra-ui/react';
import moment from 'moment';

const EventFormModal = ({ isOpen, onClose, currentEvent, fetchEvents, API_BASE_URL }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        capacity: '',
        is_public: true,
        category: '', // Asume que el backend espera el ID de la categoría
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    // **********************************************
    // Llenar el formulario si estamos editando
    // **********************************************
    useEffect(() => {
        if (currentEvent) {
            setFormData({
                title: currentEvent.title || '',
                description: currentEvent.description || '',
                location: currentEvent.location || '',
                // Formato de tiempo compatible con input[type="datetime-local"] y backend
                start_time: moment(currentEvent.start_time).format('YYYY-MM-DDTHH:mm'),
                end_time: currentEvent.end_time ? moment(currentEvent.end_time).format('YYYY-MM-DDTHH:mm') : '',
                capacity: currentEvent.capacity || '',
                is_public: currentEvent.is_public,
                category: currentEvent.category || '', 
            });
        } else {
            // Resetear para Crear nuevo evento
            setFormData({
                title: '', description: '', location: '', start_time: '', 
                end_time: '', capacity: '', is_public: true, category: ''
            });
        }
    }, [currentEvent]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // **********************************************
    // FUNCIÓN DE ENVÍO (CREATE/UPDATE)
    // **********************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const token = localStorage.getItem('access_token');
        const method = currentEvent ? 'PUT' : 'POST';
        const url = currentEvent ? `${API_BASE_URL}/${currentEvent.id}/` : `${API_BASE_URL}/`;

        // Limpieza de datos (ej. capacity a null si está vacío)
        const dataToSend = {
            ...formData,
            capacity: formData.capacity === '' ? null : parseInt(formData.capacity),
            end_time: formData.end_time === '' ? null : formData.end_time,
            // Asegurar que la categoría sea null si está vacía, no una string vacía
            category: formData.category === '' ? null : parseInt(formData.category), 
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Response text:", errorData);
                console.error("Status:", response.status);
                const errorMessage = errorData.detail || JSON.stringify(errorData);
                throw new Error(errorMessage || `Error ${response.status}: Fallo al guardar evento.`);
            }

            const successMessage = currentEvent ? 'Evento actualizado con éxito.' : 'Evento creado con éxito.';
            
            toast({
                title: 'Éxito',
                description: successMessage,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onClose(); 
            fetchEvents(); // Recargar la lista
            
        } catch (err) {
            toast({
                title: 'Error al guardar',
                description: err.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit}>
                <ModalHeader>{currentEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Título</FormLabel>
                            <Input 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="Título del evento"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Descripción</FormLabel>
                            <Textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Detalles del evento"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Ubicación</FormLabel>
                            <Input 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                placeholder="Lugar o URL de la reunión"
                            />
                        </FormControl>
                        
                        {/* Asumo que tienes un endpoint para Categorías y las precargas */}
                        <FormControl>
                            <FormLabel>Categoría</FormLabel>
                            <Select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una Categoría (ID)</option>
                                {/* Aquí deberías mapear tus categorías. Por ahora, usa IDs de prueba */}
                                <option value="1">Conferencia</option>
                                <option value="2">Taller</option>
                                <option value="3">Reunión</option>
                                {/* ... mapear categorías reales desde la API ... */}
                            </Select>
                        </FormControl>
                        
                        <Flex w="100%" gap={4}>
                            <FormControl isRequired>
                                <FormLabel>Hora de Inicio</FormLabel>
                                <Input
                                    name="start_time"
                                    type="datetime-local"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Hora de Fin</FormLabel>
                                <Input
                                    name="end_time"
                                    type="datetime-local"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </Flex>
                        <Flex w="100%" gap={4} alignItems="center">
                            <FormControl>
                                <FormLabel>Capacidad (Opcional)</FormLabel>
                                <Input
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl display="flex" alignItems="center" w="auto">
                                <FormLabel htmlFor='is_public' mb='0'>
                                    Es Público
                                </FormLabel>
                                <Switch 
                                    id='is_public' 
                                    name="is_public" 
                                    isChecked={formData.is_public}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </Flex>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" onClick={onClose} mr={3}>
                        Cancelar
                    </Button>
                    <Button 
                        colorScheme="green" 
                        type="submit" 
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Spinner size="sm" /> : (currentEvent ? 'Guardar Cambios' : 'Crear Evento')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EventFormModal;