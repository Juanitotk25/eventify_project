import { NavLink, useNavigate } from "react-router-dom";
// Chakra Imports
import {
  Avatar,
  Badge,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  Box,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
// Custom Components
import { ItemContent } from 'components/menu/ItemContent';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import { useAuthStore } from 'stores/useAuthStore';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import { 
  MdNotificationsNone, 
  MdEvent, 
  MdLocationOn, 
  MdCalendarToday,
  MdCancel,
  MdDeleteOutline
} from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from 'routes';
import { userAPI } from 'services/api';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Estados para notificaciones
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [cancellingRegistration, setCancellingRegistration] = useState(null);
  
  // Estados para el diálogo de confirmación
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const cancelRef = useRef();
  
  const toast = useToast();
  
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const ethColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const ethBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Función para obtener las notificaciones (eventos inscritos)
  const fetchNotifications = async () => {
    // Solo si el usuario está autenticado
    if (!user) {
      setEventCount(0);
      setEvents([]);
      return;
    }
    
    try {
      setLoadingNotifications(true);
      const data = await userAPI.getMyNotifications();
      const count = data.event_count || 0;
      const eventsData = data.events || [];
      
      setEventCount(count);
      setEvents(eventsData);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setEventCount(0);
      setEvents([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Cargar las notificaciones al montar el componente y cuando cambia el usuario
  useEffect(() => {
    fetchNotifications();
    
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Escuchar eventos de inscripción para actualizar en tiempo real
  useEffect(() => {
    const handleEventRegistration = () => {
      fetchNotifications();
    };

    window.addEventListener('event-joined', handleEventRegistration);
    window.addEventListener('event-left', handleEventRegistration);
    
    return () => {
      window.removeEventListener('event-joined', handleEventRegistration);
      window.removeEventListener('event-left', handleEventRegistration);
    };
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    return moment(dateString).format('D [de] MMMM, YYYY HH:mm');
  };

  // Función para navegar a un evento
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Función para abrir el diálogo de cancelación
  const openCancelDialog = (event, e) => {
    e.stopPropagation(); // Evitar que se active el clic en el evento
    setEventToCancel(event);
    setIsCancelDialogOpen(true);
  };

  // Función para cerrar el diálogo de cancelación
  const closeCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setEventToCancel(null);
  };

  // Función para cancelar la inscripción
  const handleCancelRegistration = async () => {
    if (!eventToCancel) return;
    
    try {
      setCancellingRegistration(eventToCancel.registration_id);
      
      const result = await userAPI.cancelRegistration(eventToCancel.registration_id);
      
      // Mostrar mensaje de éxito
      toast({
        title: "Inscripción cancelada",
        description: result.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Actualizar la lista de notificaciones
      fetchNotifications();
      
      // Notificar a otros componentes
      window.dispatchEvent(new CustomEvent('event-left', {
        detail: { eventId: eventToCancel.id, eventTitle: eventToCancel.title }
      }));
      
      // Cerrar el diálogo
      closeCancelDialog();
      
    } catch (error) {
      console.error('Error cancelling registration:', error);
      
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo cancelar la inscripción",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCancellingRegistration(null);
    }
  };

  return (
    <>
      <Flex
        w={{ sm: '100%', md: 'auto' }}
        alignItems="center"
        flexDirection="row"
        bg={menuBg}
        flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
        p="10px"
        borderRadius="30px"
        boxShadow={shadow}
      >
        {/* ... (código anterior sin cambios) ... */}

        <Flex
          bg={ethBg}
          display={secondary ? 'flex' : 'none'}
          borderRadius="30px"
          ms="auto"
          p="6px"
          align="center"
          me="6px"
        >
          <Flex
            align="center"
            justify="center"
            bg={ethBox}
            h="29px"
            w="29px"
            borderRadius="30px"
            me="7px"
          >
            <Icon color={ethColor} w="9px" h="14px" as={FaEthereum} />
          </Flex>
          <Text
            w="max-content"
            color={ethColor}
            fontSize="sm"
            fontWeight="700"
            me="6px"
          >
            1,924
            <Text as="span" display={{ base: 'none', md: 'unset' }}>
              {' '}
              ETH
            </Text>
          </Text>
        </Flex>
        <SidebarResponsive routes={routes} />
        
        {/* MENÚ DE NOTIFICACIONES */}
        <Menu>
          <MenuButton p="0px" position="relative">
            <Icon
              mt="6px"
              as={MdNotificationsNone}
              color={navbarIcon}
              w="18px"
              h="18px"
              me="10px"
            />
            {/* Badge de notificaciones con el conteo */}
            {eventCount > 0 && (
              <Badge
                position="absolute"
                top="-5px"
                right="0px"
                colorScheme="red"
                borderRadius="full"
                fontSize="10px"
                px="5px"
                minW="18px"
                textAlign="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {eventCount > 99 ? '99+' : eventCount}
              </Badge>
            )}
          </MenuButton>
          <MenuList
            boxShadow={shadow}
            p="20px"
            borderRadius="20px"
            bg={menuBg}
            border="none"
            mt="22px"
            me={{ base: '30px', md: 'unset' }}
            minW={{ base: 'unset', md: '450px', xl: '500px' }}
            maxW={{ base: '360px', md: '500px' }}
            maxH="500px"
            overflowY="auto"
          >
            <Flex w="100%" mb="20px">
              <Text fontSize="md" fontWeight="600" color={textColor}>
                Mis Eventos ({eventCount})
              </Text>
              {eventCount > 0 && (
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={textColorBrand}
                  ms="auto"
                  cursor="pointer"
                  onClick={fetchNotifications}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Actualizar
                </Text>
              )}
            </Flex>
            
            {loadingNotifications ? (
              <Flex justifyContent="center" py="20px">
                <Text>Cargando eventos...</Text>
              </Flex>
            ) : events.length > 0 ? (
              <Flex flexDirection="column" gap="15px">
                {events.map((event) => (
                  <Box
                    key={event.registration_id}
                    p="15px"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="gray.100"
                    bg="white"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ 
                      bg: 'gray.50', 
                      transform: 'translateX(2px)',
                      borderColor: 'gray.200'
                    }}
                    position="relative"
                  >
                    {/* Contenido del evento (clic para navegar) */}
                    <Box onClick={() => handleEventClick(event.id)}>
                      {/* Imagen del evento (si tiene) */}
                      {event.cover_url && (
                        <Image
                          src={event.cover_url}
                          alt={event.title}
                          borderRadius="8px"
                          height="80px"
                          width="100%"
                          objectFit="cover"
                          mb="10px"
                        />
                      )}
                      
                      {/* Título del evento */}
                      <Flex align="center" mb="8px">
                        <Icon as={MdEvent} color="brand.500" mr="8px" />
                        <Text 
                          fontSize="md" 
                          fontWeight="600" 
                          color={textColor}
                          noOfLines={1}
                        >
                          {event.title}
                        </Text>
                      </Flex>
                      
                      {/* Descripción */}
                      {event.description && (
                        <Text 
                          fontSize="sm" 
                          color="gray.600" 
                          mb="8px"
                          noOfLines={2}
                        >
                          {event.description}
                        </Text>
                      )}
                      
                      {/* Detalles del evento */}
                      <Flex direction="column" gap="4px" mb="10px">
                        {/* Fecha */}
                        {event.start_time && (
                          <Flex align="center">
                            <Icon as={MdCalendarToday} color="gray.500" mr="6px" fontSize="14px" />
                            <Text fontSize="xs" color="gray.600">
                              {formatDate(event.start_time)}
                            </Text>
                          </Flex>
                        )}
                        
                        {/* Ubicación */}
                        {event.location && (
                          <Flex align="center">
                            <Icon as={MdLocationOn} color="gray.500" mr="6px" fontSize="14px" />
                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              {event.location}
                            </Text>
                          </Flex>
                        )}
                        
                        {/* Categoría */}
                        {event.category && (
                          <Flex>
                            <Badge 
                              colorScheme="blue" 
                              fontSize="10px" 
                              px="8px" 
                              py="2px"
                              borderRadius="full"
                            >
                              {event.category}
                            </Badge>
                          </Flex>
                        )}
                      </Flex>
                      
                      {/* Información de inscripción */}
                      <Flex justify="space-between" align="center" mt="8px">
                        <Text fontSize="xs" color="gray.400" fontStyle="italic">
                          Inscrito el {moment(event.registration_date).format('D [de] MMMM')}
                        </Text>
                        
                        {/* Estado de la inscripción */}
                        {event.status && event.status !== 'registered' && (
                          <Badge 
                            colorScheme={event.status === 'confirmed' ? 'green' : 'yellow'}
                            fontSize="10px"
                            px="8px"
                            py="2px"
                            borderRadius="full"
                          >
                            {event.status}
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                    
                    {/* Botón de cancelar - AHORA MÁS GRANDE Y EN LA PARTE INFERIOR */}
                    <Flex mt="12px" pt="10px" borderTop="1px solid" borderColor="gray.100">
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        width="100%"
                        onClick={(e) => openCancelDialog(event, e)}
                        isLoading={cancellingRegistration === event.registration_id}
                        loadingText="Cancelando inscripción..."
                        leftIcon={<Icon as={MdCancel} />}
                        height="36px"
                        fontSize="sm"
                        fontWeight="500"
                      >
                        Cancelar inscripción
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py="30px"
                textAlign="center"
              >
                <Icon 
                  as={MdNotificationsNone} 
                  color="gray.300" 
                  fontSize="40px" 
                  mb="15px"
                />
                <Text color="gray.500" fontWeight="500" mb="5px">
                  No tienes eventos inscritos
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Únete a algunos eventos para verlos aquí
                </Text>
                <Button
                  colorScheme="brand"
                  size="sm"
                  mt="15px"
                  onClick={() => navigate('/events')}
                >
                  Explorar eventos
                </Button>
              </Flex>
            )}
          </MenuList>
        </Menu>

      <Button
        variant="no-hover"
        bg="transparent"
        p="0px"
        minW="unset"
        minH="unset"
        h="18px"
        w="max-content"
        onClick={toggleColorMode}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={navbarIcon}
          as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
        />
      </Button>
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: 'pointer' }}
            color="white"
            name={user || "Invitado"}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋&nbsp; Hey, {user?.split(" ")[0] || "Invitado"}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ textColor: 'purple.200' }}
              borderRadius="8px"
              color="black"
              px="14px"
              onClick={()=> {
                navigate("/user/profile");
              }}
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem
                _hover={{ textColor: 'red.700' }}
                _focus={{ textColor: 'red.700' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm"
                    onClick={()=> {
                      logout();
                      navigate("/");
                    }}
              >Cerrar Sesión</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
     </Flex>

      {/* Diálogo de confirmación para cancelar inscripción */}
      <AlertDialog
        isOpen={isCancelDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeCancelDialog}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <Flex align="center">
                <Icon as={MdCancel} color="red.500" mr="10px" />
                Cancelar inscripción
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb="3">
                ¿Estás seguro de que quieres cancelar tu inscripción a este evento?
              </Text>
              {eventToCancel && (
                <Box bg="gray.50" p="15px" borderRadius="lg" mt="10px">
                  <Text fontWeight="600" color="brand.500" mb="2">
                    {eventToCancel.title}
                  </Text>
                  {eventToCancel.start_time && (
                    <Text fontSize="sm" color="gray.600">
                      Fecha: {formatDate(eventToCancel.start_time)}
                    </Text>
                  )}
                  {eventToCancel.location && (
                    <Text fontSize="sm" color="gray.600">
                      Ubicación: {eventToCancel.location}
                    </Text>
                  )}
                </Box>
              )}
              <Text mt="3" fontSize="sm" color="gray.500">
                Esta acción no se puede deshacer.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={closeCancelDialog}
                variant="outline"
                mr={3}
              >
                Mantener inscripción
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleCancelRegistration}
                isLoading={cancellingRegistration === eventToCancel?.registration_id}
                loadingText="Cancelando..."
              >
                Sí, cancelar inscripción
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};