import {
    Card, Image, Flex, Text, Tag, Box,
    useDisclosure, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, useColorModeValue, useToast, IconButton, Badge
} from "@chakra-ui/react";
import { MdPeople, MdList, MdCheckCircle, MdCancel } from "react-icons/md"; // Añadido MdCancel
import { FaCommentDots } from "react-icons/fa";
import moment from "moment";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AttendeeList from "./AttendeeList";
import ReviewModal from "./ReviewModal";
import { eventAPI } from "services/api";


export default function EventCardRating({ event, registrationId, status: propStatus, onAttendanceConfirmed, onCancelRegistration }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isAttendeeListOpen,
        onOpen: onAttendeeListOpen,
        onClose: onAttendeeListClose
    } = useDisclosure();
    const {
        isOpen: isReviewOpen,
        onOpen: onReviewOpen,
        onClose: onReviewClose
    } = useDisclosure();

    // TODOS LOS HOOKS AL INICIO
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const titleColor = useColorModeValue("navy.900", "purple.200");
    const accentColor = useColorModeValue("secondaryGray.500", "purple.200");
    const cardBg = useColorModeValue("white", "navy.700");
    const tagColorScheme = useColorModeValue("brand", "gray");

    const toast = useToast();

    const [isJoining, setIsJoining] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState(propStatus || 'registered');

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
    const rating_avg = event.average_rating || 0;

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

    // Actualizar estado de asistencia cuando cambia la prop
    useEffect(() => {
        setAttendanceStatus(propStatus || 'registered');
    }, [propStatus]);

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
            await eventAPI.joinEvent(event.id);

            toast({
                title: "¡Inscripción exitosa!",
                description: "Te has inscrito al evento correctamente.",
                status: "success",
                duration: 3000,
                isClosable: true
            });

            setIsRegistered(true);
            window.dispatchEvent(new CustomEvent('event-joined', {
                detail: { eventId: event.id, eventTitle: event.title }
            }));
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

    const handleConfirmAttendance = async () => {
        if (!registrationId) {
            toast({
                title: "Error",
                description: "No se encontró el registro para este evento.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsConfirmingAttendance(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post(
                `${API_BASE}/api/registrations/${registrationId}/confirm_attendance/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast({
                title: "¡Asistencia confirmada!",
                description: response.data.message || "Tu asistencia ha sido registrada.",
                status: "success",
                duration: 3000,
                isClosable: true
            });

            // Actualizar estado local
            setAttendanceStatus('attended');

            // Notificar al componente padre
            if (onAttendanceConfirmed) {
                onAttendanceConfirmed(event.id);
            }

        } catch (error) {
            console.error('Error al confirmar asistencia:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "No se pudo confirmar la asistencia",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsConfirmingAttendance(false);
        }
    };

    const handleCancelRegistration = async () => {
        if (!registrationId) {
            toast({
                title: "Error",
                description: "No se encontró el registro para cancelar.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsCancelling(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.delete(
                `${API_BASE}/api/users/cancel-registration/${registrationId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            toast({
                title: "Inscripción cancelada",
                description: response.data.detail || "Tu inscripción ha sido cancelada exitosamente.",
                status: "success",
                duration: 3000,
                isClosable: true
            });

            // Cerrar modal si está abierto
            if (isOpen) onClose();

            window.dispatchEvent(new CustomEvent('event-joined'));

            // Notificar al componente padre para que elimine esta tarjeta
            if (onCancelRegistration) {
                onCancelRegistration(event.id);
            }

        } catch (error) {
            console.error('Error al cancelar inscripción:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "No se pudo cancelar la inscripción",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsCancelling(false);
            setShowCancelConfirm(false);
        }
    };

    const handleSubmitReview = async ({ rating, comment }) => {
        if (!rating) {
            toast({
                title: "Oops",
                description: "Debes seleccionar una calificación.",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsSubmittingReview(true);

        try {
            await axios.patch(
                `${API_BASE}/api/registrations/${registrationId}/rate/`,
                { rating, comment },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            toast({
                title: "¡Gracias por tu reseña!",
                description: "Tu opinión ha sido registrada.",
                status: "success",
                duration: 3000,
                isClosable: true
            });

            onReviewClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo enviar la reseña.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Determinar color y texto del badge de asistencia
    const getAttendanceBadgeProps = () => {
        const status = attendanceStatus.toLowerCase();

        switch (status) {
            case 'attended':
                return { colorScheme: 'green', text: 'Asistencia Confirmada' };
            case 'confirmed':
                return { colorScheme: 'blue', text: 'Inscripción Confirmada' };
            case 'cancelled':
                return { colorScheme: 'red', text: 'Cancelado' };
            case 'waitlisted':
                return { colorScheme: 'yellow', text: 'En Lista de Espera' };
            case 'registered':
            default:
                return { colorScheme: 'blue', text: 'Inscrito' };
        }
    };

    const badgeProps = getAttendanceBadgeProps();
    const isAttendanceConfirmed = attendanceStatus.toLowerCase() === 'attended';

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

                {/* Badge de estado de asistencia */}
                {registrationId && (
                    <Flex justify="space-between" align="center" mb="2">
                        <Badge
                            colorScheme={badgeProps.colorScheme}
                            fontSize="xs"
                            borderRadius="full"
                            px="10px"
                            py="2px"
                        >
                            {badgeProps.text}
                        </Badge>

                        <Tag
                            size="sm"
                            colorScheme={tagColorScheme}
                            fontWeight="bold"
                        >
                            {event.category_name || "General"}
                        </Tag>
                    </Flex>
                )}

                <Text fontSize="xl" fontWeight="700" textColor={titleColor}>
                    {event.title}
                </Text>

                <Text color={accentColor} fontSize="sm" mb="1">
                    {event.start_time
                        ? moment(event.start_time).format("D [de] MMMM, YYYY HH:mm")
                        : "Sin fecha"
                    } • {event.location || "Sin ubicación"}
                </Text>

                <Text fontSize="sm" mb="3" noOfLines={2}>
                    {event.description || "Sin descripción"}
                </Text>

                {/* Información de capacidad */}
                <Flex justify="space-between" align="center" mb="3">
                    <Flex align="center">
                        <Box as={MdPeople} color={accentColor} mr="1" />
                        <Text color={accentColor} fontSize="sm" fontWeight="bold">
                            {event.capacity || "N/A"} personas
                        </Text>
                    </Flex>
                </Flex>

                {/* Botón de confirmar asistencia (solo si está registrado y no ha confirmado) */}
                {registrationId && !isAttendanceConfirmed && (
                    <Button
                        leftIcon={<MdCheckCircle />}
                        colorScheme="green"
                        variant="solid"
                        width="100%"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmAttendance();
                        }}
                        isLoading={isConfirmingAttendance}
                        loadingText="Confirmando..."
                        mb="2"
                    >
                        Confirmar Asistencia
                    </Button>
                )}

                {/* Botón de cancelar inscripción */}
                {registrationId && (
                    <Button
                        leftIcon={<MdCancel />}
                        colorScheme="red"
                        variant="outline"
                        width="100%"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCancelConfirm(true);
                        }}
                        isLoading={isCancelling}
                        loadingText="Cancelando..."
                        mb="3"
                    >
                        Cancelar Inscripción
                    </Button>
                )}

                {/* Si ya confirmó asistencia, mostrar mensaje */}
                {registrationId && isAttendanceConfirmed && (
                    <Flex align="center" justify="center" mb="3" p="2" bg="green.50" borderRadius="md">
                        <MdCheckCircle color="green" />
                        <Text ml="2" fontSize="sm" color="green.600" fontWeight="medium">
                            ¡Ya confirmaste tu asistencia!
                        </Text>
                    </Flex>
                )}

                {/* Rating y botón de reseña */}
                <Flex direction="row" width="full" gap={10} mt="auto">
                    <Flex align="center" mt="auto" mb={2}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Box
                                key={star}
                                cursor="pointer"
                                fontSize="2xl"
                                color={(rating_avg) >= star ? "yellow.400" : "gray.400"}
                            >
                                ★
                            </Box>
                        ))}
                    </Flex>
                    <IconButton
                        ml="auto"
                        mt="auto"
                        aria-label="Review event"
                        icon={<FaCommentDots />}
                        colorScheme="purple"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReviewOpen();
                        }}
                    />
                </Flex>
            </Card>

            {/* Modal del evento */}
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

                        {/* Estado de asistencia en el modal */}
                        {registrationId && (
                            <Flex justify="center" mb="4">
                                <Badge
                                    colorScheme={badgeProps.colorScheme}
                                    fontSize="md"
                                    borderRadius="full"
                                    px="20px"
                                    py="5px"
                                >
                                    {badgeProps.text}
                                </Badge>
                            </Flex>
                        )}

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
                            direction="column"
                            gap={3}
                            justifyContent="flex-end"
                            w="100%"
                        >
                            {/* Botón de confirmar asistencia en el modal */}
                            {registrationId && !isAttendanceConfirmed && (
                                <Button
                                    leftIcon={<MdCheckCircle />}
                                    colorScheme="green"
                                    onClick={handleConfirmAttendance}
                                    isLoading={isConfirmingAttendance}
                                    loadingText="Confirmando..."
                                    width="100%"
                                    size="lg"
                                >
                                    Confirmar Mi Asistencia
                                </Button>
                            )}

                            <Flex direction="row" gap={3} w="100%">
                                <Button
                                    colorScheme="teal"
                                    onClick={handleJoin}
                                    isLoading={isJoining}
                                    loadingText="Inscribiendo..."
                                    fontSize="md"
                                    isDisabled={isRegistered || registrationId}
                                    flex="1"
                                >
                                    {isRegistered || registrationId ? "Ya estás inscrito" : "Unirme"}
                                    <Box as={MdPeople} ml={2} />
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={onAttendeeListOpen}
                                    isDisabled={!isRegistered && !isCheckingRegistration && !registrationId}
                                    fontSize="md"
                                    flex="1"
                                >
                                    Ver Asistentes
                                    <Box as={MdList} ml={2} />
                                </Button>
                            </Flex>

                            {/* Botón de cancelar inscripción en el modal */}
                            {registrationId && (
                                <Button
                                    leftIcon={<MdCancel />}
                                    colorScheme="red"
                                    variant="outline"
                                    width="100%"
                                    size="md"
                                    onClick={() => setShowCancelConfirm(true)}
                                    mt={3}
                                >
                                    Cancelar Inscripción
                                </Button>
                            )}
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal de confirmación para cancelar inscripción */}
            <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} size="sm">
                <ModalOverlay />
                <ModalContent borderRadius="2xl">
                    <ModalHeader>Confirmar Cancelación</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            ¿Estás seguro de que deseas cancelar tu inscripción a <strong>{event.title}</strong>?
                        </Text>
                        {attendanceStatus === 'attended' && (
                            <Text mt={2} color="orange.500" fontSize="sm">
                                ⚠️ Ya has confirmado asistencia a este evento.
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowCancelConfirm(false)}
                            mr={3}
                        >
                            Volver
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleCancelRegistration}
                            isLoading={isCancelling}
                            loadingText="Cancelando..."
                        >
                            Sí, Cancelar Inscripción
                        </Button>
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
                    window.dispatchEvent(new CustomEvent('event-joined'));
                }}
            />

            {/*Review Modal*/}
            <ReviewModal
                isOpen={isReviewOpen}
                onClose={onReviewClose}
                onSubmit={handleSubmitReview}
                event={event}
            />
        </>
    );
}