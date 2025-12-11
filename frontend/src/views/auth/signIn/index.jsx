/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState } from "react"; // 1. Importar useState
import { NavLink, useNavigate } from "react-router-dom"; // 1. Importar useNavigate
import axios from 'axios'; // 1. Importar axios

// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast, // 2. Opcional: Para mostrar mensajes de éxito/error
} from "@chakra-ui/react";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import { useAuthStore } from "stores/useAuthStore";
// Assets
import illustration from "assets/img/logo_icon.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

// URL BASE DE BACKEND
const API_LOGIN_URL = 'http://127.0.0.1:8000/api/users/login/';


function SignIn() {
  // Inicialización de hooks y estados
  const navigate = useNavigate(); // Hook de navegación para redirigir
  const toast = useToast(); // Hook para mostrar notificaciones
  const setUser = useAuthStore((state) => state.setUser); //Para almacenar contexto de usuario

  // 3. Estados para capturar el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el botón de carga

  // Estados y funciones existentes
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  // ... (El resto de variables de estilo de Chakra UI)
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "purple.200" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );

  // (Fin de variables de estilo)

  // 4. Función principal de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);

    try {
      const response = await axios.post(API_LOGIN_URL, {
        // DRF Simple JWT espera 'username' y 'password'.
        // Usamos el 'email' ingresado como el 'username'
        username: username,
        password: password,
      });

      // La respuesta exitosa contiene los tokens
      const { access, refresh } = response.data;

      // 5. Almacenar los tokens de autenticación
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Mostrar notificación de éxito
      toast({
        title: "¡Ingreso Exitoso!",
        description: "Redirigiendo al Dashboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      useAuthStore.getState().setUser({
        username: username,
        role: response.data.role || 'student', // Asegúrate que el backend devuelva 'role'
        email: response.data.email || ''
      });

      // 6. Redirigir al dashboard (Ruta por defecto del dashboard de Horizon UI)
      navigate('/user');

    } catch (error) {
      // 7. Manejo de errores
      const message = 
        error.response && error.response.data.detail 
        ? error.response.data.detail // Mensaje de Django (ej: "No active account found with the given credentials")
        : "Error de conexión o credenciales inválidas.";

      toast({
        title: "Error de Ingreso",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Login fallido:", error.response || error);
    } finally {
      setLoading(false); // Desactivar la carga del botón
    }
  };


  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        // (Código de estilos de Flex)
        // Agregamos un formulario (Form) que envuelve el FormControl
        as="form"
        onSubmit={handleSubmit} // Asignamos la función de envío
        // ... (El resto de estilos de Flex)
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "5vh" }}
        mt={{ base: "0px", md: "1vh" }}
        flexDirection='column'>

        {/* Código de Heading y Text */}
        <Box mt='auto'>
            <Heading color={textColor} fontSize='6xl' mb='10px'>
                Ingresa
            </Heading>
            <Text
                mb='36px'
                ms='4px'
                color={textColorSecondary}
                fontWeight='400'
                fontSize='lg'>
                Ingresa tu correo electrónico y contraseña para ingresar!
            </Text>
        </Box>

        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>

          {/* (Código de Botón de Google y Separator) */}
          <Button
            fontSize='sm'
            me='0px'
            mb='26px'
            py='15px'
            h='50px'
            borderRadius='16px'
            _before={{
              content: '""',
              position: "absolute",
              inset: 0,
              padding: "2px", // border thickness
              borderRadius: "16px",
              background: "linear-gradient(90deg, purple, blue)", // your gradient here
              WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
            bg={googleBg}
            color={googleText}
            fontWeight='500'
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}>
            <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
            Ingresa con Google
          </Button>
          <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>
              ó
            </Text>
            <HSeparator />
          </Flex>

          <FormControl>
            {/* Campo de Username */}
            <FormLabel
              display='flex'
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              mb='8px'>
              Nombre de usuario<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              variant='auth'
              fontSize='sm'
              ms={{ base: "0px", md: "0px" }}
              _hover={{ color: "whiteAlpha.800" }}
              _focus={{ color: "white" }}
              type='text'
              placeholder='Ingresa tu nombre de usuario'
              mb='24px'
              fontWeight='500'
              size='lg'
              // 8. ASIGNAR VALOR Y CAMBIOS AL ESTADO
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Campo de Contraseña */}
            <FormLabel
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              display='flex'>
              Contraseña<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size='md'>
              <Input
                isRequired={true}
                fontSize='sm'
                placeholder='Min. 8 caracteres'
                mb='24px'
                size='lg'
                type={show ? "text" : "password"}
                variant='auth'
                // 9. ASIGNAR VALOR Y CAMBIOS AL ESTADO
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement display='flex' alignItems='center' mt='4px'>
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>

            {/* (Ccódigo de Checkbox y Forgot Password) */}
            <Flex justifyContent='space-between' align='center' mb='24px'>
              <FormControl display='flex' alignItems='center'>
                <Checkbox
                  id='remember-login'
                  colorScheme='brandScheme'
                  me='10px'
                />
                <FormLabel
                  htmlFor='remember-login'
                  mb='0'
                  fontWeight='normal'
                  color={textColor}
                  fontSize='sm'>
                  Mantén mi sesión iniciada
                </FormLabel>
              </FormControl>
              <NavLink to='/auth/forgot-password'>
                <Text
                  color={textColorBrand}
                  fontSize='sm'
                  w='full'
                  whitespace='nowrap'
                  fontWeight='500'>
                  ¿Olvidaste tu contraseña?
                </Text>
              </NavLink>
            </Flex>

            {/* Botón de Iniciar Sesión */}
            <Button
              fontSize='sm'
              variant='brand'
              fontWeight='500'
              w='100%'
              h='50'
              mb='24px'
              type='submit' // 10. Indicar que este botón envía el formulario
              isLoading={loading} // Mostrar estado de carga
              >
              Iniciar Sesión
            </Button>
          </FormControl>

          {/* ... (Código de Create an Account) */}
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='0px'>
            <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
              ¿Aún no tienes cuenta?
              <NavLink to='/auth/sign-up'>
                <Text
                  color={textColorBrand}
                  as='span'
                  ms='5px'
                  fontWeight='500'>
                  Crea tu Cuenta!
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
