import React, { useState, useEffect } from "react";

// Importaciones de Chakra UI
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Select,
    SimpleGrid,
    Text,
    Textarea,
    useColorModeValue,
    Box,
    useToast, 
} from "@chakra-ui/react";

// Componentes personalizados
import Card from "components/card/Card.js";

// **********************************************
// URL de la API
// **********************************************
const API_BASE_URL = 'http://localhost:8000/api/events'; 

// 🚀 CAMBIO CLAVE: Acepta 'initialEvent' como prop.
export default function EventForm({ initialEvent, onSuccess, onCancel }) { 
    // 1. Estado para el formulario (inicializado con datos vacíos o con initialEvent)
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        capacity: "",
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const textColor = useColorModeValue("secondaryGray.900", "white");

    // 2. Efecto para cargar los datos del evento si estamos editando
    useEffect(() => {
        if (initialEvent) {
            // Transformar datos de Django (snake_case) a React (camelCase)
            setFormData({
                title: initialEvent.title || "",
                // Asegúrate de que category sea un string, aunque contenga el ID (ej: "4")
                category: initialEvent.category ? String(initialEvent.category) : "", 
                // Asegúrate de que las fechas sean solo 'YYYY-MM-DD' para el input type="date"
                startDate: initialEvent.start_time ? initialEvent.start_time.split('T')[0] : "",
                endDate: initialEvent.end_time ? initialEvent.end_time.split('T')[0] : "",
                location: initialEvent.location || "",
                description: initialEvent.description || "",
                capacity: initialEvent.capacity ? String(initialEvent.capacity) : "",
            });
        }
    }, [initialEvent]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🚀 LÓGICA DE ENVÍO Y EDICIÓN (Maneja POST y PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const token = localStorage.getItem('access_token'); 
        
        if (!token) {
            toast({ title: "Error de autenticación", description: "Token JWT no encontrado.", status: "error", duration: 5000, isClosable: true });
            setIsSubmitting(false);
            return;
        }
        
        // 3. Determinar método y URL
        const isEditing = !!initialEvent;
        const method = isEditing ? 'PUT' : 'POST';
        // Si editamos: /api/events/ID/, si creamos: /api/events/
        const url = isEditing ? `${API_BASE_URL}/${initialEvent.id}/` : `${API_BASE_URL}/`;
        
        const dataToSend = {
            title: formData.title,
            // Asegúrate de que el valor sea numérico o el string que espera tu serializer
            category: parseInt(formData.category, 10), 
            start_time: formData.startDate, 
            end_time: formData.endDate, 
            location: formData.location,
            description: formData.description,
            capacity: parseInt(formData.capacity, 10),
            // Si el PUT requiere todos los campos, asegúrate de que ninguno sea nulo/vacío
        };

        console.log(`Enviando ${method} a ${url} con datos:`, dataToSend);
        
        try {
            const response = await fetch(url, { 
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                const action = isEditing ? "actualizado" : "creado";
                toast({
                    title: `Evento ${action}.`,
                    description: `El evento ha sido ${action} exitosamente.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                
                // 4. Llamar a la función de éxito (si se pasó como prop)
                if (onSuccess) {
                    onSuccess();
                }

                // 🧹 Limpiar el formulario solo si es creación
                if (!isEditing) {
                    setFormData({
                        title: "", category: "", startDate: "", endDate: "",
                        location: "", description: "", capacity: "",
                    });
                }
            } else {
                const errorData = await response.json();
                console.error('Error de API:', errorData);
                
                const errorMessage = errorData.detail 
                                     || (Object.values(errorData)[0] ? Object.values(errorData)[0][0] : "Hubo un problema con los datos enviados.");

                toast({
                    title: `Error al ${isEditing ? 'actualizar' : 'crear'} evento.`,
                    description: errorMessage,
                    status: "error",
                    duration: 7000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error de red:', error);
            toast({
                title: "Error de conexión.",
                description: "No se pudo conectar al servidor API.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const actionText = initialEvent ? "Guardar Cambios" : "Crear Evento";
    const headerText = initialEvent ? "Editar Evento" : "Crear Nuevo Evento";


    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            <Text fontSize="3xl" fontWeight="bold" mb="20px" color={textColor} textAlign="center">
                {headerText} 
            </Text>

            <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
                    
                    {/* ⬅️ COLUMNA IZQUIERDA - Información Básica */}
                    <Card p="25px">
                        <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
                            Información Básica
                        </Text>

                        {/* Título */}
                        <FormControl mb="20px">
                            <FormLabel htmlFor="title" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Título del Evento<Text color="brand.500">*</Text>
                            </FormLabel>
                            <Input id="title" name="title" type="text" placeholder="Nombre del evento" onChange={handleChange} value={formData.title} variant="main" h="44px"/>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
                            {/* Categoría */}
                            <FormControl>
                                <FormLabel htmlFor="category" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Categoría<Text color="brand.500">*</Text>
                                </FormLabel>
                                <Select id="category" name="category" placeholder="Seleccionar categoría" onChange={handleChange} value={formData.category} variant="main" h="44px">
                                    <option value="4">Académico</option>
                                    <option value="5">Cultural</option>
                                    <option value="6">Deportivo</option>
                                    <option value="7">Social</option>
                                    <option value="8">Networking</option>
                                </Select>
                            </FormControl>

                            {/* Capacidad */}
                            <FormControl>
                                <FormLabel htmlFor="capacity" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Capacidad
                                </FormLabel>
                                <Input id="capacity" name="capacity" type="number" min="1" placeholder="Número de personas" onChange={handleChange} value={formData.capacity} variant="main" h="44px"/>
                            </FormControl>
                        </SimpleGrid>

                        {/* Descripción */}
                        <FormControl>
                            <FormLabel htmlFor="description" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Descripción<Text color="brand.500">*</Text>
                            </FormLabel>
                            <Textarea id="description" name="description" placeholder="Describe el evento..." onChange={handleChange} value={formData.description} variant="main" rows={6}/>
                        </FormControl>
                    </Card>
                    
                    {/* ➡️ COLUMNA DERECHA - Fecha y Ubicación */}
                    <Card p="25px">
                        <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
                            Fecha y Ubicación
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
                            {/* Fecha Inicio */}
                            <FormControl>
                                <FormLabel htmlFor="startDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Fecha Inicio<Text color="brand.500">*</Text>
                                </FormLabel>
                                <Input id="startDate" name="startDate" type="date" onChange={handleChange} value={formData.startDate} variant="main" h="44px"/>
                            </FormControl>

                            {/* Fecha Fin */}
                            <FormControl>
                                <FormLabel htmlFor="endDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Fecha Fin<Text color="brand.500">*</Text>
                                </FormLabel>
                                <Input id="endDate" name="endDate" type="date" onChange={handleChange} value={formData.endDate} variant="main" h="44px"/>
                            </FormControl>
                        </SimpleGrid>

                        {/* Ubicación */}
                        <FormControl mb="20px">
                            <FormLabel htmlFor="location" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Ubicación<Text color="brand.500">*</Text>
                            </FormLabel>
                            <Input id="location" name="location" type="text" placeholder="Lugar del evento" onChange={handleChange} value={formData.location} variant="main" h="44px"/>
                        </FormControl>
                    </Card>
                </SimpleGrid>

                {/* Action Buttons */}
                <Card p="25px">
                    <Flex gap="15px" justify="flex-end">
                        <Button
                            type="submit"
                            variant="brand"
                            fontSize="sm"
                            fontWeight="500"
                            h="46px"
                            px="40px"
                            isLoading={isSubmitting} 
                        >
                            {/* 5. Texto Dinámico del Botón */}
                            {actionText}
                        </Button>
                        <Button
                            type="button"
                            variant="lightBrand"
                            fontSize="sm"
                            fontWeight="500"
                            h="46px"
                            px="40px"
                            onClick={onCancel} // Llamar a la función de cancelación
                        >
                            Cancelar
                        </Button>
                    </Flex>
                </Card>
            </form>
        </Box>
    );
}