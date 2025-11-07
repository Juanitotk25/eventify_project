import React from "react";
import {Box, Heading, Text, Button, Image} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import logo from "assets/img/auth/sad_logo.png"

export default function NotFound() {
    return (
        <Box alignItems="center" display="flex" flexDirection="column" textAlign="center" py={20} px={6}>
            <Heading
                display="inline-block"
                as="h1"
                size="2xl"
                bgGradient="linear(to-br, blue.600, purple.700)"
                backgroundClip="text"
            >
                404
            </Heading>
            <Text fontSize="18px" mt={3} mb={2}>
                Página no encontrada
            </Text>
            <Text color={'gray.500'} mb={6}>
                La página que estás buscando no existe :c
            </Text>
            <Image
                src={logo}
                alt="Logo Eventify"
                style={{ width: "20vw", height: "auto" }}
            />
            <Button
                colorScheme="teal"
                bgGradient="linear(to-br, blue.600, blue.500, purple.700)"
                color="white"
                as={Link}
                to="/"
            >
                Volver al Inicio
            </Button>
        </Box>
    );
}
