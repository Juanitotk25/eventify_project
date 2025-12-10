import React, { useEffect, useRef, useState } from "react";
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
    Select,
    Flex,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";

import EventCardRating from "components/events/EventCardRating";

export default function JoinedEvents() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const abortRef = useRef(null);
    const toast = useToast();

    const searchIconColor = useColorModeValue("gray.700", "white");
    const inputBg = useColorModeValue("white", "navy.900");
    const inputText = useColorModeValue("gray.700", "gray.100");

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

    // FUNCIÓN PRINCIPAL PARA CARGAR EVENTOS
    const fetchEvents = async (filters = {}) => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const token = localStorage.getItem("access_token");
        if (!token) {
            setEvents([]);
            setError("No estás autenticado. Inicia sesión para ver eventos.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value != null) {
                    params.append(key, value);
                }
            });

            const res = await axios.get(`${API_BASE}/api/registrations/my_events/`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
                signal: abortRef.current.signal,
            });

            setEvents(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (err) {
            if (!axios.isCancel(err)) {
                const msg = err.response?.data?.detail || "Error cargando eventos";
                setError(msg);
                setEvents([]);
                toast({
                    title: "Error de Carga",
                    description: msg,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Cargar eventos al abrir la página
    useEffect(() => {
        fetchEvents({});
    }, []);

    // Cargar eventos cuando cambien los filtros
    useEffect(() => {
        fetchEvents({
            search,
            category,
            start_date: dateStart,
            end_date: dateEnd,
            location,
        });
    }, [search, category, dateStart, dateEnd, location]);

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            
            {/* BUSCADOR */}
            <InputGroup mb="20px" borderRadius="15px" w={{ base: "100%", md: "300px" }}>
                <InputLeftElement
                    children={
                        <IconButton
                            bg="inherit"
                            borderRadius="inherit"
                            _hover="none"
                            _active={{ bg: "inherit" }}
                            icon={<SearchIcon color={searchIconColor} w="15px" h="15px" />}
                            onClick={() =>
                                fetchEvents({
                                    search,
                                    category,
                                    start_date: dateStart,
                                    end_date: dateEnd,
                                    location,
                                })
                            }
                            aria-label="Buscar"
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
                />
            </InputGroup>

            {/* FILTROS */}
            <Flex direction="row" gap={2} py="2vh">
                <Select
                    bg={inputBg}
                    placeholder="Categoría"
                    w={{ base: "100%", md: "200px" }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Académico">Académico</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Deportivo">Deportivo</option>
                    <option value="Social">Social</option>
                    <option value="Networking">Networking</option>
                </Select>

                <Input
                    bg={inputBg}
                    type="date"
                    placeholder="Fecha de Inicio"
                    w={{ base: "100%", md: "200px" }}
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                />

                <Input
                    bg={inputBg}
                    type="date"
                    placeholder="Fecha Final"
                    w={{ base: "100%", md: "200px" }}
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                />

                <Input
                    bg={inputBg}
                    placeholder="Ubicación"
                    w={{ base: "100%", md: "200px" }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </Flex>

            {/* LISTA DE EVENTOS */}
            {loading && <Text color="gray.500">Cargando eventos...</Text>}
            {error && !loading && <Text color="red.400">{error}</Text>}

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
                {events.map((ev) => (
                    <EventCardRating key={ev.id} event={ev} registrationId={ev.registration_id}/>
                ))}
            </SimpleGrid>

            {!loading && !error && events.length === 0 && (
                <Text color="gray.500" mt="6">No se encontraron eventos.</Text>
            )}

        </Box>
    );
}
