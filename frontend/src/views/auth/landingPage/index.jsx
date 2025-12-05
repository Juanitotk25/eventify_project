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
            pb={8}
        >
            {/* Banner Image */}
            <Box width="full" zIndex={0} maxH="50vh" overflow="hidden">
                <Image
                    src={banner}
                    alt="Estudiantes compartiendo eventos"
                    shadow="xl"
                    width="100%"
                    height="auto"
                    objectFit="cover"
                />
            </Box>

            {/* Hero Section - Login Information */}
            <Box
                width="full"
                position="relative"
                zIndex={2}
                mt={{ base: "-100px", md: "-120px" }}
                mb={{ base: "40px", md: "60px" }}
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
                            <Flex
                                minW={{ base: "80vw", md: "40vw" }}
                                gap={2}
                                direction="column"
                                alignItems="center"
                                justifyContent="center"
                                mt={6}
                                py="2vh"
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

            {/* Events Calendar - Positioned below login section */}
            <Box
                width="full"
                position="relative"
                zIndex={1}
                px={{ base: 4, md: 8 }}
                mb={8}
            >
                <LandingEventsCalendar />
            </Box>

            {/* Footer */}
            <Box w="full" mt="auto" zIndex={1}>
                <AuthFooter />
            </Box>
        </Flex>
    );
}
