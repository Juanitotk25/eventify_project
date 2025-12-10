import React from "react";
import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import {NavLink, useNavigate} from "react-router-dom";
import AuthFooter from "components/footer/FooterAuth";
import banner from "assets/img/auth/landing-banner.avif";
import logo from "assets/img/logo_icon.png"
import {HSeparator} from "../../../components/separator/Separator";
import LandingEventsCalendar from "../landingEventsCalendar";
export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Flex
            direction="column"
            minH="100vh"
            align="center"
            justify="flex-start"
            bgGradient="linear(to-br, blue.600, purple.700)"
            color="white"
            textAlign="center"
            position="relative"
        >
            {/* Banner Image */}
            <Box position="relative" width="full" maxH="100vh" minH="100vh" height="full" overflow="hidden">
                <Image
                    zIndex={0}
                    src={banner}
                    alt="Estudiantes compartiendo eventos"
                    shadow="xl"
                    width="100%"
                    height="auto"
                    objectFit="cover"
                    position="absolute"
                />
                {/* Hero Section - Login Information */}
                <Box
                    width="full"
                    position="relative"
                    zIndex={1}
                    mt={{ base: "40px", md: "40px" }}
                    mb={{ base: "40px", md: "60px" }}
                    boxShadow="0 10px 20px rgba(0, 0, 0, 0.15)"
                >
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        maxW={{ base: "90vw", md: "60vw", lg: "800px" }}
                        mx="auto"
                    >
                        <Box
                            width="full"
                            bgGradient="linear(to-br, blue.600, purple.700)"
                            borderRadius="50px"
                            p={{ base: 6, md: 8 }}
                            boxShadow="2xl"
                        >
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                gap={4}
                                justifyContent="center"
                                textAlign="center"
                            >
                                <Flex
                                    direction="row"
                                    gap={5}
                                    alignItems="flex-end"
                                    justifyContent="center"
                                    flexWrap="wrap"
                                >
                                    <Image
                                        src={logo}
                                        alt="Logo Eventify"
                                        style={{ width: "12vw", maxWidth: "120px", height: "auto" }}
                                    />
                                    <Heading
                                        fontSize={{ base: "3em", md: "5em" }}
                                        size="2xl"
                                        lineHeight="1.4"
                                        mb={4}
                                        fontWeight="extrabold"
                                        bgGradient="linear(to-r, blue.200, purple.200)"
                                        bgClip="text"
                                    >
                                        Eventify
                                    </Heading>
                                </Flex>
                                <Heading
                                    as="h1"
                                    size={{ base: "xl", md: "2xl" }}
                                    mb={4}
                                    fontWeight="extrabold"
                                >
                                    ¡No te perdás ni una!
                                </Heading>
                                <Text
                                    fontSize={{ base: "md", md: "lg" }}
                                    mb={8}
                                    maxW="600px"
                                    lineHeight="tall"
                                    px={4}
                                >
                                    Descubre, comparte y participa en los eventos dentro y fuera del
                                    campus. Tu red social universitaria para no perderte nada.
                                </Text>
                                <Flex justify="center" gap={4} wrap="wrap" mt={8}>
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
                                <Flex
                                    minW={{ base: "80vw", md: "40vw" }}
                                    gap={2}
                                    direction="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    mt={2}
                                >
                                    <HSeparator />
                                    <Text color="white" mx="14px">
                                        ó
                                    </Text>
                                    <NavLink to="/auth/sign-up">
                                        <Text
                                            color="purple.300"
                                            as="span"
                                            _hover={{
                                                color: "white",
                                            }}
                                            ms="5px"
                                            fontWeight="500"
                                        >
                                            ¡Crea tu Cuenta!
                                        </Text>
                                    </NavLink>
                                </Flex>
                            </Box>
                        </Box>
                    </Flex>
                </Box>
            </Box>


            {/* Events Calendar - Positioned below login section */}
            <Text
                mb={8}
                px={4}
                mt={8}
                fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                fontWeight="extrabold"
            >
                ¡Mira nuestros próximos eventos!
            </Text>
            <Box
                width="full"
                position="relative"
                zIndex={0}
                px={{ base: 4, md: 8 }}
                my={8}
            >
                <LandingEventsCalendar />
            </Box>

            {/* Footer */}
            <Box w="full" h="full" mt="auto" zIndex={0}>
                <AuthFooter />
            </Box>
        </Flex>
    );
}
