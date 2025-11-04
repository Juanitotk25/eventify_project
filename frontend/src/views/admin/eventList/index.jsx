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

// Chakra imports
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Flex,
    Text,
    Image,
    Button,
    IconButton,
    useColorModeValue,
  } from "@chakra-ui/react";


// Custom components
import { SearchIcon } from "@chakra-ui/icons";
import Card from "components/card/Card.js";

export default function EventList() {
    const [search, setSearch] = useState("");
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const cardBg = useColorModeValue("white", "navy.700");
    
    // Search bar colors matching Horizon UI SearchBar
    const searchIconColor = useColorModeValue("gray.700", "white");
    const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
    const inputText = useColorModeValue("gray.700", "gray.100");

    const events = [
        {
          id: 1,
          title: "Taller de Inteligencia Artificial",
          date: "5 de Noviembre, 2025",
          location: "Auditorio Central",
          description: "Aprende a crear modelos de IA con Python.",
          image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        },
        {
          id: 2,
          title: "Festival Universitario de Música",
          date: "12 de Noviembre, 2025",
          location: "Plaza Principal",
          description: "Conciertos, comidas y actividades culturales.",
          image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800",
        },
        {
          id: 3,
          title: "Torneo de Ajedrez",
          date: "20 de Noviembre, 2025",
          location: "Sala 204 - Bloque B",
          description: "Participa y demuestra tus habilidades mentales.",
          image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
        },
      ];
      const filtered = events.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    
      return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            mb="8"
            justifyContent="space-between"
            align={{ base: "start", md: "center" }}
          >
            <Text fontSize="3xl" fontWeight="bold" mb={{ base: "4", md: "0" }}>
              Lista de eventos
            </Text>
    
            {/* Buscador */}
            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement
                children={
                  <IconButton
                    bg='inherit'
                    borderRadius='inherit'
                    _hover='none'
                    _active={{
                      bg: "inherit",
                      transform: "none",
                      borderColor: "transparent",
                    }}
                    _focus={{
                      boxShadow: "none",
                    }}
                    icon={
                      <SearchIcon color={searchIconColor} w='15px' h='15px' />
                    }></IconButton>
                }
              />
              <Input
                variant='search'
                fontSize='sm'
                bg={inputBg}
                color={inputText}
                fontWeight='500'
                _placeholder={{ color: "gray.400", fontSize: "14px" }}
                borderRadius="30px"
                placeholder="Buscar evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Flex>
    
          {/* Lista de eventos */}
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
            {filtered.map((event) => (
              <Card
                key={event.id}
                p="20px"
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  borderRadius="xl"
                  h="180px"
                  w="100%"
                  objectFit="cover"
                  mb="4"
                />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  {event.title}
                </Text>
                <Text color="gray.500" fontSize="sm" mb="1">
                  {event.date} • {event.location}
                </Text>
                <Text fontSize="sm" mb="3" color={textColor}>
                  {event.description}
                </Text>
                <Flex justify="flex-end">
                  <Button colorScheme="blue" size="sm">
                    Ver más
                  </Button>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      );
    }