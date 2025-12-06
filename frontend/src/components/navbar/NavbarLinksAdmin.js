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
} from '@chakra-ui/react';
// Custom Components
import { ItemContent } from 'components/menu/ItemContent';
//import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import { useAuthStore } from 'stores/useAuthStore';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from 'routes';
import { userAPI } from 'services/api';

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Estados para notificaciones
  const [eventCount, setEventCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
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

  // Función para obtener el conteo de eventos
  const fetchEventCount = async () => {
    // Solo si el usuario está autenticado
    if (!user) {
      setEventCount(0);
      setNotifications([]);
      return;
    }
    
    try {
      setLoadingNotifications(true);
      const data = await userAPI.getMyEventCount();
      const count = data.event_count || 0;
      setEventCount(count);
      
      // Crear notificaciones basadas en el conteo
      if (count > 0) {
        const newNotifications = [
          {
            id: 1,
            title: 'Eventos Inscritos',
            description: `Estás inscrito en ${count} evento(s)`,
            time: 'Actualizado ahora',
            type: 'event_count',
          },
          {
            id: 2,
            title: 'Recordatorio',
            description: 'Revisa los detalles de tus eventos próximos',
            time: 'Hace 1 hora',
            type: 'reminder',
          }
        ];
        setNotifications(newNotifications);
      } else {
        // Mensaje cuando no hay eventos
        setNotifications([
          {
            id: 1,
            title: 'No hay eventos',
            description: 'Únete a algunos eventos para ver notificaciones aquí',
            time: 'Ahora',
            type: 'info',
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching event count:', error);
      setEventCount(0);
      setNotifications([
        {
          id: 1,
          title: 'Error',
          description: 'No se pudo cargar las notificaciones',
          time: 'Ahora',
          type: 'error',
        }
      ]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Cargar el conteo al montar el componente y cuando cambia el usuario
  useEffect(() => {
    fetchEventCount();
    
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchEventCount, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Escuchar eventos de inscripción para actualizar en tiempo real
  useEffect(() => {
    const handleEventRegistration = () => {
      fetchEventCount();
    };

    window.addEventListener('event-joined', handleEventRegistration);
    window.addEventListener('event-left', handleEventRegistration);
    
    return () => {
      window.removeEventListener('event-joined', handleEventRegistration);
      window.removeEventListener('event-left', handleEventRegistration);
    };
  }, []);

  // Función para marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications([]);
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
      {/*<SearchBar*/}
      {/*  mb={() => {*/}
      {/*    if (secondary) {*/}
      {/*      return { base: '10px', md: 'unset' };*/}
      {/*    }*/}
      {/*    return 'unset';*/}
      {/*  }}*/}
      {/*  me="10px"*/}
      {/*  borderRadius="30px"*/}
      {/*  onSearch={async (query) => {*/}
      {/*    try {*/}
      {/*      if (!query.trim()) return; // no empty searches*/}
      {/*      console.log("Searching for:", query);*/}

      {/*      // Fetch events (adjust URL to your backend)*/}
      {/*      const response = await fetch(`${API_BASE}/api/events/?q=${encodeURIComponent(query)}`);*/}
      {/*      if (!response.ok) throw new Error(`HTTP ${response.status}`);*/}

      {/*      const data = await response.json();*/}
      {/*      console.log("Search results:", data);*/}

      {/*      // Example: if you want to display the results later*/}
      {/*      // you could lift this state up to a parent component.*/}
      {/*    } catch (error) {*/}
      {/*      console.error("Error fetching events:", error);*/}
      {/*    }*/}
      {/*  }}*/}
      {/*/>*/}
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
          minW={{ base: 'unset', md: '400px', xl: '450px' }}
          maxW={{ base: '360px', md: 'unset' }}
        >
          <Flex w="100%" mb="20px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notificaciones
            </Text>
            {notifications.length > 0 && notifications.some(n => n.type !== 'info') && (
              <Text
                fontSize="sm"
                fontWeight="500"
                color={textColorBrand}
                ms="auto"
                cursor="pointer"
                onClick={markAllAsRead}
                _hover={{ textDecoration: 'underline' }}
              >
                Marcar como leídas
              </Text>
            )}
          </Flex>
          
          {loadingNotifications ? (
            <Flex justifyContent="center" py="20px">
              <Text>Cargando notificaciones...</Text>
            </Flex>
          ) : (
            <Flex flexDirection="column">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    _hover={{ bg: 'gray.50' }}
                    _focus={{ bg: 'gray.50' }}
                    px="10px"
                    py="12px"
                    borderRadius="8px"
                    mb="10px"
                    bg={notification.type === 'error' ? 'red.50' : 
                         notification.type === 'info' ? 'blue.50' : 'transparent'}
                  >
                    <ItemContent 
                      info={notification.title}
                      aName={notification.description}
                      aTime={notification.time}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  px="0"
                  borderRadius="8px"
                  mb="10px"
                  isDisabled
                >
                  <ItemContent info="No hay notificaciones" />
                </MenuItem>
              )}
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