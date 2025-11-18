import React, { useEffect, useRef, useState } from "react";

// Chakra imports
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Text,
    IconButton,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";


// Custom components
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";

import EventCard from "components/events/EventCard";
import EventFormModal from "components/events/EventFormModal"; // ¡Asegúrate de que esta ruta sea correcta!


// MAPEO DE CATEGORÍAS
const CATEGORY_MAP = {
    4: "Académico",
    5: "Cultural",
    6: "Deportivo",
    7: "Social",
    8: "Networking",
};

const getCategoryName = (id) => {
    if (typeof id === 'string' && id.length > 0) {
        return id.charAt(0).toUpperCase() + id.slice(1);
    }
    return CATEGORY_MAP[id] || "General";
};


export default function EventList() {
    const [search, setSearch] = useState("");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ESTADOS NUEVOS PARA EL MODAL DE EDICIÓN
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    // FIN DE ESTADOS NUEVOS

    const abortRef = useRef(null);
    const toast = useToast();

    const searchIconColor = useColorModeValue("gray.700", "white");
    const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
    const inputText = useColorModeValue("gray.700", "gray.100");

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

    const fetchEvents = async (query) => {
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

    // NUEVA FUNCIÓN: Abre el modal y guarda el objeto del evento
    // const handleOpenEdit = (eventObject) => {
    //     setSelectedEvent(eventObject); // Guarda el objeto completo
    //     setIsModalOpen(true);          // Abre el modal
    // };

    // NUEVA FUNCIÓN: Cierra el modal y limpia el estado de edición
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    // Ya que el botón estaba llamando a `handleEdit`, la reescribimos para usar el modal:
    // const handleEdit = (eventObject) => {
    //      handleOpenEdit(eventObject);
    // };
    // // NOTA: Para evitar confusión, lo ideal es cambiar el nombre en el botón a handleOpenEdit, pero lo mantengo así para que la refencia del botón de abajo funcione sin cambiar el nombre de la variable.
    //
    // const handleDelete = async (eventId) => {
    //     if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
    //
    //     const token = localStorage.getItem("access_token");
    //     if (!token) return;
    //
    //     try {
    //         await axios.delete(`${API_BASE}/api/events/${eventId}/`, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //
    //         toast({ title: 'Evento Eliminado', description: 'El evento fue eliminado correctamente.', status: 'success', duration: 3000, isClosable: true });
    //         fetchEvents(search);
    //
    //     } catch (err) {
    //         const msg = err.response?.data?.detail || "Fallo al eliminar el evento.";
    //         toast({ title: 'Error de Eliminación', description: msg, status: 'error', duration: 5000, isClosable: true });
    //     }
    // };

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

            <InputGroup mb="20px" borderRadius="15px" w={{ base: "100%", md: "300px" }}>
                <InputLeftElement
                    children={
                        <IconButton
                            bg="inherit"
                            borderRadius="inherit"
                            _hover="none"
                            _active={{ bg: "inherit" }}
                            _focus={{ bg: "inherit" }}
                            icon={<SearchIcon color={searchIconColor} w="15px" h="15px" />}
                            onClick={() => fetchEvents(search)}
                        />
                    }
                />
                <Input
                    type="text"
                    placeholder="Busca un evento..."
                    bg={inputBg}
                    color={inputText}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="search"
                    h="44px"
                    borderRadius="inherit"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            fetchEvents(search);
                        }
                    }}
                />
            </InputGroup>
    
            {loading && <Text color="gray.500" mb="4">Cargando eventos...</Text>}
            {error && !loading && <Text color="red.400" mb="4">{error}</Text>}

            {/* Lista de eventos */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </SimpleGrid>

            {!loading && !error && events.length === 0 && (
                <Text color="gray.500" mt="6">No se encontraron eventos.</Text>
            )}

            {/* AÑADIR EL MODAL AQUÍ */}
            <EventFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                currentEvent={selectedEvent} // Pasa el objeto seleccionado
                fetchEvents={() => fetchEvents(search)} // Pasa la función para recargar la lista
            />

        </Box>
    );
}