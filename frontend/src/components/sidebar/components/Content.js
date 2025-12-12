// chakra imports
import {Box, Flex, Image, Stack} from "@chakra-ui/react";
//   Custom components
import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import React from "react";
import sideBarIllustration from "../../../assets/img/elephant.png";

// FUNCTIONS

function SidebarContent(props) {
  const { routes } = props;
  // SIDEBAR
  return (
    <Flex direction='column' height='100%' pt='25px' px="16px" borderRadius='30px'>
      <Brand />
      <Stack direction='column' mb='auto' mt='8px'>
        <Box ps='20px' pe={{ md: "16px", "2xl": "1px" }}>
          <Links routes={routes} />
        </Box>
      </Stack>
        <Box position="relative" mt="auto" py={1}>
            <Image
                src={sideBarIllustration}
                alt="Elephant"
                style={{ width: "12vw", height: "auto" }}
            />
        </Box>
    </Flex>
  );
}

export default SidebarContent;
