import React from "react";

// Chakra imports
import {Flex, Image, useColorModeValue} from "@chakra-ui/react";

// Custom components
import brandLogoLight from "assets/img/bannerLogo.png"
import brandLogoDark from "assets/img/bannerLogoDark.png"
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //
  let logoMode = useColorModeValue(brandLogoLight,brandLogoDark );

  return (
    <Flex align='center' direction='column'>
        <Image
            src={logoMode}
            alt="Logo Eventify"
            style={{ width: "20vw", height: "auto" }}
        />
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
