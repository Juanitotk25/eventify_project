import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Box,
    Text,
    Flex,
    Avatar,
    Badge,
    useColorModeValue,
    Spinner,
    Center,
    useToast,
} from "@chakra-ui/react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function AttendeeList({ isOpen, onClose, eventId, onUserJoined}) {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const bgColor = useColorModeValue("white", "navy.800");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const toast = useToast();

    useEffect(() => {
        if (isOpen && eventId) {
            fetchAttendees();
        }
    }, [isOpen, eventId]);

    const fetchAttendees = async () => {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para ver la lista de asistentes",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE}/api/events/${eventId}/registrations/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Attendees data received:", response.data); // Debug log
            setAttendees(response.data || []);
        } catch (error) {
            console.error("Error fetching attendees:", error);
            toast({
                title: "Error",
                description: "No se pudo cargar la lista de asistentes",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            registered: "blue",
            confirmed: "green",
            attended: "purple",
            cancelled: "red",
            waitlisted: "orange",
        };
        return statusColors[status] || "gray";
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            registered: "Registrado",
            confirmed: "Confirmado",
            attended: "Asistió",
            cancelled: "Cancelado",
            waitlisted: "Lista de espera",
        };
        return statusLabels[status] || status;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
            <ModalOverlay />
            <ModalContent borderRadius="2xl" bg={bgColor}>
                <ModalHeader color={textColor}>Lista de Asistentes</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {loading ? (
                        <Center py={8}>
                            <Spinner size="xl" color="brand.500" />
                        </Center>
                    ) : attendees.length === 0 ? (
                        <Center py={8}>
                            <Text color={textColor} opacity={0.7}>
                                Aún no hay asistentes registrados
                            </Text>
                        </Center>
                    ) : (
                        <Box>
                            <Text mb={4} color={textColor} fontWeight="bold">
                                Total: {attendees.length} asistente(s)
                            </Text>
                            <Flex direction="column" gap={3}>
                                {attendees.map((attendee) => {
                                    // Debug: log each attendee to see the structure
                                    console.log("Attendee object:", attendee);
                                    const username = attendee.user_username || "Usuario";
                                    return (
                                        <Flex
                                            key={attendee.id}
                                            align="center"
                                            gap={4}
                                            p={4}
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor={borderColor}
                                            _hover={{ bg: hoverBg }}
                                        >
                                            <Avatar
                                                name={username}
                                                size="md"
                                            />
                                            <Flex direction="column" flex={1}>
                                                <Text fontWeight="bold" color={textColor}>
                                                    {username}
                                                </Text>
                                                {username !== "Usuario" && (
                                                    <Text fontSize="sm" color="gray.500">
                                                        @{username}
                                                    </Text>
                                                )}
                                            </Flex>
                                            {attendee.status && (
                                                <Badge
                                                    colorScheme={getStatusColor(attendee.status)}
                                                    fontSize="sm"
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                >
                                                    {getStatusLabel(attendee.status)}
                                                </Badge>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </Flex>
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

