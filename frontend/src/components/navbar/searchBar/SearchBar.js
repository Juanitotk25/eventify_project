import React, { useCallback, useState } from "react";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
export function SearchBar(props) {
  // Public API: controlled/uncontrolled input + onSearch
  // - value/onChange: controlled mode
  // - defaultValue: initial value for uncontrolled mode
  // - onSearch(text): called on Enter key or icon click
  const {
    background,
    placeholder,
    borderRadius,
    value,
    defaultValue,
    onChange,
    onSearch,
    ...rest
  } = props;
  // Chakra Color Mode
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const inputText = useColorModeValue("gray.700", "gray.100");

  // Uncontrolled support if no external value provided
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = useCallback(
    (e) => {
      if (onChange) onChange(e);
      if (value === undefined) setInternalValue(e.target.value);
    },
    [onChange, value]
  );

  const triggerSearch = useCallback(() => {
    if (onSearch) onSearch(currentValue);
  }, [onSearch, currentValue]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        // Prevent accidental form submissions if nested in a form
        e.preventDefault?.();
        triggerSearch();
      }
    },
    [triggerSearch]
  );
  return (
    <InputGroup w={{ base: "100%", md: "200px" }} {...rest}>
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
            aria-label='Search'
            onClick={triggerSearch}
            icon={
              <SearchIcon color={searchIconColor} w='15px' h='15px' />
            }></IconButton>
        }
      />
      <Input
        variant='search'
        fontSize='sm'
        bg={background ? background : inputBg}
        color={inputText}
        fontWeight='500'
        _placeholder={{ color: "gray.400", fontSize: "14px" }}
        borderRadius={borderRadius ? borderRadius : "30px"}
        placeholder={placeholder ? placeholder : "Search..."}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </InputGroup>
  );
}
