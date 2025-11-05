/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  Button,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Footer() {
  const textColor = useColorModeValue("gray.400", "white");
  const backgroundColor = useColorModeValue("gray.200", "brand.700");
  const { toggleColorMode } = useColorMode();
  return (
    <Flex
      zIndex='3'
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
      px={{ base: "30px", md: "50px" }}
      py={{ base: "30px", md: "50px" }}
      pb='30px'>
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}>
        {" "}
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          Univalle. Todos los derechos reservados.
            <Text> Hecho con
              <Link
                mx='3px'
                color={textColor}
                href='https://github.com/horizon-ui/horizon-ui-chakra'
                target='_blank'
                fontWeight='700'>
                Horizon-UI
              </Link>
            </Text>
        </Text>
      </Text>
        <List display='flex' gap='25px' px='20px'>
            <ListItem>
                <Link
                    fontWeight='500'
                    color={textColor}
                    href='mailto:juan.diego.cardenas@correounivalle.edu.co'>
                    Soporte
                </Link>
            </ListItem>
            <ListItem>
                <Link
                    fontWeight='500'
                    color={textColor}
                    href='https://www.simmmple.com/licenses?ref=horizon-chakra-free'>
                    Licencia
                </Link>
            </ListItem>
            <ListItem>
                <Link
                    fontWeight='500'
                    color={textColor}
                    href='https://simmmple.com/terms-of-service?ref=horizon-chakra-free'>
                    Términos de Uso
                </Link>
            </ListItem>
            <ListItem>
                <Link
                    fontWeight='500'
                    color={textColor}
                    href='https://www.blog.simmmple.com/?ref=horizon-chakra-free'>
                    Blog
                </Link>
            </ListItem>
        </List>
    </Flex>
  );
}
