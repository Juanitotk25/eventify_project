import {useEffect, useState} from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Collapse,
  useToast, useColorModeValue,
} from "@chakra-ui/react";
import axios from 'axios'

export default function General(props) {
  const { profile, onUpdate, onChangePassword} = props;
  const toast = useToast();

  const [username, setUsername] = useState("Invitado");

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);
  const [loading, setLoading] = useState(false);

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const bg = useColorModeValue("white", "navy.700");

  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
      <Box p="20px" bg={bg} borderRadius="20px" {...props}>
        <VStack spacing="20px" align="stretch">
          {/* Edit username */}
          <FormControl>
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nuevo usuario"
            />
          </FormControl>

          <Button
              colorScheme="brand"
              onClick={() => onUpdate(username)}
              isLoading={loading}
          >
            Guardar cambios
          </Button>

          {/* Toggle password section */}
          <Button
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
          >
            Cambiar contraseña
          </Button>

          <Collapse in={showPassword} animateOpacity>
            <VStack spacing="16px" mt="10px">
              <FormControl>
                <FormLabel>Contraseña actual</FormLabel>
                <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Nueva contraseña</FormLabel>
                <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormControl>

              <Button
                  colorScheme="red"
                  onClick={() => {
                    onChangePassword(oldPassword, newPassword)
                    setOldPassword("")
                    setNewPassword("")
                    setShowPassword(!showPassword)
                  }}
                  isLoading={loading}
              >
                Actualizar contraseña
              </Button>
            </VStack>
          </Collapse>
        </VStack>
      </Box>
  );
}
