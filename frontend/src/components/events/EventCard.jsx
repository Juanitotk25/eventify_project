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
    const titleColor = useColorModeValue("navy.900", "white");
    const accentColor = useColorModeValue("secondaryGray.500", "purple.200")
    const cardBg = useColorModeValue("white", "navy.700");
    const toast = useToast();
    const [isJoining, setIsJoining] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);

                    <Tag
                        size="sm"
                        colorScheme={useColorModeValue("brand", "gray")}
                        fontWeight="bold"
                    >
                        {event.category_name || "General"}
                    </Tag>

                    <Flex align="center">
                        <Box as={MdPeople} color={accentColor} mr="1" />
                        <Text color={accentColor} fontSize="sm" fontWeight="bold">
                            {event.capacity || "N/A"} personas
                        </Text>
                    </Flex>
                </Flex >

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
                <Flex align="center" mt="auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                            key={star}
                            cursor="pointer"
                            fontSize="2xl"
                            color={(event.average_rating) >= star ? "yellow.400" : "gray.400"}
                        >
                            ★
                        </Box>
                    ))}
                </Flex>
            </Card >

        {/* Modal on click */ }
        < Modal isOpen = { isOpen } onClose = { onClose } size = "lg" motionPreset = "slideInBottom" >
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
            </Modal >

        {/* Attendee List Modal */ }
        < AttendeeList
    isOpen = { isAttendeeListOpen }
    onClose = { onAttendeeListClose }
    eventId = { event.id }
    onUserJoined = {() => {
        setIsRegistered(true);
        // También notificar cuando se une desde AttendeeList
        window.dispatchEvent(new CustomEvent('event-joined'));
    }
}
            />
        </>
    );
}