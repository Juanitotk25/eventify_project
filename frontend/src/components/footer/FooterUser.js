/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  Box, // Importamos Box para usarlo como contenedor en lugar de Text anidado
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Footer() {
  const textColor = useColorModeValue("black", "white");
  const backgroundColor = useColorModeValue("gray.200", "brand.700");
  const { toggleColorMode } = useColorMode();

  return (
      <Flex
          zIndex='0'
          position='relative'
          backgroundColor={backgroundColor}
          flexDirection={{
            base: "column",
            xl: "row",
          }}
          alignItems={{
            base: "center",
            xl: "start",
          }}
          justifyContent='space-between'
          px={{ base: "10px", md: "30px" }}
          py={{ base: "10px", md: "30px" }}
          pb='10px'
      >
        <Text
            color={textColor}
            textAlign={{
              base: "center",
              xl: "start",
            }}
            mb={{ base: "5px", xl: "0px" }}
        >
          &copy; {1900 + new Date().getYear()}
          <Text as='span' fontWeight='500' ms='4px'>
            Univalle. Todos los derechos reservados.
          </Text>
            <Text>
              Hecho con
              <Link
                  mx='3px'
                  color={textColor}
                  href='https://github.com/horizon-ui/horizon-ui-chakra'
                  _hover={{ color: "purple.500" }}
                  target='_blank'
                  fontWeight='700'
              >
                Horizon-UI
              </Link>
            </Text>

        </Text>

        <List display='flex' gap='20px' px='20px' flexWrap='nowrap'>
          <ListItem>
            <Link
                fontWeight='500'
                color={textColor}
                _hover={{ color: "purple.500" }}
                href='mailto:juan.diego.cardenas@correounivalle.edu.co'
            >
              Soporte
            </Link>
          </ListItem>
          <ListItem>
            <Link
                fontWeight='500'
                color={textColor}
                _hover={{ color: "purple.500" }}
                href='https://www.simmmple.com/licenses?ref=horizon-chakra-free'
            >
              Licencia
            </Link>
          </ListItem>
          <ListItem>
            <Link
                whiteSpace='nowrap'
                fontWeight='500'
                color={textColor}
                _hover={{ color: "purple.500" }}
                href='https://simmmple.com/terms-of-service?ref=horizon-chakra-free'
            >
              Términos de Uso
            </Link>
          </ListItem>
          <ListItem>
            <Link
                fontWeight='500'
                color={textColor}
                _hover={{ color: "purple.500" }}
                href='https://www.blog.simmmple.com/?ref=horizon-chakra-free'
            >
              Blog
            </Link>
          </ListItem>
        </List>
      </Flex>
  );
}
