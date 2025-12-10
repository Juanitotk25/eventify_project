import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Box, Heading, useColorModeValue, Text, Spinner, Center } from "@chakra-ui/react";
import axios from "axios";

export default function LandingEventsCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chakra Color Mode - adapts to theme
    const bgColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");
    const textColor = useColorModeValue("gray.800", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
    const errorColor = useColorModeValue("red.500", "red.300");

    // Color palette for different event categories
    const eventColors = [
        { bg: "#4299e1", border: "#3182ce" }, // Blue
        { bg: "#9f7aea", border: "#805ad5" }, // Purple
        { bg: "#ed8936", border: "#dd6b20" }, // Orange
        { bg: "#48bb78", border: "#38a169" }, // Green
        { bg: "#f56565", border: "#e53e3e" }, // Red
        { bg: "#0bc5ea", border: "#00b5d8" }, // Cyan
    ];

    // Get color based on category or use default
    const getEventColor = (categoryName, index) => {
        if (categoryName) {
            // Use category name to determine color consistently
            const hash = categoryName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return eventColors[hash % eventColors.length];
        }
        return eventColors[index % eventColors.length];
    };

    // Fetch events from the API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // API endpoint for events - public access, no authentication required
                const apiUrl = "http://127.0.0.1:8000/api/events/";
                
                // Fetch public events - anyone can view without authentication
                const response = await axios.get(apiUrl, {
                    params: {
                        // Backend automatically filters to public events for unauthenticated users
                    },
                });

                // Get current date to filter upcoming events
                const now = new Date();
                
                // Handle paginated response (results) or direct array
                const eventsData = response.data.results || response.data || [];
                
                // Format events for FullCalendar and filter upcoming events
                const formatted = eventsData
                    .filter((ev) => {
                        // Only show upcoming events (start_time >= now)
                        const startTime = new Date(ev.start_time);
                        return startTime >= now && ev.is_public === true;
                    })
                    .map((ev, index) => {
                        const colors = getEventColor(ev.category_name, index);
                        return {
                            id: ev.id,
                            title: ev.title,
                            start: ev.start_time,
                            end: ev.end_time || null,
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            textColor: "#ffffff",
                            extendedProps: {
                                description: ev.description,
                                location: ev.location,
                                category: ev.category_name,
                                capacity: ev.capacity,
                            },
                        };
                    })
                    .sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort by date

                setEvents(formatted);
            } catch (error) {
                console.error("Error cargando eventos:", error);
                
                // Handle different error types
                if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                    setError("No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.");
                } else if (error.response?.status === 401) {
                    setError("Se requiere autenticación para ver los eventos");
                } else if (error.response?.status === 404) {
                    setError("No se encontró el endpoint de eventos");
                } else if (error.response?.status >= 500) {
                    setError("Error del servidor. Por favor, intente más tarde.");
                } else {
                    setError("Error al cargar los eventos. Por favor, intente más tarde.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <Box
            bg={bgColor}
            backdropFilter="blur(10px)"
            borderRadius="20px"
            p={{ base: 4, md: 6 }}
            w={{ base: "95%", md: "90%", lg: "85%", xl: "80%" }}
            maxW="1200px"
            mx="auto"
            shadow="2xl"
            border="1px solid"
            borderColor={borderColor}
        >
            <Heading
                size={{ base: "md", md: "lg" }}
                mb={4}
                bgGradient="linear(to-r, blue.400, purple.400)"
                bgClip="text"
                textAlign="center"
                fontWeight="extrabold"
            >
                Próximos Eventos
            </Heading>

            {/* Loading State */}
            {loading && (
                <Center py={8}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {/* Error State */}
            {error && !loading && (
                <Center py={8}>
                    <Text color={errorColor} textAlign="center" fontSize="sm">
                        {error}
                    </Text>
                </Center>
            )}

            {/* Empty State */}
            {!loading && !error && events.length === 0 && (
                <Center py={8}>
                    <Text color={textColor} textAlign="center" fontSize="sm" opacity={0.7}>
                        No hay eventos próximos disponibles
                    </Text>
                </Center>
            )}

            {/* Calendar - Only show if not loading and no error */}
            {!loading && !error && (
                <Box
                    sx={{
                        "& .fc": {
                            fontFamily: "inherit",
                            backgroundColor: "#f7fafc",
                            padding: "10px",
                            borderRadius: "16px",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                        },
                        "& .fc-daygrid-day.fc-day-today": {
                            backgroundColor: "rgba(66, 153, 225, 0.2)", // azul suave
                            border: "1px solid",
                            borderColor: "transparent",
                        },
                        "& .fc-daygrid-day:hover": {
                            backgroundColor: "rgba(62, 10, 88, 0.03)",
                            transition: "0.15s",
                            cursor: "pointer",
                        },
                        "& .fc-daygrid-day-frame": {
                            minHeight: "80px",
                        },
                        "& .fc-daygrid-event": {
                            borderRadius: "6px",
                            padding: "2px 6px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        },
                        "& .fc-daygrid-event:hover": {
                            opacity: 0.9,
                            transform: "scale(1.02)",
                            transition: "all 0.2s",
                        },
                        "& .fc-daygrid-day-number": {
                            color: textColor,
                            padding: "8px",
                            fontWeight: "500",
                        },
                        "& .fc-col-header-cell": {
                            backgroundColor: "transparent",
                            borderColor: borderColor,
                            padding: "12px 8px",
                        },
                        "& .fc-col-header-cell-cushion": {
                            color: textColor,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            fontSize: "0.9rem",
                        },
                        "& .fc-daygrid-day-top": {
                            flexDirection: "row",
                        },
                        "& .fc-scrollgrid": {
                            borderColor: borderColor,
                        },
                        "& .fc-scrollgrid-section > table": {
                            borderColor: borderColor,
                        },
                        "& .fc-toolbar-title": {
                            color: textColor,
                            fontWeight: "700",
                            fontSize: "1.4rem",
                        },
                    }}
                >
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        height="auto"
                        events={events}
                        headerToolbar={{
                            left: "prev",
                            center: "title",
                            right: "next"
                        }}
                        dayMaxEvents={2}
                        fixedWeekCount={false}
                        locale="es"
                        firstDay={1}
                        contentHeight="auto"
                        aspectRatio={1.5}
                        eventDisplay="block"
                        eventTimeFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            meridiem: false,
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
