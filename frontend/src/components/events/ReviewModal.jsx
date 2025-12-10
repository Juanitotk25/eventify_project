import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Flex,
    Icon,
    Button,
    Textarea,
    NumberInput,
    NumberInputField,
    FormControl,
    FormLabel,
    useToast,
} from "@chakra-ui/react";

import { useState } from "react";
import {FaStar} from "react-icons/fa";

const ReviewModal = ({ isOpen, onClose, onSubmit, event }) => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(null);
    const toast = useToast();

    const handleSubmit = () => {
        if (!comment.trim()) {
            toast({
                title: "Por favor escribe un comentario.",
                status: "warning",
                duration: 2500,
                isClosable: true,
            });
            return;
        }

        onSubmit({ comment, rating });

        // Clear after submit
        setComment("");
        setRating(5);
        onClose();
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Escribe tu opinión de {event?.title}
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>
                    <FormControl mb={4}>
                        <FormLabel>Comentario</FormLabel>
                        <Textarea
                            placeholder="Cuéntanos tu experiencia…"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            resize="vertical"
                        />
                    </FormControl>

                    <FormControl mb={5}>
                        <FormLabel>Calificación</FormLabel>
                        <Flex gap={2}>
                            {stars.map((star) => {
                                const isActive = star <= (hovered || rating);
                                return (
                                    <Icon
                                        as={FaStar}
                                        key={star}
                                        boxSize={8}
                                        cursor="pointer"
                                        onMouseEnter={() => setHovered(star)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => setRating(star)}
                                        transition="0.2s"
                                        color={isActive ? "yellow.400" : "gray.300"}
                                    />
                                );
                            })}
                        </Flex>
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit}>
                        Enviar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReviewModal;
