// src/components/events/EventFormModal.jsx

import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box
} from '@chakra-ui/react';

// Import the EventForm component
import EventForm from './EventForm'; 

// Recibe las props del componente EventList
export default function EventFormModal({ isOpen, onClose, currentEvent, fetchEvents }) {

    // Determina el título del modal basado en si hay un evento actual (edición)
    const modalTitle = currentEvent ? "Editar Evento" : "Crear Nuevo Evento";

    // Función que se ejecuta al terminar el POST/PUT en el formulario.
    const handleSuccess = () => {
        // 1. Recargar la lista de eventos en EventList
        if (fetchEvents) {
            fetchEvents(); 
        }
        // 2. Cerrar el modal
        onClose(); 
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="3xl" // Ajusta el tamaño para que el formulario se vea bien
            scrollBehavior="inside"
        >
            <ModalOverlay />
            <ModalContent>
                
                {/* 1. Título del Modal */}
                <ModalHeader>{modalTitle}</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    {/* 2. Renderizar el Formulario dentro del Modal Body */}
                    {/* El formulario debe recibir las props clave */}
                    <Box pt="0"> {/* Ajusta el padding que viene de EventForm */}
                        <EventForm
                            initialEvent={currentEvent} // **CLAVE:** Pasa el objeto del evento. Si es null, es Creación.
                            onSuccess={handleSuccess}   // **CLAVE:** Llama a recarga y cierre
                            onCancel={onClose}          // Cierra el modal si se pulsa Cancelar
                            isModal={true}              // Indica que está dentro de un modal
                        />
                    </Box>
                </ModalBody>
                
                {/* Nota: ModalFooter puede ser opcional si los botones están dentro del Card del Form */}
                
            </ModalContent>
        </Modal>
    );
}