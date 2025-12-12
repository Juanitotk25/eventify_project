/* eslint-disable */
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";

// Función para renderizar un solo enlace, simplificada.
const createLinkItem = (route, index, activeRoute, activeIcon, textColor, activeColor, inactiveColor, brandColor) => {
    
    const isActive = activeRoute(route.path.toLowerCase());
    
    return (
        <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
                <Box>
                    <HStack
                        spacing={isActive ? "22px" : "26px"}
                        role="group"
                        py='5px'
                        ps='10px'
                        _hover={{
                            color: activeColor, // everything inherits this
                            cursor: "pointer",
                        }}>
                        <Flex w='100%' alignItems='center' justifyContent='center'>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color={isActive ? activeIcon : textColor}
                                me='18px'
                                _groupHover={{ color: activeIcon }}>
                                {route.icon}
                            </Box>
                            <Text
                                mr='auto'
                                lineHeight="1"
                                _groupHover={{ color: activeColor }}
                                color={isActive ? activeColor : textColor}
                                fontWeight={isActive ? "bold" : "normal"}>
                                {route.name}
                            </Text>
                        </Flex>
                        <Box
                            h='36px'
                            w='4px'
                            bg={isActive ? brandColor : "transparent"}
                            borderRadius='5px'
                        />
                    </HStack>
                </Box>
            ) : (
                <Box>
                    <HStack
                        spacing={isActive ? "22px" : "26px"}
                        py='5px'
                        ps='10px'>
                        <Text
                            me='auto'
                            color={isActive ? activeColor : inactiveColor}
                            fontWeight={isActive ? "bold" : "normal"}>
                            {route.name}
                        </Text>
                        <Box h='36px' w='4px' bg='brand.400' borderRadius='5px' />
                    </HStack>
                </Box>
            )}
        </NavLink>
    );
};


export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // Esta función crea los enlaces, filtrando primero
  const createLinks = (routes) => {
      // FILTRADO CLAVE: Retiene solo las rutas que no tienen sidebar: false
      const filteredRoutes = routes.filter(route => 
          route.layout === "/user" || route.layout === "/auth" || route.layout === "/rtl"
      ).filter(route => route.sidebar !== false); // Filtra si sidebar es false

      // Mapea las rutas filtradas
      return filteredRoutes.map((route, index) => {
        if (route.category) {
            // Lógica para categorías (se mantiene)
            return (
              <>
                <Text
                  fontSize={"md"}
                  color={activeColor}
                  fontWeight='bold'
                  mx='auto'
                  ps={{
                    sm: "10px",
                    xl: "16px",
                  }}
                  pt='18px'
                  pb='12px'
                  key={index}>
                  {route.name}
                </Text>
                {createLinks(route.items)}
              </>
            );
          } 
          // Ya no necesitamos el 'else if' porque las rutas han sido filtradas
          return createLinkItem(route, index, activeRoute, activeIcon, textColor, activeColor, inactiveColor, brandColor);

      });
  };
  
  return createLinks(routes);
}

export default SidebarLinks;