import React from "react";
import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import AuthFooter from "components/footer/FooterAuth";

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
        >
            {/* Hero Section */}
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
                mt={{ base: "80px", md: "120px" }}
                px={{ base: 6, md: 16 }}
                gap={10}
            >
                {/* Text */}
                <Box maxW={{ base: "90%", md: "45%" }}>
                    <Heading as="h1" size="2xl" mb={4} fontWeight="extrabold">
                        ¡No te perdás ni una!
                    </Heading>
                    <Text fontSize="lg" mb={8} lineHeight="tall">
                        Descubre, comparte y participa en los eventos dentro y fuera del
                        campus. Tu red social universitaria para no perderte nada.
                    </Text>
                    <Flex justify="center" gap={4} wrap="wrap">
                        <Button
                            bg="white"
                            color="purple.700"
                            _hover={{ bg: "gray.100" }}
                            size="lg"
                            px={8}
                            onClick={() => navigate("/auth/sign-in")}
                        >
                            Iniciar Sesión
                        </Button>

                    </Flex>
                </Box>

                {/* Image */}
                <Box maxW={{ base: "80%", md: "40%" }}>
                    <Image
                        src="../../src/assets/img/auth/landing-banner.jpeg"
                        alt="Estudiantes compartiendo eventos"
                        borderRadius="2xl"
                        shadow="xl"
                    />
                </Box>
            </Flex>

            {/* Footer */}
            <Box w="full" mt={10}>
                <AuthFooter />
            </Box>
        </Flex>
    );
}
