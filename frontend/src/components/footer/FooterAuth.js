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
  return (
    <Flex
      zIndex='3'
      background={'gray.300'}
      w={'100vw'}
      flexDirection={{
        base: "column",
        lg: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent='space-between'
      px={{ base: "20px", md: "10px" }}
      pb='10px'>
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", lg: "0px" }}>
        {" "}
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          Horizon UI. All Rights Reserved. Made with love by
          <Link
            mx='3px'
            color={textColor}
            href='https://www.simmmple.com?ref=horizon-chakra-free'
            target='_blank'
            fontWeight='700'>
            Simmmple!
          </Link>
        </Text>
      </Text>
      <List display='flex'>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='mailto:hello@simmmple.com?ref=horizon-chakra-free'>
            Support
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://www.simmmple.com/licenses?ref=horizon-chakra-free'>
            License
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://simmmple.com/terms-of-service?ref=horizon-chakra-free'>
            Terms of Use
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
