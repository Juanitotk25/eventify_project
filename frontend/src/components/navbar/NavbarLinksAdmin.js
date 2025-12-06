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
} from '@chakra-ui/react';
// Custom Components
import { ItemContent } from 'components/menu/ItemContent';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import { useAuthStore } from 'stores/useAuthStore';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline, MdEvent, MdLocationOn, MdCalendarToday } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from 'routes';
import { userAPI } from 'services/api';
import moment from 'moment';
import 'moment/locale/es'; // Para fechas en español

moment.locale('es');

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Estados para notificaciones
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
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

  return (
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
                <MenuItem
                  key={event.id}
                  _hover={{ bg: 'gray.50', transform: 'translateX(2px)' }}
                  _focus={{ bg: 'gray.50' }}
                  p="15px"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="gray.100"
                  onClick={() => handleEventClick(event.id)}
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <Flex direction="column" width="100%">
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
                    <Flex direction="column" gap="4px">
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
                    
                    {/* Fecha de inscripción */}
                    <Text fontSize="xs" color="gray.400" mt="8px" fontStyle="italic">
                      Inscrito el {moment(event.registration_date).format('D [de] MMMM')}
                    </Text>
                  </Flex>
                </MenuItem>
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
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Newsletter Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
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
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};