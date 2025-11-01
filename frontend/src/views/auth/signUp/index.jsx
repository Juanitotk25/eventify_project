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

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // Importación clave para peticiones

// Chakra imports
import {
  Box,
  Button,
  // Checkbox, // No usado en este flujo
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
  useToast, // Añadir useToast para notificaciones
} from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";

// Assets
import illustration from "assets/img/auth/cat_laptop.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

// URL DEL ENDPOINT DE REGISTRO
const API_REGISTER_URL = 'http://127.0.0.1:8000/api/users/register/';

function SignUp() {
  const navigate = useNavigate(); // Usamos useNavigate para la redirección
  const toast = useToast(); // Inicializamos useToast

  // 1. ESTADOS DEL FORMULARIO
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. Control de visibilidad de contraseña
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  // 3. FUNCIÓN DE ENVÍO
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !email || !password) {
        toast({
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        setLoading(false);
        return;
    }

    try {
      const response = await axios.post(API_REGISTER_URL, {
        // Campos que espera tu UserSerializer en Django
        username: username,
        email: email,
        password: password,
      });

      // Si el registro es exitoso (código 201 Created)
      if (response.status === 201) {
        toast({
          title: "¡Registro Exitoso!",
          description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        // Redirigir a la página de Login
        navigate('/auth/sign-in'); 
      }

    } catch (error) {
      console.error("Fallo en el Registro:", error.response || error);
      
      let message = "Error desconocido al intentar registrar.";
      // Manejo de errores de validación de Django
      if (error.response && error.response.data) {
          const data = error.response.data;
          // Esto captura errores como 'Username already exists' o 'Email is required'
          if (data.email) message = `Email: ${data.email.join(' ')}`;
          else if (data.username) message = `Username: ${data.username.join(' ')}`;
          else if (data.password) message = `Contraseña: ${data.password.join(' ')}`;
          else if (data.detail) message = data.detail; // Errores generales
      }
      
      toast({
        title: "Error de Registro",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

    } finally {
      setLoading(false);
    }
  };

  // ... (Variables de estilo de Chakra UI)
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
      { bg: "gray.200" },
      { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
      { bg: "secondaryGray.300" },
      { bg: "whiteAlpha.200" }
  );
  

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      {/* 4. ENVOLVEMOS EL CONTENEDOR PRINCIPAL CON EL FORMULARIO */}
      <Flex
        as='form' //  Hacemos que el contenedor principal sea el formulario
        onSubmit={handleRegister} //  Asignamos la función de envío
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        background={'gray.200'}
        ml={'50px'}
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "10px" }}
        py={{ base: "25px", md: "20px" }}
        mt={{ base: "40px", md: "14vh" }}
        rounded={'20px'}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            ¡Regístrate!
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            Ingresa tus datos para crear tu cuenta.
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
          
          {/* Botón de Google y Separador omitido por brevedad, se mantiene el JSX original */}
          {/* ... */}
          <Button
            fontSize='sm'
            me='0px'
            mb='26px'
            py='15px'
            h='50px'
            borderRadius='16px'
            bg={googleBg}
            color={googleText}
            fontWeight='500'
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}>
            <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
            Regístrate con Google
          </Button>
          <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>
              ó
            </Text>
            <HSeparator />
          </Flex>


          <FormControl>
            {/* 5. CAMPO USERNAME (Nuevo) */}
            <FormLabel
              display='flex'
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              mb='8px'>
              Nombre de Usuario<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              backgroundColor={'white'}
              variant='auth'
              fontSize='sm'
              type='text' // Tipo texto para username
              placeholder='Tu nombre de usuario'
              mb='24px'
              fontWeight='500'
              size='lg'
              value={username} // 👈 Vinculación con el estado
              onChange={(e) => setUsername(e.target.value)} // 👈 Actualización del estado
            />


            {/* CAMPO CORREO ELECTRÓNICO (Modificado) */}
            <FormLabel
              display='flex'
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              mb='8px'>
              Correo Electrónico<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              backgroundColor={'white'}
              variant='auth'
              fontSize='sm'
              ms={{ base: "0px", md: "0px" }}
              type='email'
              placeholder='mail@simmmple.com'
              mb='24px'
              fontWeight='500'
              size='lg'
              value={email} // 👈 Vinculación con el estado
              onChange={(e) => setEmail(e.target.value)} // 👈 Actualización del estado
            />

            {/* CAMPO CONTRASEÑA (Modificado) */}
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
                backgroundColor={'white'}
                placeholder='Min. 8 caracteres'
                mb='24px'
                size='lg'
                type={show ? "text" : "password"}
                variant='auth'
                value={password} // 👈 Vinculación con el estado
                onChange={(e) => setPassword(e.target.value)} // 👈 Actualización del estado
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

            {/* 6. BOTÓN DE REGISTRO (Modificado) */}
            <Button
              fontSize='sm'
              variant='brand'
              fontWeight='500'
              w='100%'
              h='50'
              mb='24px'
              type='submit' // 👈 Tipo submit para activar handleRegister
              isLoading={loading} // 👈 Indicador de carga
              // El texto del botón se cambia a "Registrarse"
            >
              Registrarse
            </Button>
          </FormControl>
          
          {/* Pie de página "Ya tienes cuenta" */}
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='10px'>
            <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
              ¿Ya tienes una cuenta? ¡Ingresa!
              <NavLink to='/auth/sign-in'>
                <Text
                  color={textColorBrand}
                  as='span'
                  ms='5px'
                  fontWeight='500'>
                  Ingresa a tu cuenta
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;