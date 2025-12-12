import React, { useState, useEffect } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import axios from "axios";

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
    Switch,
    useColorModeValue,
    Box,
    useToast,
    FormHelperText,
} from "@chakra-ui/react";

// Componentes personalizados
import Card from "components/card/Card.js";
import { uploadImage } from "utils/uploadImage";

// **********************************************
// URL de la API
// **********************************************
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
const API_BASE_URL = `${API_BASE}/api/events`;

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
        cover_url: "",
        is_public: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const textColor = useColorModeValue("secondaryGray.900", "white");


    // 2. Efecto para cargar los datos del evento si estamos editando
    useEffect(() => {
        if (initialEvent) {
            // Transformar datos de Django (snake_case) a React (camelCase)
            // Para datetime-local necesitamos formato YYYY-MM-DDTHH:MM
            const formatDateTime = (isoString) => {
                if (!isoString) return "";
                return isoString.slice(0, 16); // Toma "YYYY-MM-DDTHH:MM"
            };

            setFormData({
                title: initialEvent.title || "",
                // Asegúrate de que category sea un string, aunque contenga el ID (ej: "4")
                category: initialEvent.category ? String(initialEvent.category) : "",
                startDate: formatDateTime(initialEvent.start_time),
                endDate: formatDateTime(initialEvent.end_time),
                location: initialEvent.location || "",
                description: initialEvent.description || "",
                capacity: initialEvent.capacity ? String(initialEvent.capacity) : "",
                cover_url: initialEvent.cover_url || "",
                is_public: initialEvent.is_public !== undefined ? initialEvent.is_public : true,
            });
        }
    }, [initialEvent]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const url = await uploadImage(file);

        setFormData(prev => ({
            ...prev,
            cover_url: url
        }));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] }
    });

    // 🚀 LÓGICA DE ENVÍO Y EDICIÓN (Maneja POST y PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- VALIDACIONES ---
        // 1. Campos obligatorios (excepto opcionales)
        if (!formData.title || !formData.location || !formData.capacity || !formData.startDate) {
            toast({ title: "Error de validación", description: "Por favor complete todos los campos obligatorios.", status: "error", duration: 5000, isClosable: true });
            return;
        }

        // 2. Fecha del evento posterior a la actual
        const start = new Date(formData.startDate);
        const now = new Date();
        if (start <= now) {
            toast({ title: "Fecha inválida", description: "La fecha del evento debe ser posterior a la fecha actual.", status: "error", duration: 5000, isClosable: true });
            return;
        }

        // 3. Descripción mínimo 7 caracteres (si se provee)
        if (formData.description && formData.description.length < 7) {
            toast({ title: "Descripción muy corta", description: "La descripción debe tener mínimo 7 caracteres.", status: "error", duration: 5000, isClosable: true });
            return;
        }
        // --------------------

        setIsSubmitting(true);

        const token = localStorage.getItem('access_token');

        if (!token) {
            toast({ title: "Error de autenticación", description: "Token JWT no encontrado.", status: "error", duration: 5000, isClosable: true });
            setIsSubmitting(false);
            return;
        }

        const isEditing = !!initialEvent;
        const method = isEditing ? 'PUT' : 'POST';
        // Si editamos: /api/events/ID/, si creamos: /api/events/
        const url = isEditing ? `${API_BASE_URL}/${initialEvent.id}/` : `${API_BASE_URL}/`;

        const dataToSend = {
            title: formData.title,
            // Si category es string vacío, enviamos null o no lo enviamos si el backend lo permite. 
            // Asumiremos que el backend acepta null si es opcional, o int.
            category: formData.category ? parseInt(formData.category, 10) : null,
            start_time: formData.startDate,
            end_time: formData.endDate || null, // End date es opcional en el modelo pero buena práctica enviarlo si existe
            location: formData.location,
            description: formData.description,
            capacity: parseInt(formData.capacity, 10),
            is_public: formData.is_public,
        };

        // Add cover_url only if it has a value
        if (formData.cover_url.trim()) {
            dataToSend.cover_url = formData.cover_url.trim();
        }

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
                        cover_url: "", is_public: true,
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
                        <FormControl mb="20px" isRequired>
                            <FormLabel htmlFor="title" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Título del Evento
                            </FormLabel>
                            <Input id="title" name="title" type="text" placeholder="Nombre del evento" onChange={handleChange} value={formData.title} variant="main" h="44px" />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
                            {/* Categoría (Opcional según requerimientos) */}
                            <FormControl>
                                <FormLabel htmlFor="category" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Categoría
                                </FormLabel>
                                <Select
                                    id="category"
                                    name="category"
                                    placeholder="Seleccionar categoría"
                                    onChange={handleChange}
                                    value={formData.category ? String(formData.category) : ""}
                                    variant="main"
                                    h="44px"
                                >
                                    <option value="4">Académico</option>
                                    <option value="5">Cultural</option>
                                    <option value="6">Deportivo</option>
                                    <option value="7">Social</option>
                                    <option value="8">Networking</option>
                                </Select>
                            </FormControl>

                            {/* Capacidad */}
                            <FormControl isRequired>
                                <FormLabel htmlFor="capacity" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Capacidad
                                </FormLabel>
                                <Input id="capacity" name="capacity" type="number" min="1" placeholder="Número de personas" onChange={handleChange} value={formData.capacity} variant="main" h="44px" />
                            </FormControl>
                        </SimpleGrid>

                        {/* Descripción (Opcional) */}
                        <FormControl>
                            <FormLabel htmlFor="description" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Descripción
                            </FormLabel>
                            <Textarea id="description" name="description" placeholder="Describe el evento..." onChange={handleChange} value={formData.description} variant="main" rows={6} />
                        </FormControl>
                    </Card>

                    {/* ➡️ COLUMNA DERECHA - Fecha y Ubicación */}
                    <Card p="25px">
                        <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
                            Fecha y Ubicación
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
                            {/* Fecha Inicio */}
                            <FormControl isRequired>
                                <FormLabel htmlFor="startDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Fecha Inicio
                                </FormLabel>
                                <Input id="startDate" name="startDate" type="datetime-local" onChange={handleChange} value={formData.startDate} variant="main" h="44px" />
                            </FormControl>

                            {/* Fecha Fin */}
                            <FormControl>
                                <FormLabel htmlFor="endDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                    Fecha Fin
                                </FormLabel>
                                <Input id="endDate" name="endDate" type="datetime-local" onChange={handleChange} value={formData.endDate} variant="main" h="44px" />
                            </FormControl>
                        </SimpleGrid>

                        {/* Ubicación */}
                        <FormControl mb="20px" isRequired>
                            <FormLabel htmlFor="location" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                                Ubicación
                            </FormLabel>
                            <Input id="location" name="location" type="text" placeholder="Lugar del evento" onChange={handleChange} value={formData.location} variant="main" h="44px" />
                        </FormControl>

                        {/* Cover Image URL */}
                        <FormControl mb="20px">
                            <FormLabel fontSize="sm">Imagen de Portada</FormLabel>

                            <Box
                                {...getRootProps()}
                                border="2px dashed #888"
                                borderRadius="lg"
                                p="20px"
                                textAlign="center"
                                cursor="pointer"
                                bg={isDragActive ? "purple.100" : "secondaryGray.200"}
                            >
                                <input {...getInputProps()} />
                                <Text fontSize="sm">
                                    {isDragActive
                                        ? "Suelta la imagen aquí"
                                        : "Arrastra una imagen o haz clic para subirla"}
                                </Text>
                            </Box>

                            {formData.cover_url && (
                                <img
                                    src={formData.cover_url}
                                    alt="preview"
                                    style={{ marginTop: "10px", width: "100%", borderRadius: "8px" }}
                                />
                            )}
                            <FormHelperText fontSize="xs" color="gray.500" mt="4px">
                                URL de una imagen para tu evento (opcional)
                            </FormHelperText>
                        </FormControl>

                        {/* Public Event Toggle */}
                        <FormControl display="flex" alignItems="center" mb="20px">
                            <Switch
                                name="is_public"
                                isChecked={formData.is_public}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_public: e.target.checked,
                                    }));
                                }}
                                colorScheme="brand"
                                size="lg"
                            />
                            <FormLabel htmlFor="is_public" fontSize="sm" fontWeight="500" color={textColor} mb="0" ml="15px">
                                Evento público
                            </FormLabel>
                            <Text fontSize="xs" color="gray.500" ml="10px">
                                Los eventos públicos son visibles para todos
                            </Text>
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