import React from "react";
import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import {NavLink, useNavigate} from "react-router-dom";
import AuthFooter from "components/footer/FooterAuth";
import banner from "assets/img/auth/landing-banner.avif";
import {HSeparator} from "../../../components/separator/Separator";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Flex
            direction="column"
            minH="100vh"
            align="center"
            justify="space-between"
            bgGradient="linear(to-br, blue.600, purple.700)"
            color="white"
            textAlign="center"
            overflow="hidden"
            position="relative"
        >
            <Box width="full" zIndex={0} maxH="50vh">
                <Image
                    src={banner}
                    alt="Estudiantes compartiendo eventos"
                    shadow="xl"
                />
            </Box>
            {/* Hero Section */}
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
                gap={10}
                zIndex={2}
                position="absolute"
                top="45%"
                left="50%"
                transform="translate(-50%, -50%)"
                maxW="60vw"
            >
                {/* Text */}
                <Box
                    minW="60vw"
                    minH="65vh"
                    bgGradient="linear(to-br, blue.600, purple.700)"
                    borderRadius="50px"
                    display="flex"
                    justifyContent="center">

                        <Box display="flex" flexDirection="column" alignItems="center"
                             justifyContent="center" my="10vh" mx="10vw" textAlign="center">
                            <Heading fontSize="5em" size="2xl" minH="15vh" minW="25vw" maxW="40vw" mb={4} fontWeight="extrabold"
                                     bgGradient="linear(to-r, blue.200, purple.200)"
                                     bgClip="text">
                                Eventify
                            </Heading>
                            <Heading as="h1" size="2xl" maxW="40vw" mb={4} fontWeight="extrabold">
                                ¡No te perdás ni una!
                            </Heading>
                            <Text fontSize="lg" mb={8} maxW="30vw" lineHeight="tall">
                                Descubre, comparte y participa en los eventos dentro y fuera del
                                campus. Tu red social universitaria para no perderte nada.
                            </Text>
                            <Flex justify="center" gap={4} wrap="wrap">
                                <Button
                                    bg="white"
                                    color="purple.700"
                                    _hover={{
                                        bg: "purple.700",
                                        color: "white",
                                    }}
                                    size="lg"
                                    px={8}
                                    onClick={() => navigate("/auth/sign-in")}
                                >
                                    Iniciar Sesión
                                </Button>
                        </Flex>
                            <Flex minW="40vw" gap={2} direction="column" alignItems="center"
                                  justifyContent="center" mt="auto" py="2vh" >
                                <HSeparator />
                                <Text color='white' mx='14px'>
                                    ó
                                </Text>
                                <NavLink to='/auth/sign-up'>
                                    <Text
                                        color="purple.300"
                                        as='span'
                                        _hover={{
                                            color: "white",
                                        }}
                                        ms='5px'
                                        fontWeight='500'>
                                        ¡Crea tu Cuenta!
                                    </Text>
                                </NavLink>
                            </Flex>
                    </Box>
                </Box>
            </Flex>

            {/* Footer */}
            <Box w="full" mt={10} zIndex={3}>
                <AuthFooter />
            </Box>
        </Flex>
    );
}
