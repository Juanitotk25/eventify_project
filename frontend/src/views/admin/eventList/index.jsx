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

import React, { useEffect, useRef, useState } from "react";

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
import axios from "axios";
import moment from "moment";

export default function EventList() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const cardBg = useColorModeValue("white", "navy.700");
    
    // Search bar colors matching Horizon UI SearchBar
    const searchIconColor = useColorModeValue("gray.700", "white");
    const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
    const inputText = useColorModeValue("gray.700", "gray.100");

    const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

    const fetchEvents = async (query) => {
      // Cancel previous request if any
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const token = localStorage.getItem("access_token");
      if (!token) {
        setEvents([]);
        setError("No estás autenticado. Inicia sesión para ver tus eventos.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (query && query.trim()) params.search = query.trim();
        const res = await axios.get(`${API_BASE}/api/events/`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortRef.current.signal,
        });
        setEvents(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          const msg = err.response?.data?.detail || "Error cargando eventos";
          setError(msg);
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    useEffect(() => {
      fetchEvents("");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced search
    useEffect(() => {
      const id = setTimeout(() => {
        fetchEvents(search);
      }, 400);
      return () => clearTimeout(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);
    
      return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            mb="8"
            justifyContent="space-between"
            align={{ base: "start", md: "center" }}
          >
    
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
    
          {/* Estado de carga / error */}
          {loading && <Text color="gray.500" mb="4">Cargando eventos...</Text>}
          {error && !loading && <Text color="red.400" mb="4">{error}</Text>}

          {/* Lista de eventos */}
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
            {events.map((event) => (
              <Card
                key={event.id}
                p="20px"
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
              >
                <Image
                  src={event.cover_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
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
                  {event.start_time ? moment(event.start_time).format("D [de] MMMM, YYYY HH:mm") : "Sin fecha"} • {event.location || "Sin ubicación"}
                </Text>
                <Text fontSize="sm" mb="3" color={textColor}>
                  {event.description || "Sin descripción"}
                </Text>
                <Flex justify="flex-end">
                  <Button colorScheme="blue" size="sm">
                    Ver más
                  </Button>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>

          {!loading && !error && events.length === 0 && (
            <Text color="gray.500" mt="6">No se encontraron eventos.</Text>
          )}
        </Box>
      );
    }