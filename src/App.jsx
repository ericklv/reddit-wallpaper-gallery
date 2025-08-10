import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Global } from "@emotion/react";
import {
  ChakraProvider,
  Box,
  Heading,
  Select,
  Button,
  Image,
  Text,
  useColorMode,
  extendTheme,
} from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useColorModeValue } from "@chakra-ui/react";
import { useRef } from "react";

const theme = extendTheme({
  colors: {
    brand: {
      lightBg: "#DFD0B8",
      darkBg: "#222831",
      lightText: "#222831",
      darkText: "#DFD0B8",
    },
  },
  styles: {
    global: {
      "#root": {
        width: "100vw",
      },
      body: {
        fontFamily: "'Press Start 2P', cursive",
      },
      "h1, h2, h3, h4, h5, h6": {
        fontFamily: "'Press Start 2P', cursive",
      },
    },
  },
  fonts: {
    heading: "'Press Start 2P', cursive",
    body: "'Press Start 2P', cursive",
  },
});

function AppContent() {
  const [wallpapers, setWallpapers] = useState([]);
  const [after, setAfter] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [subreddit, setSubreddit] = useState("wallpapers");
  const [filter, setFilter] = useState("hot");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    setWallpapers([]);
    setAfter(null);
    fetchWallpapers(true);
  }, [subreddit, filter, search]);

  const fetchWallpapers = async (reset = false) => {
    let url = "";
    if (search) {
      url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(search)}&restrict_sr=1&sort=${filter}&after=${reset ? "" : after || ""}`;
    } else {
      url = `https://www.reddit.com/r/${subreddit}/${filter}.json?after=${reset ? "" : after || ""}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    const children = data.data?.children || [];
    const newWallpapers = children
      .map((c) => ({
        id: c.data.id,
        title: c.data.title,
        thumbnail:
          c.data.preview?.images?.[0]?.resolutions?.[2]?.url?.replace(
            /&amp;/g,
            "&",
          ) || c.data.thumbnail,
        fullUrl: c.data.url_overridden_by_dest,
      }))
      .filter(
        (w) =>
          w.fullUrl &&
          (w.fullUrl.endsWith(".jpg") || w.fullUrl.endsWith(".png")) &&
          w.thumbnail &&
          w.thumbnail.startsWith("http"),
      );
    setWallpapers((prev) =>
      reset ? newWallpapers : [...prev, ...newWallpapers],
    );
    setAfter(data.data.after);
  };

  const SUBREDDITS = [
    "wallpapers",
    "topwalls",
    "AestheticWallpapers",
    "WQHD_Wallpaper",
  ];

  // Definir colores según el tema
  const bg = useColorModeValue("brand.lightBg", "brand.darkBg");
  const color = useColorModeValue("brand.lightText", "brand.darkText");

  // Ref para el grid de imágenes
  const gridRef = useRef();

  // Efecto para cargar imágenes hasta cubrir la altura de la página
  useEffect(() => {
    if (
      after &&
      gridRef.current &&
      gridRef.current.offsetHeight < window.innerHeight
    ) {
      fetchWallpapers();
    }
    // eslint-disable-next-line
  }, [wallpapers.length, after]);

  return (
    <>
      <Global
        styles={`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}
      />
      <Box
        p={4}
        borderBottom="4px solid"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={4}
        bg={bg}
        color={color}
        transition="background 0.3s, color 0.3s"
      >
        <Heading size="lg" textAlign="center">
          Reddit Wallpapers Gallery
        </Heading>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          alignItems="center"
          justifyContent="center"
        >
          <Select
            fontSize="xs"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            width="auto"
            border="2px solid"
            minW="120px"
            sx={{ height: "32px" }}
          >
            {SUBREDDITS.map((subreddit) => (
              <option key={subreddit} value={subreddit}>
                {"r/" + subreddit}
              </option>
            ))}
          </Select>
          <Select
            fontSize="xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            width="auto"
            border="2px solid"
            minW="100px"
            sx={{ height: "32px" }}
          >
            <option value="hot">Hot</option>
            <option value="new">New</option>
            <option value="top">Top</option>
            <option value="rising">Rising</option>
            <option value="relevance">Relevance</option>
            <option value="comments">Comments</option>
          </Select>
          <Box
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
            }}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <input
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "0.8em",
                padding: "0.3em 0.6em",
                border: "2px solid",
                borderRadius: "4px",
                background: "inherit",
                color: "inherit",
                outline: "none",
                height: "32px",
                boxSizing: "border-box",
              }}
              type="text"
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              border="2px solid"
              sx={{ height: "32px" }}
            >
              Buscar
            </Button>
          </Box>
          <Button
            onClick={toggleColorMode}
            size="sm"
            border="2px solid"
            sx={{ height: "32px" }}
          >
            {colorMode === "light" ? <FaMoon /> : <FaSun />}
          </Button>
        </Box>
      </Box>

      <InfiniteScroll
        dataLength={wallpapers.length}
        next={fetchWallpapers}
        hasMore={!!after}
        loader={<Text textAlign="center">LOADING...</Text>}
      >
        <Box
          ref={gridRef}
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
          gap={4}
          p={4}
        >
          {wallpapers.map((w) => (
            <Box
              key={w.id}
              cursor="pointer"
              display="flex"
              flexDirection="column"
              alignItems="center"
              border="2px solid"
              p={2}
              onClick={() => setModalImage(w)}
              bg={bg}
              color={color}
              transition="background 0.3s, color 0.3s"
            >
              <Image
                src={w.thumbnail}
                alt={w.title}
                boxSize="120px"
                objectFit="cover"
                borderRadius="md"
                mb={2}
              />
              <Text
                mt={2}
                fontSize="xs"
                noOfLines={2}
                textAlign="center"
                w="full"
              >
                {w.title}
              </Text>
            </Box>
          ))}
        </Box>
      </InfiniteScroll>
      {modalImage && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg={useColorModeValue("rgba(34,40,49,0.7)", "rgba(223,208,184,0.7)")}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10000}
          onClick={() => setModalImage(null)}
        >
          <Box
            p={4}
            border="4px solid"
            bg={bg}
            color={color}
            maxW="90vw"
            maxH="90vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            position="relative"
            transition="background 0.3s, color 0.3s"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={modalImage.fullUrl}
              alt={modalImage.title}
              maxH="80vh"
              maxW="80vw"
              mb={4}
              borderRadius="md"
            />
            <Text fontSize="sm" mb={2} textAlign="center">
              {modalImage.title}
            </Text>
            <Box
              display="flex"
              gap={2}
              mt={2}
              mb={2}
              width="100%"
              justifyContent="center"
            >
              <Button
                as="a"
                href={modalImage.fullUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                border="2px solid"
              >
                Descargar
              </Button>
              <Button
                onClick={() => setModalImage(null)}
                border="2px solid"
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export default function App() {
  // ChakraProvider ahora recibe el theme personalizado global
  return (
    <ChakraProvider theme={theme}>
      <AppContent />
    </ChakraProvider>
  );
}
