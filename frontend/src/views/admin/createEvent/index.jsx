import React, { useState } from "react";

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
  useToast, // Necesario para notificaciones
} from "@chakra-ui/react";

// Componentes personalizados
import Card from "components/card/Card.js";

// **********************************************
// URL de la API: Usamos la URL base que proporcionaste
// **********************************************
const API_BASE_URL = 'http://localhost:8000/api/events'; 

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    capacity: "",
    // 'imageUrl' fue eliminado, como solicitaste
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false); // Para deshabilitar el botón
  const toast = useToast();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🚀 LÓGICA DE ENVÍO AL BACKEND (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // NOTA: Tu EventTable usaba 'access_token', usaremos esa clave aquí
    const token = localStorage.getItem('access_token'); 
    
    if (!token) {
        toast({
            title: "Error de autenticación",
            description: "Token JWT no encontrado. Por favor, inicie sesión.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
        setIsSubmitting(false);
        return;
    }
    
    // ⚙️ Adaptar los nombres de campo de React a Django (si es necesario)
    const dataToSend = {
        title: formData.title,
        category: formData.category,
        // Django usa snake_case, por lo que adaptamos los nombres aquí:
        start_time: formData.startDate, 
        end_time: formData.endDate, 
        location: formData.location,
        description: formData.description,
        capacity: parseInt(formData.capacity, 30), // Aseguramos que sea un número
        // Puedes añadir aquí otros campos fijos que necesite tu API, como 'is_public': true
    };

    // ⬅️ ¡AÑADE ESTA LÍNEA PARA VER LOS DATOS!
    console.log("Datos enviados a Django:", dataToSend);
    
    try {
        const response = await fetch(`${API_BASE_URL}/`, { // POST a /api/events/
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            toast({
                title: "Evento creado.",
                description: "El nuevo evento ha sido registrado exitosamente.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            // 🧹 Limpiar el formulario
            setFormData({
                title: "", category: "", startDate: "", endDate: "",
                location: "", description: "", capacity: "",
            });
        } else {
            const errorData = await response.json();
            console.error('Error al crear evento:', errorData);
            
            // Intenta mostrar un mensaje de error detallado
            const errorMessage = errorData.detail 
                                || (Object.values(errorData)[0] ? Object.values(errorData)[0][0] : "Hubo un problema con los datos enviados.");

            toast({
                title: "Error al crear evento.",
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
            description: "No se pudo conectar al servidor API. Revise que el backend esté activo.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Text fontSize="3xl" fontWeight="bold" mb="20px" color={textColor} textAlign="center">
        Crear Nuevo Evento
      </Text>

      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
          
          {/* ⬅️ COLUMNA IZQUIERDA - Información Básica */}
          <Card p="25px">
            <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
              Información Básica
            </Text>

            <FormControl mb="20px">
              <FormLabel htmlFor="title" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                Título del Evento<Text color="brand.500">*</Text>
              </FormLabel>
              <Input id="title" name="title" type="text" placeholder="Nombre del evento" onChange={handleChange} value={formData.title} variant="main" h="44px"/>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
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

              <FormControl>
                <FormLabel htmlFor="capacity" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                  Capacidad
                </FormLabel>
                <Input id="capacity" name="capacity" type="number" min="1" placeholder="Número de personas" onChange={handleChange} value={formData.capacity} variant="main" h="44px"/>
              </FormControl>
            </SimpleGrid>

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
              <FormControl>
                <FormLabel htmlFor="startDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                  Fecha Inicio<Text color="brand.500">*</Text>
                </FormLabel>
                <Input id="startDate" name="startDate" type="date" onChange={handleChange} value={formData.startDate} variant="main" h="44px"/>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="endDate" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                  Fecha Fin<Text color="brand.500">*</Text>
                </FormLabel>
                <Input id="endDate" name="endDate" type="date" onChange={handleChange} value={formData.endDate} variant="main" h="44px"/>
              </FormControl>
            </SimpleGrid>

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
              Crear Evento
            </Button>
            <Button
              type="button"
              variant="lightBrand"
              fontSize="sm"
              fontWeight="500"
              h="46px"
              px="40px"
              onClick={() => { /* Lógica de Cancelar o Volver */ }}
            >
              Cancelar
            </Button>
          </Flex>
        </Card>
      </form>
    </Box>
  );
}