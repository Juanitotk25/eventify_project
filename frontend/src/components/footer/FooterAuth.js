/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Footer() {
  let textColor = useColorModeValue("black", "white");
  let linkColor = useColorModeValue({ base: "white", lg: "gray.900" }, "white");
  let backgroundColor = useColorModeValue("gray.200", "brand.700");

  return (
    <Flex
      zIndex='3'
      backgroundColor={backgroundColor}
      maxW={'100vw'}
      flexDirection={{
        base: "column",
        lg: "row",
      }}
      alignItems={{
        base: "center",
        xl: "center",
      }}
      justifyContent='space-between'
      px={{ base: "20px", md: "10px" }}
      py={{ base: "20px", md: "10px" }}
      pb='0px'>
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
            color={linkColor}
            href='mailto:juan.diego.cardenas@correounivalle.edu.co'>
            Soporte
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://www.simmmple.com/licenses?ref=horizon-chakra-free'>
            Licencia
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://simmmple.com/terms-of-service?ref=horizon-chakra-free'>
            Términos de Uso
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://www.blog.simmmple.com/?ref=horizon-chakra-free'>
            Blog
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
