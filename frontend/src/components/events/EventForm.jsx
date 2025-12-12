// EventForm component - can be used standalone or in a modal
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Switch,
    useToast,
    useColorModeValue,
    Flex,
    Text,
    FormHelperText,
    FormErrorMessage,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function EventForm({ initialEvent = null, onSuccess, onCancel, isModal = false }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        start_time: "",
        end_time: "",
        capacity: "",
        is_public: true,
        cover_url: "",
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const navigate = useNavigate();

    const textColor = useColorModeValue("secondaryGray.900", "white");
    const bgColor = useColorModeValue("white", "navy.800");

    // Load categories and populate form if editing
    useEffect(() => {
        loadCategories();
        if (initialEvent) {
            setFormData({
                title: initialEvent.title || "",
                description: initialEvent.description || "",
                category: initialEvent.category?.id || initialEvent.category || "",
                location: initialEvent.location || "",
                start_time: initialEvent.start_time ? new Date(initialEvent.start_time.replace("T", " ")).toISOString().slice(0, 16) : "",
                end_time: initialEvent.end_time ? new Date(initialEvent.end_time.replace("T", " ")).toISOString().slice(0, 16) : "",
                capacity: initialEvent.capacity || "",
                is_public: initialEvent.is_public !== undefined ? initialEvent.is_public : true,
                cover_url: initialEvent.cover_url || "",
            });
        }
    }, [initialEvent]);

    const loadCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/categories/`);
            setCategories(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "El título es requerido";
        }
        if (!formData.start_time) {
            newErrors.start_time = "La fecha y hora de inicio es requerida";
        }
        if (formData.end_time && formData.start_time) {
            if (new Date(formData.end_time) <= new Date(formData.start_time)) {
                newErrors.end_time = "La fecha de fin debe ser posterior a la fecha de inicio";
            }
        }
        if (formData.capacity && parseInt(formData.capacity) <= 0) {
            newErrors.capacity = "La capacidad debe ser un número positivo";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Error de validación",
                description: "Por favor, corrige los errores en el formulario",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para crear eventos",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
                start_time: formData.start_time,
                is_public: formData.is_public,
            };

            if (formData.category) {
                submitData.category = parseInt(formData.category);
            }
            if (formData.end_time) {
                submitData.end_time = formData.end_time;
            }
            if (formData.capacity) {
                submitData.capacity = parseInt(formData.capacity);
            }
            if (formData.cover_url.trim()) {
                submitData.cover_url = formData.cover_url.trim();
            }

            if (initialEvent) {
                // Update existing event
                await axios.put(`${API_BASE}/api/events/${initialEvent.id}/`, submitData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast({
                    title: "¡Éxito!",
                    description: "Evento actualizado correctamente",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Create new event
                await axios.post(`${API_BASE}/api/events/`, submitData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast({
                    title: "¡Éxito!",
                    description: "Evento creado correctamente",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }

            // Call success callback (closes modal and refreshes list)
            if (onSuccess) {
                onSuccess();
            } else if (!isModal) {
                // If not in modal, navigate to event list
                navigate("/user/event-list");
            }
        } catch (error) {
            console.error("Error saving event:", error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Error al guardar el evento";
            toast({
                title: "Error",
                description: errorMsg,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg={bgColor} borderRadius="lg" p={6}>
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={5}>
                    {/* Title */}
                    <FormControl isRequired isInvalid={errors.title}>
                        <FormLabel fontWeight="600">Título del Evento</FormLabel>
                        <Input
                            name="title"
                            placeholder="Ej: Charla de Inteligencia Artificial"
                            value={formData.title}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        />
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                    </FormControl>

                    {/* Description */}
                    <FormControl>
                        <FormLabel fontWeight="600">Descripción</FormLabel>
                        <Textarea
                            name="description"
                            placeholder="Describe tu evento..."
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            resize="vertical"
                            focusBorderColor="brand.500"
                        />
                    </FormControl>

                    {/* Category */}
                    <FormControl>
                        <FormLabel fontWeight="600">Categoría</FormLabel>
                        <Select
                            name="category"
                            placeholder="Selecciona una categoría (opcional)"
                            value={formData.category}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Location */}
                    <FormControl>
                        <FormLabel fontWeight="600">Ubicación</FormLabel>
                        <Input
                            name="location"
                            placeholder="Ej: Salón de Actos"
                            value={formData.location}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        />
                    </FormControl>

                    {/* Start Time */}
                    <FormControl isRequired isInvalid={errors.start_time}>
                        <FormLabel fontWeight="600">Fecha y Hora de Inicio</FormLabel>
                        <Input
                            name="start_time"
                            type="datetime-local"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        />
                        <FormErrorMessage>{errors.start_time}</FormErrorMessage>
                    </FormControl>

                    {/* End Time */}
                    <FormControl isInvalid={errors.end_time}>
                        <FormLabel fontWeight="600">Fecha y Hora de Fin</FormLabel>
                        <Input
                            name="end_time"
                            type="datetime-local"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                            min={formData.start_time}
                        />
                        <FormErrorMessage>{errors.end_time}</FormErrorMessage>
                        <FormHelperText>Opcional - Deja vacío para eventos sin hora de fin</FormHelperText>
                    </FormControl>

                    {/* Capacity */}
                    <FormControl isInvalid={errors.capacity}>
                        <FormLabel fontWeight="600">Capacidad</FormLabel>
                        <Input
                            name="capacity"
                            type="number"
                            placeholder="Ej: 50"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        />
                        <FormErrorMessage>{errors.capacity}</FormErrorMessage>
                        <FormHelperText>Número máximo de asistentes (opcional)</FormHelperText>
                    </FormControl>

                    {/* Cover URL */}
                    <FormControl>
                        <FormLabel fontWeight="600">URL de Imagen de Portada</FormLabel>
                        <Input
                            name="cover_url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            value={formData.cover_url}
                            onChange={handleInputChange}
                            focusBorderColor="brand.500"
                        />
                        <FormHelperText>URL de una imagen para tu evento (opcional)</FormHelperText>
                    </FormControl>

                    {/* Public Event */}
                    <FormControl display="flex" alignItems="center">
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
                        <FormLabel ml={4} mb={0} fontWeight="600">
                            Evento público
                        </FormLabel>
                        <Text ml={2} fontSize="sm" color="gray.500">
                            Los eventos públicos son visibles para todos
                        </Text>
                    </FormControl>

                    {/* Action Buttons */}
                    <Flex gap={3} justify="flex-end" pt={2}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (onCancel) {
                                    onCancel();
                                } else if (!isModal) {
                                    navigate("/user/event-list");
                                }
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="brand"
                            type="submit"
                            isLoading={loading}
                            loadingText={initialEvent ? "Actualizando..." : "Creando..."}
                        >
                            {initialEvent ? "Actualizar Evento" : "Crear Evento"}
                        </Button>
                    </Flex>
                </Flex>
            </form>
        </Box>
    );
}


