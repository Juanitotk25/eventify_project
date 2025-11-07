import React, { useEffect, useRef, useState } from "react";

// Chakra imports
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Flex,
    Text,
    Image,
    Button,
    IconButton,
    useColorModeValue,
    useToast, 
    Tag, 
} from "@chakra-ui/react";


// Custom components
import { SearchIcon } from "@chakra-ui/icons";
import Card from "components/card/Card.js";
import axios from "axios";
import moment from "moment";
import { MdEdit, MdDelete, MdPeople } from 'react-icons/md';

// 📚 MAPEO DE CATEGORÍAS
// AJUSTA ESTOS IDs (1, 2, 3...) para que coincidan con tu base de datos de Django
const CATEGORY_MAP = {
    4: "Académico",
    5: "Cultural",
    6: "Deportivo",
    7: "Social",
    8: "Networking",
    // Agrega más categorías si es necesario
};

// Función para obtener el nombre legible
const getCategoryName = (id) => {
    // Si el backend ya devuelve el nombre (string), lo mostramos. Si es un ID, lo mapeamos.
    if (typeof id === 'string' && id.length > 0) {
        // En caso de que el backend ya haya cambiado a enviar el nombre (ej. 'academic')
        // Puedes hacer un mapeo inverso aquí si quieres capitalizar, o simplemente usarlo
        return id.charAt(0).toUpperCase() + id.slice(1);
    }
    // Mapea el ID numérico
    return CATEGORY_MAP[id] || "General";
};


export default function EventList() {
    const [search, setSearch] = useState("");
    const [events, setEvents] = useState([]);
    // ... (El resto de tus estados se mantiene igual) ...
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const abortRef = useRef(null);
    const toast = useToast(); 
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const cardBg = useColorModeValue("white", "navy.700");
    
    // ... (Las constantes de estilos y API_BASE se mantienen) ...
    const searchIconColor = useColorModeValue("gray.700", "white");
    const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
    const inputText = useColorModeValue("gray.700", "gray.100");

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

    const fetchEvents = async (query) => {
        // ... (Tu lógica de fetchEvents se mantiene igual) ...
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const token = localStorage.getItem("access_token");
        if (!token) {
            setEvents([]);
            setError("No estás autenticado. Inicia sesión para ver tus eventos.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const params = {};
            if (query && query.trim()) params.search = query.trim();
            const res = await axios.get(`${API_BASE}/api/events/`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: abortRef.current.signal,
            });
            setEvents(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (err) {
            if (!axios.isCancel(err)) {
                const msg = err.response?.data?.detail || "Error cargando eventos";
                setError(msg);
                setEvents([]);
                toast({ title: "Error de Carga", description: msg, status: "error", duration: 5000, isClosable: true });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (eventId) => {
        // ... (handleEdit se mantiene igual) ...
        console.log(`Editar evento con ID: ${eventId}`);
        toast({ title: 'Editar', description: `Funcionalidad de edición para el evento ${eventId}.`, status: 'info', duration: 3000, isClosable: true });
    };

    const handleDelete = async (eventId) => {
        // ... (handleDelete se mantiene igual) ...
        if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
        
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            await axios.delete(`${API_BASE}/api/events/${eventId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({ title: 'Evento Eliminado', description: 'El evento fue eliminado correctamente.', status: 'success', duration: 3000, isClosable: true });
            fetchEvents(search);

        } catch (err) {
            const msg = err.response?.data?.detail || "Fallo al eliminar el evento.";
            toast({ title: 'Error de Eliminación', description: msg, status: 'error', duration: 5000, isClosable: true });
        }
    };

    useEffect(() => {
      fetchEvents("");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const id = setTimeout(() => {
        fetchEvents(search);
      }, 400);
      return () => clearTimeout(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);
    
      return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          {/* ... (Encabezado y buscador) ... */}
    
          {loading && <Text color="gray.500" mb="4">Cargando eventos...</Text>}
          {error && !loading && <Text color="red.400" mb="4">{error}</Text>}

          {/* Lista de eventos */}
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
            {events.map((event) => (
              <Card
                key={event.id}
                p="20px"
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
              >
                <Image
                  src={event.cover_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
                  alt={event.title}
                  borderRadius="xl"
                  h="180px"
                  w="100%"
                  objectFit="cover"
                  mb="4"
                />
                
                <Flex justify="space-between" align="center" mb="2">
                    {/* 🎯 CAMBIO CLAVE: Usa getCategoryName para traducir el ID */}
                    <Tag 
                        size="sm" 
                        colorScheme="brand" 
                        fontWeight="bold"
                    >
                        {getCategoryName(event.category)}
                    </Tag>

                    <Flex align="center">
                        <Box as={MdPeople} color="gray.500" mr="1" />
                        <Text color="gray.500" fontSize="sm" fontWeight="bold">
                            {event.capacity || "N/A"} personas
                        </Text>
                    </Flex>
                </Flex>
                
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  {event.title}
                </Text>
                
                <Text color="gray.500" fontSize="sm" mb="1">
                  {event.start_time ? moment(event.start_time).format("D [de] MMMM, YYYY HH:mm") : "Sin fecha"} • {event.location || "Sin ubicación"}
                </Text>
                <Text fontSize="sm" mb="3" color={textColor}>
                  {event.description || "Sin descripción"}
                </Text>
                
                {/* Botones de Acción */}
                <Flex justify="flex-end" gap="10px" mt="3">
                  <Button 
                    colorScheme="blue" 
                    size="sm" 
                    leftIcon={<MdEdit />}
                    onClick={() => handleEdit(event.id)}
                  >
                    Editar
                  </Button>
                  <Button 
                    colorScheme="red" 
                    size="sm" 
                    leftIcon={<MdDelete />}
                    onClick={() => handleDelete(event.id)}
                  >
                    Eliminar
                  </Button>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>

          {!loading && !error && events.length === 0 && (
            <Text color="gray.500" mt="6">No se encontraron eventos.</Text>
          )}
        </Box>
      );
    }