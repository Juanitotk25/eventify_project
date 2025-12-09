import {
    Card, Image, Flex, Text, Tag, Box,
    useDisclosure, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter, 
    Button, useColorModeValue, useToast
} from "@chakra-ui/react";
import { MdPeople, MdList } from "react-icons/md";
import moment from "moment";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AttendeeList from "./AttendeeList";
import { eventAPI } from "services/api"; // Importar el servicio API

export default function EventCard({ event }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { 
        isOpen: isAttendeeListOpen, 
        onOpen: onAttendeeListOpen, 
        onClose: onAttendeeListClose 
    } = useDisclosure();
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const titleColor = useColorModeValue("navy.900", "purple.200");
    const accentColor = useColorModeValue("secondaryGray.500", "purple.200")
    const cardBg = useColorModeValue("white", "navy.700");
    const toast = useToast();
    const [isJoining, setIsJoining] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);

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

    // Check if user is registered when modal opens
    useEffect(() => {
        if (isOpen) {
            checkRegistrationStatus();
        }
    }, [isOpen, event.id]);

    const checkRegistrationStatus = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setIsRegistered(false);
            return;
        }

        setIsCheckingRegistration(true);
        try {
            // Usar el servicio API en lugar de axios directamente
            const response = await eventAPI.checkRegistration(event.id);
            setIsRegistered(response.is_registered || false);
        } catch (error) {
            console.error("Error checking registration:", error);
            setIsRegistered(false);
        } finally {
            setIsCheckingRegistration(false);
        }
    };

    const handleJoin = async () => {
        setIsJoining(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
            toast({ 
                title: "Error", 
                description: "Debes iniciar sesión para inscribirte.", 
                status: "error", 
                duration: 3000, 
                isClosable: true 
            });
            setIsJoining(false);
            return;
        }

        try {
            // Usar el servicio API en lugar de axios directamente
            await eventAPI.joinEvent(event.id);
            
            toast({ 
                title: "¡Inscripción exitosa!", 
                description: "Te has inscrito al evento correctamente.", 
                status: "success", 
                duration: 3000, 
                isClosable: true 
            });
            
            setIsRegistered(true); // Update registration status
            
            // ¡IMPORTANTE: NOTIFICAR A HEADERLINKS QUE SE ACTUALICE!
            window.dispatchEvent(new CustomEvent('event-joined', { 
                detail: { eventId: event.id, eventTitle: event.title }
            }));
            
            // También podrías actualizar localmente otros componentes
            // Por ejemplo, si tienes una lista de "mis eventos"
            window.dispatchEvent(new Event('registration-updated'));
            
        } catch (error) {
            const msg = error.response?.data?.detail || "Error al inscribirse al evento.";
            toast({ 
                title: "Error", 
                description: msg, 
                status: "error", 
                duration: 3000, 
                isClosable: true 
            });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <>
            {/* Card clickable */}
            <Card
                key={event.id}
                p="20px"
                bg={cardBg}
                borderRadius="2xl"
                textColor={textColor}
                boxShadow="md"
                cursor="pointer"
                onClick={onOpen}
                _hover={{ transform: "scale(1.02)", transition: "0.15s" }}
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
                    <Tag
                        size="sm"
                        colorScheme={useColorModeValue("brand", "gray")}
                        fontWeight="bold"
                    >
                        {getCategoryName(event.category)}
                    </Tag>

                    <Flex align="center">
                        <Box as={MdPeople} color={accentColor} mr="1" />
                        <Text color={accentColor} fontSize="sm" fontWeight="bold">
                            {event.capacity || "N/A"} personas
                        </Text>
                    </Flex>
                </Flex>

                <Text fontSize="xl" fontWeight="700" textColor={titleColor}>
                    {event.title}
                </Text>

                <Text color={accentColor} fontSize="sm" mb="1">
                    {event.start_time
                        ? moment(event.start_time).format("D [de] MMMM, YYYY HH:mm")
                        : "Sin fecha"
                    } • {event.location || "Sin ubicación"}
                </Text>

                <Text fontSize="sm" mb="3">
                    {event.description || "Sin descripción"}
                </Text>
            </Card>

            {/* Modal on click */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
                <ModalOverlay />
                <ModalContent borderRadius="2xl" p="2">
                    <ModalHeader fontWeight="bold">{event.title}</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Image
                            src={event.cover_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
                            alt={event.title}
                            borderRadius="lg"
                            w="100%"
                            h="200px"
                            objectFit="cover"
                            mb="4"
                        />
                        <Flex
                            textColor={textColor}
                            fontSize="lg"
                            direction="column"
                        >
                            <Text mb="2">
                                <strong>Fecha:</strong>{" "}
                                {event.start_time
                                    ? moment(event.start_time).format("D [de] MMMM, YYYY HH:mm")
                                    : "Sin fecha"}
                            </Text>

                            <Text mb="2">
                                <strong>Lugar:</strong> {event.location || "Sin ubicación"}
                            </Text>

                            <Text mb="2" >
                                <strong>Capacidad:</strong> {event.capacity} personas
                            </Text>

                            <Text fontSize="xl" mt="4">
                                {event.description}
                            </Text>
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Flex
                            direction="row"
                            gap={3}
                            justifyContent="flex-end"
                            w="100%"
                        >
                            <Button
                                colorScheme="green"
                                onClick={handleJoin}
                                isLoading={isJoining}
                                loadingText="Inscribiendo..."
                                fontSize="md"
                                isDisabled={isRegistered}
                            >
                                {isRegistered ? "Ya estás inscrito" : "Unirme"}
                                <Box as={MdPeople} ml={2} />
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={onAttendeeListOpen}
                                isDisabled={!isRegistered && !isCheckingRegistration}
                                fontSize="md"
                            >
                                Ver Asistentes
                                <Box as={MdList} ml={2} />
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Attendee List Modal */}
            <AttendeeList
                isOpen={isAttendeeListOpen}
                onClose={onAttendeeListClose}
                eventId={event.id}
                onUserJoined={() => {
                    setIsRegistered(true);
                    // También notificar cuando se une desde AttendeeList
                    window.dispatchEvent(new CustomEvent('event-joined'));
                }}
            />
        </>
    );
}