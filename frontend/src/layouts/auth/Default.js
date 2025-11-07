// Chakra imports
import {Box, Flex, Heading, Icon, Image, Text} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";
import Footer from "components/footer/FooterAuth";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";
// Custom components
import { NavLink } from "react-router-dom";
// Assets
import { FaChevronLeft } from "react-icons/fa";

function AuthIllustration(props) {
  const { children, illustrationBackground } = props;
  // Chakra color mode
  return (
    <Flex position='relative' h='full' w='100%'>
      <Flex
        h={{
          sm: "initial",
          md: "unset",
          lg: "100vh",
          xl: "97vh",
        }}
        w={'100vw'}
        maxW={'100vw'}
        //maxW={{ md: "100%", lg: "1313px" }}
        pt={{ sm: "0px", md: "0px" }}
        px={{ lg: "0px", xl: "0px" }}
        ps={{ xl: "0px" }}
        justifyContent='start'
        direction='column'>
        <NavLink
          to='/auth'
          style={() => ({
            width: "fit-content",
            marginTop: "40px",
          })}>
          <Flex
            align='center'
            ps={{ base: "25px", lg: "10px" }}
            pt={{ lg: "10px", xl: "10px" }}
            w='fit-content'>
            <Icon
              as={FaChevronLeft}
              me='12px'
              h='13px'
              w='8px'
              color='secondaryGray.600'
            />
            <Text ms='10px' fontSize='sm' color='secondaryGray.600'>
              De vuelta al inicio!
            </Text>
          </Flex>
        </NavLink>
          {children}
          <Box
              display={{ base: "none", md: "block" }}
              h='100%'
              w={{ lg: "50vw", "2xl": "44vw" }}
              position='absolute'
              right='0px'>
              <Flex
                  bgGradient="linear(to-br, blue.400, purple.600)"
                  justify='center'
                  direction='column'
                  align='center'
                  w='100%'
                  h='100%'
                  minH='100vh'
                  bgSize='cover'
                  bgPosition='50%'
                  position='absolute'
                  borderBottomLeftRadius={{ lg: "200px", xl: "200px" }}>
                  <Image
                      src={illustrationBackground}
                      alt="Logo Eventify"
                      style={{ width: "30vw", height: "auto" }}
                  />
                  <Heading fontSize="5em" size="2xl" minH="15vh" minW="25vw" maxW="40vw" mb={4} fontWeight="extrabold"
                           bgGradient="linear(to-r, blue.200, purple.200)"
                           bgClip="text">
                      Eventify
                  </Heading>
              </Flex>
          </Box>
        <Footer />
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}
// PROPS

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;
