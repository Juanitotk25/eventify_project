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
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";

// Custom components
import Card from "components/card/Card.js";

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    capacity: "",
    imageUrl: "",
  });

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic will go here
    console.log("Form submitted:", formData);
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Text fontSize="3xl" fontWeight="bold" mb="20px" color={textColor} textAlign="center">
        Crear Nuevo Evento
      </Text>

      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
          {/* Left Column - Basic Info */}
          <Card p="25px">
            <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
              Información Básica
            </Text>

            <FormControl mb="20px">
              <FormLabel
                htmlFor="title"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px">
                Título del Evento<Text color="brand.500">*</Text>
              </FormLabel>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Nombre del evento"
                onChange={handleChange}
                value={formData.title}
                variant="main"
                h="44px"
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
              <FormControl>
                <FormLabel
                  htmlFor="category"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Categoría<Text color="brand.500">*</Text>
                </FormLabel>
                <Select
                  id="category"
                  name="category"
                  placeholder="Seleccionar categoría"
                  onChange={handleChange}
                  value={formData.category}
                  variant="main"
                  h="44px">
                  <option value="academic">Académico</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Deportivo</option>
                  <option value="social">Social</option>
                  <option value="networking">Networking</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel
                  htmlFor="capacity"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Capacidad
                </FormLabel>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="Número de personas"
                  onChange={handleChange}
                  value={formData.capacity}
                  variant="main"
                  h="44px" 
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel
                htmlFor="description"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px">
                Descripción<Text color="brand.500">*</Text>
              </FormLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el evento..."
                onChange={handleChange}
                value={formData.description}
                variant="main"
                rows={6}
              />
            </FormControl>
          </Card>

          {/* Right Column - Date and Location */}
          <Card p="25px">
            <Text fontSize="2xl" fontWeight="bold" mb="20px" color={textColor}>
              Fecha, Ubicación y Imagen
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
              <FormControl>
                <FormLabel
                  htmlFor="startDate"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Fecha Inicio<Text color="brand.500">*</Text>
                </FormLabel>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  onChange={handleChange}
                  value={formData.startDate}
                  variant="main"
                  h="44px"
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  htmlFor="endDate"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Fecha Fin<Text color="brand.500">*</Text>
                </FormLabel>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  onChange={handleChange}
                  value={formData.endDate}
                  variant="main"
                  h="44px"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl mb="20px">
              <FormLabel
                htmlFor="location"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px">
                Ubicación<Text color="brand.500">*</Text>
              </FormLabel>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Lugar del evento"
                onChange={handleChange}
                value={formData.location}
                variant="main"
                h="44px"
              />
            </FormControl>

            <FormControl>
              <FormLabel
                htmlFor="imageUrl"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px">
                URL de la Imagen<Text color="brand.500">*</Text>
              </FormLabel>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                onChange={handleChange}
                value={formData.imageUrl}
                variant="main"
                h="44px"
              />
            </FormControl>
          </Card>
        </SimpleGrid>

        {/* Action Buttons */}
        <Card p="25px">
          <Flex gap="15px" justify="flex-end">
            <Button
              type="submit"
              variant="brand"
              fontSize="sm"
              fontWeight="500"
              h="46px"
              px="40px">
              Crear Evento
            </Button>
            <Button
              type="button"
              variant="lightBrand"
              fontSize="sm"
              fontWeight="500"
              h="46px"
              px="40px">
              Cancelar
            </Button>
          </Flex>
        </Card>
      </form>
    </Box>
  );
}
